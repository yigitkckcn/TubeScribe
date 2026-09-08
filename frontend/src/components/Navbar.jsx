import { Loader2, Search, Moon, Sun } from 'lucide-react'
import { useState } from 'react'

export default function Navbar({ onSearch, isLoading, onReset, theme, onToggleTheme }) {
  const [query, setQuery] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <nav className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800">
      {/* Logo — tıklayınca ana sayfaya dön */}
      <div
        onClick={onReset}
        className="flex items-center gap-2 shrink-0 cursor-pointer group"
      >
        <div className="w-8 h-8 bg-red-600 group-hover:bg-red-500 rounded-lg flex items-center justify-center transition-colors">
          <span className="text-white font-bold text-sm">▶</span>
        </div>
        <span className="text-zinc-900 dark:text-zinc-100 font-semibold text-lg tracking-tight transition-colors">
          TubiScribe
        </span>
      </div>

      {/* Arama çubuğu */}
      <form onSubmit={handleSubmit} className="flex-1 flex justify-center">
        <div className="flex w-full max-w-2xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Video veya playlist ara..."
            className="flex-1 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 px-4 py-2 rounded-l-full border border-zinc-300 dark:border-zinc-700 focus:border-blue-500 focus:outline-none text-sm"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-5 rounded-r-full border border-l-0 border-zinc-300 dark:border-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Search size={18} />
            )}
          </button>
        </div>
      </form>

      {/* Theme Toggle */}
      <div className="w-28 shrink-0 flex justify-end">
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Aydınlık Tema' : 'Karanlık Tema'}
          className="p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </nav>
  )
}
