from pydantic import BaseModel
from typing import List


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
