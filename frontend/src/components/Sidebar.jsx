import { useState } from 'react'
import PlaylistTab from './PlaylistTab'
import TranscriptTab from './TranscriptTab'

const TABS = [
  { key: 'playlist', label: 'Sıradakiler' },
  { key: 'transcript', label: 'Transkript' },
]

export default function Sidebar({
  searchResults,
  isLoading,
  searchError,
  currentVideoId,
  onVideoSelect,
  transcript,
  transcriptLoading,
  transcriptError,
  availableLangs,
  selectedLang,
  translateTo,
  onLangChange,
  onTranslateChange,
  onSeek,
  currentVideoTime,
}) {
  const [activeTab, setActiveTab] = useState('playlist')

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800 overflow-hidden">
      {/* Sekme başlıkları */}
      <div className="flex shrink-0 border-b border-zinc-800">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab.key
                ? 'text-zinc-100 border-b-2 border-blue-500'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sekme içeriği */}
      <div className="flex flex-col flex-1 overflow-hidden p-2">
        {activeTab === 'playlist' ? (
          <PlaylistTab
            videos={searchResults}
            isLoading={isLoading}
            error={searchError}
            currentVideoId={currentVideoId}
            onVideoSelect={onVideoSelect}
          />
        ) : (
          <TranscriptTab
            transcript={transcript}
            isLoading={transcriptLoading}
            error={transcriptError}
            availableLangs={availableLangs}
            selectedLang={selectedLang}
            translateTo={translateTo}
            onLangChange={onLangChange}
            onTranslateChange={onTranslateChange}
            onSeek={onSeek}
            currentVideoTime={currentVideoTime}
          />
        )}
      </div>
    </div>
  )
}
