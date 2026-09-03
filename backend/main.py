from typing import Optional

import yt_dlp
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from youtube_transcript_api import (
    NoTranscriptFound,
    TranscriptsDisabled,
    YouTubeTranscriptApi,
)

from schemas import (
    LanguageModel,
    PlaylistResponse,
    SearchResponse,
    SubtitlesResponse,
    TranscriptLine,
    TranscriptResponse,
    VideoResult,
)

app = FastAPI(title="TubiScribe API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# youtube-transcript-api v1.x instance tabanlı API kullanır
transcript_api = YouTubeTranscriptApi()


def _format_duration(seconds: Optional[int]) -> str:
    """Saniyeleri HH:MM:SS veya MM:SS formatına çevirir."""
    if seconds is None:
        return "0:00"
    seconds = int(seconds)
    h, remainder = divmod(seconds, 3600)
    m, s = divmod(remainder, 60)
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


def _build_thumbnail(video_id: str) -> str:
    """Video ID'den yüksek çözünürlüklü thumbnail URL'si oluşturur."""
    return f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"


def _entry_to_video(entry: dict) -> VideoResult:
    """yt-dlp entry dict'ini VideoResult modeline dönüştürür."""
    video_id = entry.get("id", "")
    return VideoResult(
        id=video_id,
        title=entry.get("title", "Başlık Yok"),
        channel=entry.get("uploader", entry.get("channel", "Bilinmeyen Kanal")),
        duration=_format_duration(entry.get("duration")),
        thumbnail=entry.get("thumbnail") or _build_thumbnail(video_id),
    )


# ──────────────────────────── 1. ARAMA ────────────────────────────


@app.get("/api/search", response_model=SearchResponse)
async def search_videos(q: str = Query(..., min_length=1, description="Arama terimi")):
    ydl_opts = {
        "quiet": True,
        "skip_download": True,
        "extract_flat": True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            result = ydl.extract_info(f"ytsearch15:{q}", download=False)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Arama sırasında hata: {exc}")

    entries = result.get("entries") or []
    videos = [_entry_to_video(e) for e in entries if e]

    return SearchResponse(results=videos)


# ──────────────────────────── 2. PLAYLIST ─────────────────────────


@app.get("/api/playlist", response_model=PlaylistResponse)
async def get_playlist(url: str = Query(..., description="YouTube playlist URL'si")):
    ydl_opts = {
        "quiet": True,
        "skip_download": True,
        "extract_flat": True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            result = ydl.extract_info(url, download=False)
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Playlist ayrıştırma hatası: {exc}"
        )

    if not result:
        raise HTTPException(status_code=404, detail="Playlist bulunamadı.")

    entries = result.get("entries") or []
    videos = [_entry_to_video(e) for e in entries if e]

    return PlaylistResponse(
        title=result.get("title", "Bilinmeyen Playlist"),
        channel=result.get("uploader", result.get("channel", "Bilinmeyen Kanal")),
        videos=videos,
    )


# ──────────────────────────── 3. ALT YAZI DİLLERİ ────────────────


@app.get("/api/subtitles/{video_id}", response_model=SubtitlesResponse)
async def list_subtitles(video_id: str):
    try:
        transcript_list = transcript_api.list(video_id)
    except (TranscriptsDisabled, NoTranscriptFound):
        return SubtitlesResponse(languages=[])
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Altyazı bilgisi alınamadı: {exc}"
        )

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
async def get_transcript(
    video_id: str,
    lang: str = Query("tr", description="İstenen dil kodu"),
    translate_to: Optional[str] = Query(None, description="Çeviri hedef dil kodu"),
):
    try:
        transcript_list = transcript_api.list(video_id)
    except (TranscriptsDisabled, NoTranscriptFound) as exc:
        raise HTTPException(
            status_code=404, detail=f"Bu video için transkript bulunamadı: {exc}"
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Transkript listesi alınamadı: {exc}"
        )

    # İstenen dili bul; bulamazsa ilk mevcut transkripti seç
    try:
        transcript = transcript_list.find_transcript([lang])
    except NoTranscriptFound:
        try:
            transcript = next(iter(transcript_list))
        except StopIteration:
            raise HTTPException(
                status_code=404,
                detail="Hiçbir transkript mevcut değil.",
            )

    # Çeviri isteği varsa uygula
    if translate_to:
        try:
            transcript = transcript.translate(translate_to)
        except Exception as exc:
            raise HTTPException(
                status_code=500, detail=f"Çeviri sırasında hata: {exc}"
            )

    # Veriyi çek
    try:
        fetched = transcript.fetch()
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Transkript verisi alınamadı: {exc}"
        )

    lines = [
        TranscriptLine(
            text=snippet.text,
            start=snippet.start,
            duration=snippet.duration,
        )
        for snippet in fetched
    ]

    return TranscriptResponse(
        language=fetched.language,
        language_code=fetched.language_code,
        transcript=lines,
    )
