import json
import os
import shutil
import tempfile
import urllib.request
import functools
from pathlib import Path
from typing import List, Optional
from urllib.parse import quote

import yt_dlp
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from starlette.background import BackgroundTask
from youtube_transcript_api import (
    NoTranscriptFound,
    NotTranslatable,
    TranscriptsDisabled,
    TranslationLanguageNotAvailable,
    YouTubeTranscriptApi,
)

from schemas import (
    AppSettings,
    FormatInfo,
    FormatsResponse,
    LanguageModel,
    PlaylistResponse,
    SavedSyncRequest,
    SavedVideo,
    SummaryRequest,
    SearchResponse,
    SubtitlesResponse,
    TranscriptLine,
    TranscriptResponse,
    VideoResult,
)

app = FastAPI(title="TubiScribe API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

transcript_api = YouTubeTranscriptApi()

# ──────────────────────────── CACHING YARDIMCILARI ───────────────────────
@functools.lru_cache(maxsize=256)
def _get_cached_transcript_list(video_id: str):
    """Aynı videonun dillerini defalarca çekmemek için önbellekler."""
    return transcript_api.list(video_id)

@functools.lru_cache(maxsize=256)
def _get_cached_transcript_lines(video_id: str, lang: str, translate_to: str = None):
    """Aynı videonun aynı dilindeki transkriptini (veya çevirisini) önbellekler."""
    transcript_list = _get_cached_transcript_list(video_id)
    
    transcript = None
    try:
        transcript = transcript_list.find_transcript([lang])
    except NoTranscriptFound:
        pass

    if transcript is None:
        try:
            transcript = next(iter(transcript_list))
        except StopIteration:
            raise ValueError("Hiçbir transkript mevcut değil.")

    fetched = transcript.fetch()
    
    # Güvenlik amaçlı: Eğer obje ise dot notation, sözlük ise dictionary erişimi
    lines = []
    for s in fetched:
        if isinstance(s, dict):
            lines.append(TranscriptLine(text=s["text"], start=s["start"], duration=s["duration"]))
        else:
            lines.append(TranscriptLine(text=s.text, start=s.start, duration=s.duration))

    # IP Ban'ı aşmak için yerleşik API yerine deep-translator kullanıyoruz
    if translate_to and translate_to != transcript.language_code:
        try:
            from deep_translator import GoogleTranslator
            
            chunk_size = 4000
            chunks = []
            current_chunk = []
            current_len = 0

            # Güvenli çeviri için metinleri temizle ve parçalara böl (Google 5000 char limit)
            for line in lines:
                clean_text = line.text.replace("\n", " ").strip()
                if not clean_text:
                    clean_text = " "
                
                if current_len + len(clean_text) > chunk_size and current_chunk:
                    chunks.append("\n".join(current_chunk))
                    current_chunk = []
                    current_len = 0
                
                current_chunk.append(clean_text)
                current_len += len(clean_text) + 1

            if current_chunk:
                chunks.append("\n".join(current_chunk))

            # Thread havuzu yerine sırayla çeviri yapıyoruz (Google 500 / Too Many Requests hatasını önlemek için)
            translated_lines = []
            translator = GoogleTranslator(source='auto', target=translate_to)
            for chunk_str in chunks:
                res = translator.translate(chunk_str)
                if res:
                    translated_lines.extend(res.split("\n"))

            # Sonuçları eşleştir
            for i, line in enumerate(lines):
                if i < len(translated_lines):
                    line.text = translated_lines[i].strip()
        except Exception as e:
            raise ValueError(f"Çeviri işlemi başarısız oldu (Google Translate API): {str(e)}")

    return fetched, lines


# ──────────────────────────── KAYDEDİLENLER VERİTABANI ─────────────────────────
SAVED_DIR = Path("saved")
SAVED_FILE = SAVED_DIR / "saved_videos.json"
SETTINGS_FILE = SAVED_DIR / "settings.json"

def _load_saved() -> list:
    if not SAVED_FILE.exists():
        return []
    try:
        with open(SAVED_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def _save_saved(data: list):
    SAVED_DIR.mkdir(exist_ok=True)
    with open(SAVED_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def _load_settings() -> dict:
    default_settings = {
        "ai_provider": "gemini",
        "ai_api_key": "",
        "smart_memory": True,
        "theme": "dark"
    }
    if not SETTINGS_FILE.exists():
        return default_settings
    try:
        with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
            loaded = json.load(f)
            return {**default_settings, **loaded}
    except Exception:
        return default_settings

def _save_settings(settings: dict):
    SAVED_DIR.mkdir(exist_ok=True)
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(settings, f, ensure_ascii=False, indent=2)

@app.get("/api/settings", response_model=AppSettings)
def get_settings():
    return _load_settings()

@app.post("/api/settings", response_model=AppSettings)
def update_settings(settings: AppSettings):
    data = settings.model_dump()
    _save_settings(data)
    return data

@app.get("/api/saved", response_model=List[SavedVideo])
def get_saved_videos():
    return _load_saved()

@app.post("/api/saved")
def add_saved_video(video: SavedVideo):
    data = _load_saved()
    if not any(v.get("id") == video.id for v in data):
        data.append(video.model_dump())
        _save_saved(data)
    return {"status": "ok"}

@app.delete("/api/saved/{video_id}")
def remove_saved_video(video_id: str):
    data = _load_saved()
    data = [v for v in data if v.get("id") != video_id]
    _save_saved(data)
    return {"status": "ok"}

@app.put("/api/saved/sync")
def sync_saved_videos(req: SavedSyncRequest):
    current_data = {v["id"]: v for v in _load_saved()}
    for new_v in req.videos:
        current_data[new_v.id] = new_v.model_dump()
    _save_saved(list(current_data.values()))
    return {"status": "ok"}


def _format_duration(seconds: Optional[int]) -> str:
    if seconds is None:
        return "0:00"
    seconds = int(seconds)
    h, remainder = divmod(seconds, 3600)
    m, s = divmod(remainder, 60)
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"

def _build_thumbnail(video_id: str) -> str:
    return f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"

def _entry_to_video(entry: dict) -> VideoResult:
    video_id = entry.get("id", "")
    return VideoResult(
        id=video_id,
        title=entry.get("title") or "Gizli/Silinmiş Video",
        channel=entry.get("uploader") or entry.get("channel") or "Bilinmeyen Kanal",
        duration=_format_duration(entry.get("duration")),
        thumbnail=entry.get("thumbnail") or _build_thumbnail(video_id),
    )

def _format_filesize(size: Optional[int]) -> str:
    if not size or size == 0:
        return "Boyut Bilinmiyor"
    if size < 1024 * 1024:
        return f"{size / 1024:.0f} KB"
    if size < 1024 * 1024 * 1024:
        return f"{size / (1024 * 1024):.1f} MB"
    return f"{size / (1024 * 1024 * 1024):.2f} GB"


# ──────────────────────────── 1. ARAMA ────────────────────────────
@app.get("/api/search", response_model=SearchResponse)
def search_videos(q: str = Query(..., min_length=1, description="Arama terimi")):
    # Sayfalama yerine arama limitini 15'ten 40'a çıkarttık.
    ydl_opts = {"quiet": True, "skip_download": True, "extract_flat": True}
    try:
        query_str = q
        if not (q.startswith("http://") or q.startswith("https://")):
            query_str = f"ytsearch40:{q}"
            
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            result = ydl.extract_info(query_str, download=False)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Arama sırasında hata: {exc}")
    
    entries = result.get("entries")
    if entries is None:
        entries = [result]
        
    videos = [_entry_to_video(e) for e in entries if e]
    return SearchResponse(results=videos)


# ──────────────────────────── 2. PLAYLIST ─────────────────────────
@app.get("/api/playlist", response_model=PlaylistResponse)
def get_playlist(url: str = Query(..., description="YouTube playlist URL'si")):
    if "youtube.com" not in url and "youtu.be" not in url:
        raise HTTPException(status_code=400, detail="Geçersiz YouTube URL'si")

    ydl_opts = {"quiet": True, "skip_download": True, "extract_flat": True}
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            result = ydl.extract_info(url, download=False)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Playlist ayrıştırma hatası: {exc}")
    if not result:
        raise HTTPException(status_code=404, detail="Playlist bulunamadı.")
    entries = result.get("entries") or []
    videos = [_entry_to_video(e) for e in entries if e]
    return PlaylistResponse(
        title=result.get("title") or "Bilinmeyen Playlist",
        channel=result.get("uploader") or result.get("channel") or "Bilinmeyen Kanal",
        videos=videos,
    )


# ──────────────────────────── 3. ALT YAZI DİLLERİ ────────────────
@app.get("/api/subtitles/{video_id}", response_model=SubtitlesResponse)
def list_subtitles(video_id: str):
    try:
        transcript_list = _get_cached_transcript_list(video_id)
    except (TranscriptsDisabled, NoTranscriptFound):
        return SubtitlesResponse(languages=[])
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Altyazı bilgisi alınamadı: {exc}")

    languages = []
    for t in transcript_list:
        languages.append(
            LanguageModel(
                language=t.language,
                language_code=t.language_code,
                is_generated=t.is_generated,
                is_translatable=t.is_translatable,
            )
        )
    return SubtitlesResponse(languages=languages)


# ──────────────────────────── 4. TRANSKRİPT ──────────────────────
@app.get("/api/transcript/{video_id}", response_model=TranscriptResponse)
def get_transcript(
    video_id: str,
    lang: str = Query("tr", description="İstenen dil kodu"),
    translate_to: Optional[str] = Query(None, description="Çeviri hedef dil kodu"),
):
    try:
        fetched, lines = _get_cached_transcript_lines(video_id, lang, translate_to)
    except (TranscriptsDisabled, NoTranscriptFound) as exc:
        raise HTTPException(status_code=404, detail=f"Bu video için transkript bulunamadı: {exc}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Transkript verisi alınamadı: {exc}")

    return TranscriptResponse(language="Transkript", language_code=translate_to or lang, transcript=lines)


# ──────────────────────────── 5. VİDEO & SES FORMAT LİSTESİ ────────────
@app.get("/api/formats/{video_id}", response_model=FormatsResponse)
def get_formats(video_id: str):
    ydl_opts = {"quiet": True, "skip_download": True}
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Format bilgisi alınamadı: {exc}")
    if not info:
        raise HTTPException(status_code=404, detail="Video bulunamadı.")

    raw_formats = info.get("formats") or []
    title = info.get("title", "video")

    audio_formats = [f for f in raw_formats if f.get("acodec") != "none" and f.get("vcodec") == "none"]
    best_audio = audio_formats[-1] if audio_formats else None
    best_audio_size = (best_audio.get("filesize") or best_audio.get("filesize_approx") or 0) if best_audio else 0

    video_formats = [f for f in raw_formats if f.get("vcodec") != "none"]
    resolutions = {}
    for f in video_formats:
        h = f.get("height")
        if not h: continue
        if h not in resolutions or (f.get("ext") == "mp4" and resolutions[h].get("ext") != "mp4"):
            resolutions[h] = f

    formats = []
    for h, f in resolutions.items():
        v_size = f.get("filesize") or f.get("filesize_approx") or 0
        total_size = v_size + best_audio_size
        size_str = f" ({_format_filesize(total_size)})" if total_size > 0 else ""
        formats.append(
            FormatInfo(
                format_id=str(h),
                ext="mp4",
                resolution=f"{h}p",
                filesize=total_size,
                url="",
                label=f"🎬 MP4 {h}p{size_str} (Sesli)"
            )
        )

    formats.sort(key=lambda x: -int(x.format_id))

    if best_audio:
        size_str = f" ({_format_filesize(best_audio_size)})" if best_audio_size > 0 else ""
        formats.append(
            FormatInfo(
                format_id="mp3",
                ext="mp3",
                resolution=None,
                filesize=best_audio_size,
                url="",
                label=f"🎵 MP3 Ses{size_str}"
            )
        )

    return FormatsResponse(title=title, formats=formats)


# ──────────────────────────── 6. VİDEO/SES YEREL İNDİRME & BİRLEŞTİRME (TASK SİSTEMİ) ────────────

import threading
import uuid
from pydantic import BaseModel

DOWNLOAD_TASKS = {}

class DownloadRequest(BaseModel):
    video_id: str
    format_id: str

def _run_download_task(task_id: str, video_id: str, format_id: str):
    temp_dir = tempfile.mkdtemp()
    out_tmpl = os.path.join(temp_dir, '%(title)s.%(ext)s')

    ydl_opts = {
        'outtmpl': out_tmpl,
        'quiet': True,
        'noprogress': True,
    }

    def my_hook(d):
        if d['status'] == 'downloading':
            # Örn: " 45.2%" -> "45.2%"
            percent = d.get('_percent_str', '').strip()
            # Renkli terminal karakterlerini temizle
            import re
            percent = re.sub(r'\x1b\[[0-9;]*m', '', percent)
            DOWNLOAD_TASKS[task_id]["progress"] = percent or "İndiriliyor..."
        elif d['status'] == 'finished':
            DOWNLOAD_TASKS[task_id]["progress"] = "Birleştiriliyor (FFmpeg)..."

    ydl_opts['progress_hooks'] = [my_hook]

    if format_id == "mp3":
        ydl_opts['format'] = 'bestaudio/best'
        ydl_opts['postprocessors'] = [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }]
    else:
        ydl_opts['format'] = f"bestvideo[height<={format_id}][ext=mp4]+bestaudio[ext=m4a]/best[height<={format_id}][ext=mp4]/best"
        ydl_opts['merge_output_format'] = 'mp4'

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=True)
            
        files = os.listdir(temp_dir)
        if not files:
            raise Exception("Dosya oluşturulamadı.")
            
        filename = files[0]
        file_path = os.path.join(temp_dir, filename)
        
        DOWNLOAD_TASKS[task_id]["ready"] = True
        DOWNLOAD_TASKS[task_id]["file_path"] = file_path
        DOWNLOAD_TASKS[task_id]["filename"] = filename
        DOWNLOAD_TASKS[task_id]["temp_dir"] = temp_dir
        DOWNLOAD_TASKS[task_id]["progress"] = "Tamamlandı"
        
    except Exception as exc:
        shutil.rmtree(temp_dir, ignore_errors=True)
        DOWNLOAD_TASKS[task_id]["error"] = str(exc)

@app.post("/api/download/start")
def start_download(req: DownloadRequest):
    task_id = str(uuid.uuid4())
    DOWNLOAD_TASKS[task_id] = {
        "ready": False,
        "progress": "Başlatılıyor...",
        "error": None,
        "file_path": None,
        "filename": None,
        "temp_dir": None
    }
    
    t = threading.Thread(target=_run_download_task, args=(task_id, req.video_id, req.format_id))
    t.start()
    
    return {"task_id": task_id}

@app.get("/api/download/status/{task_id}")
def get_download_status(task_id: str):
    task = DOWNLOAD_TASKS.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Görev bulunamadı.")
    return {
        "ready": task["ready"],
        "progress": task["progress"],
        "error": task["error"]
    }

@app.get("/api/download/file/{task_id}")
def get_download_file(task_id: str):
    task = DOWNLOAD_TASKS.get(task_id)
    if not task or not task["ready"]:
        raise HTTPException(status_code=400, detail="Dosya hazır değil veya bulunamadı.")
    
    file_path = task["file_path"]
    filename = task["filename"]
    temp_dir = task["temp_dir"]
    
    def cleanup():
        shutil.rmtree(temp_dir, ignore_errors=True)
        # Görevi bellekten sil
        if task_id in DOWNLOAD_TASKS:
            del DOWNLOAD_TASKS[task_id]

    safe_filename = quote(filename)
    headers = {
        "Content-Disposition": f"attachment; filename*=UTF-8''{safe_filename}",
        "Content-Type": "application/octet-stream",
    }

    return FileResponse(
        path=file_path,
        filename=filename,
        background=BackgroundTask(cleanup),
        headers=headers
    )

# ──────────────────────────── 8. AI SUMMARY ─────────────────────────
@app.post("/api/summarize")
def summarize_transcript(req: SummaryRequest):
    if not req.api_key:
        raise HTTPException(status_code=400, detail="API anahtarı eksik. Lütfen Ayarlar sekmesinden API anahtarınızı girin.")
    
    prompt = (
        "Sen uzman bir asistansın. Aşağıdaki YouTube videosu transkriptini incele ve videonun ana hatlarını, "
        "en önemli noktalarını madde madde, Türkçe olarak özetle. Yanıtında Markdown (kalın, liste vb.) kullanabilirsin.\n\n"
        f"Transkript:\n{req.transcript[:30000]}" # Avoid token limits for extremely long videos
    )
    
    try:
        if req.provider == "gemini":
            from google import genai
            client = genai.Client(api_key=req.api_key)
            
            # 2026 versiyonlu güncel modelleri direkt deneyerek fallback yapıyoruz.
            models_to_try = [
                "gemini-3.6-flash",
                "gemini-3.5-flash",
                "gemini-3.0-flash",
                "gemini-pro",
                "gemma"
            ]
            
            response = None
            last_err = None
            
            for m in models_to_try:
                try:
                    # Google GenAI SDK uyarısına istinaden generate_content yerine Chat API kullanıyoruz.
                    chat = client.chats.create(model=m)
                    res = chat.send_message(prompt)
                    
                    if res and res.text:
                        response = res
                        break # Başarılı olduysa çık
                except Exception as e:
                    last_err = e
                    continue # Hata verirse sıradakine geç
                    
            if not response:
                raise ValueError(f"Hiçbir model kullanılamadı. Son hata: {str(last_err)}")
                
            return {"summary": response.text}
            
        elif req.provider == "openai":
            import openai
            client = openai.OpenAI(api_key=req.api_key)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Sen yardımcı bir asistansın."},
                    {"role": "user", "content": prompt}
                ]
            )
            return {"summary": response.choices[0].message.content}
            
        else:
            raise HTTPException(status_code=400, detail="Bilinmeyen AI sağlayıcısı.")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Yapay zeka servisi hata verdi: {str(e)}")
