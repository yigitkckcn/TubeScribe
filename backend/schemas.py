from pydantic import BaseModel
from typing import List, Optional


class VideoResult(BaseModel):
    id: str
    title: str
    channel: str
    duration: str
    thumbnail: str


class SearchResponse(BaseModel):
    results: List[VideoResult]


class PlaylistResponse(BaseModel):
    title: str
    channel: str
    videos: List[VideoResult]


class LanguageModel(BaseModel):
    language: str
    language_code: str
    is_generated: bool
    is_translatable: bool


class SubtitlesResponse(BaseModel):
    languages: List[LanguageModel]


class TranscriptLine(BaseModel):
    text: str
    start: float
    duration: float


class TranscriptResponse(BaseModel):
    language: str
    language_code: str
    transcript: List[TranscriptLine]


class FormatInfo(BaseModel):
    format_id: str
    ext: str
    resolution: Optional[str] = None
    filesize: Optional[int] = None
    filesize_approx: Optional[int] = None
    fps: Optional[float] = None
    vcodec: Optional[str] = None
    acodec: Optional[str] = None
    url: str
    label: str


class FormatsResponse(BaseModel):
    title: str
    formats: List[FormatInfo]


class SavedVideo(BaseModel):
    id: str
    title: str = ""
    channel: str = ""
    thumbnail: str = ""


class SavedSyncRequest(BaseModel):
    videos: List[SavedVideo]


class SummaryRequest(BaseModel):
    transcript: str
    provider: str
    api_key: str


class AppSettings(BaseModel):
    ai_provider: str = "gemini"
    ai_api_key: str = ""
    smart_memory: bool = True
    theme: str = "dark"
