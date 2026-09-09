import PlaylistTab from './PlaylistTab'
import SavedTab from './SavedTab'
import TranscriptTab from './TranscriptTab'

const TABS = [
  { key: 'playlist', label: 'Sıradakiler' },
  { key: 'transcript', label: 'Transkript' },
  { key: 'saved', label: 'Kaydedilenler' },
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
  isDualMode,
  onDualModeChange,
  onSeek,
  currentVideoTime,
  activeTab,
  onTabChange,
  savedVideos,
  onRemoveSaved,
  onImportSaved,
}) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Sekme başlıkları */}
      <div className="flex shrink-0 border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex-1 py-3 text-sm font-medium transition-colors cursor-pointer relative ${
              activeTab === tab.key
                ? 'text-zinc-900 dark:text-zinc-100 border-b-2 border-blue-500'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            {tab.label}
            {tab.key === 'saved' && savedVideos.length > 0 && (
              <span className="ml-1.5 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {savedVideos.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sekme içeriği */}
      <div className="flex flex-col flex-1 overflow-hidden p-2">
        {activeTab === 'playlist' && (
          <PlaylistTab
            videos={searchResults}
            isLoading={isLoading}
            error={searchError}
            currentVideoId={currentVideoId}
            onVideoSelect={onVideoSelect}
          />
        )}
        {activeTab === 'transcript' && (
          <TranscriptTab
            transcript={transcript}
            isLoading={transcriptLoading}
            error={transcriptError}
            availableLangs={availableLangs}
            selectedLang={selectedLang}
            translateTo={translateTo}
            onLangChange={onLangChange}
            onTranslateChange={onTranslateChange}
            isDualMode={isDualMode}
            onDualModeChange={onDualModeChange}
            onSeek={onSeek}
            currentVideoTime={currentVideoTime}
          />
        )}
        {activeTab === 'saved' && (
          <SavedTab
            savedVideos={savedVideos}
            currentVideoId={currentVideoId}
            onVideoSelect={onVideoSelect}
            onRemoveSaved={onRemoveSaved}
            onImportSaved={onImportSaved}
          />
        )}
      </div>
    </div>
  )
}
