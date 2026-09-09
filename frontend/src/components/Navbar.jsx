import { Loader2, Search, Moon, Sun } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

export default function Navbar({ onSearch, isLoading, onReset, theme, onToggleTheme }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const wrapperRef = useRef(null)

  useEffect(() => {
    // Dışarı tıklanınca önerileri kapat
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [wrapperRef])

  useEffect(() => {
    // Debounce query
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length > 1) {
        axios.get(`http://localhost:8000/api/suggest?q=${encodeURIComponent(query)}`)
          .then(res => {
            setSuggestions(res.data.suggestions || [])
            if (res.data.suggestions?.length > 0) setShowSuggestions(true)
          })
          .catch(err => console.error(err))
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 200)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  function handleSubmit(e, forceQuery = null) {
    if (e) e.preventDefault()
    const finalQuery = forceQuery || query
    onSearch(finalQuery)
    setShowSuggestions(false)
    setActiveSuggestion(-1)
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (activeSuggestion < suggestions.length - 1) setActiveSuggestion(prev => prev + 1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (activeSuggestion > 0) setActiveSuggestion(prev => prev - 1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeSuggestion >= 0 && activeSuggestion < suggestions.length) {
        setQuery(suggestions[activeSuggestion])
        handleSubmit(null, suggestions[activeSuggestion])
      } else {
        handleSubmit(null, query)
      }
    }
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
      <div className="flex-1 flex justify-center relative" ref={wrapperRef}>
        <div className="flex w-full max-w-2xl relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveSuggestion(-1)
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Video veya playlist ara..."
            className="flex-1 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 px-4 py-2 rounded-l-full border border-zinc-300 dark:border-zinc-700 focus:border-blue-500 focus:outline-none text-sm relative z-10"
          />
          <button
            onClick={() => handleSubmit(null, query)}
            disabled={isLoading}
            className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-5 rounded-r-full border border-l-0 border-zinc-300 dark:border-zinc-700 transition-colors cursor-pointer disabled:opacity-50 relative z-10"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Search size={18} />
            )}
          </button>
          
          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-14 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50">
              <ul className="py-1.5">
                {suggestions.map((sug, idx) => (
                  <li 
                    key={idx}
                    onClick={() => {
                      setQuery(sug)
                      handleSubmit(null, sug)
                    }}
                    onMouseEnter={() => setActiveSuggestion(idx)}
                    className={`px-4 py-2 text-sm cursor-pointer flex items-center gap-3 transition-colors ${
                      idx === activeSuggestion 
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-medium' 
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <Search size={14} className={idx === activeSuggestion ? 'text-blue-500' : 'text-zinc-400'} />
                    {sug}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

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
