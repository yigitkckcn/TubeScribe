import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { X, Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

const API = 'http://localhost:8000/api'

export default function BulkDownloadModal({ videos, onClose }) {
  const [formats, setFormats] = useState([])
  const [isLoadingFormats, setIsLoadingFormats] = useState(true)
  const [selectedFormatId, setSelectedFormatId] = useState('')
  const [error, setError] = useState('')

  const [downloadState, setDownloadState] = useState('idle')
  const [progressLog, setProgressLog] = useState({}) 

  useEffect(() => {
    async function fetchFormats() {
      if (videos.length === 0) return
      try {
        const { data } = await axios.get(`${API}/formats/${videos[0].id}`)
        setFormats(data.formats || [])
        if (data.formats?.length > 0) {
          setSelectedFormatId(data.formats[0].format_id)
        }
      } catch (err) {
        setError('Formatlar yüklenemedi.')
      } finally {
        setIsLoadingFormats(false)
      }
    }
    fetchFormats()
  }, [videos])

  const startBulkDownload = async () => {
    if (!selectedFormatId) return
    setDownloadState('downloading')
    
    const initialLog = {}
    videos.forEach(v => {
      initialLog[v.id] = { status: 'waiting', percent: 0 }
    })
    setProgressLog(initialLog)

    for (let i = 0; i < videos.length; i++) {
      const video = videos[i]
      
      setProgressLog(prev => ({
        ...prev,
        [video.id]: { status: 'downloading', percent: 0 }
      }))

      try {
        const startRes = await axios.post(`${API}/download/start`, {
          video_id: video.id,
          format_id: selectedFormatId
        })
        const taskId = startRes.data.task_id

        await new Promise((resolve, reject) => {
          const interval = setInterval(async () => {
            try {
              const statusRes = await axios.get(`${API}/download/status/${taskId}`)
              const { ready, progress, error: dlError } = statusRes.data

              if (dlError) {
                clearInterval(interval)
                setProgressLog(prev => ({ ...prev, [video.id]: { status: 'error', percent: 0 } }))
                resolve() 
              } else if (ready) {
                clearInterval(interval)
                setProgressLog(prev => ({ ...prev, [video.id]: { status: 'ready', percent: 100 } }))
                
                const iframe = document.createElement('iframe')
                iframe.style.display = 'none'
                iframe.src = `${API}/download/file/${taskId}`
                document.body.appendChild(iframe)
                setTimeout(() => document.body.removeChild(iframe), 10000)

                resolve()
              } else {
                setProgressLog(prev => ({ ...prev, [video.id]: { status: 'downloading', percent: progress || 0 } }))
              }
            } catch (err) {
              clearInterval(interval)
              setProgressLog(prev => ({ ...prev, [video.id]: { status: 'error', percent: 0 } }))
              resolve()
            }
          }, 1500)
        })

      } catch (err) {
        setProgressLog(prev => ({ ...prev, [video.id]: { status: 'error', percent: 0 } }))
      }
    }

    setDownloadState('done')
  }

  const completedCount = Object.values(progressLog).filter(v => v.status === 'ready').length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Toplu İndirme ({videos.length} Video)
          </h2>
          {downloadState !== 'downloading' && (
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {downloadState === 'idle' ? (
            <>
              {error ? (
                <div className="text-red-500 text-sm mb-4">{error}</div>
              ) : isLoadingFormats ? (
                <div className="flex justify-center my-8 text-zinc-500">
                  <Loader2 className="animate-spin" size={24} />
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Seçtiğiniz {videos.length} video için indirilecek kaliteyi seçin. Tüm videolar arka arkaya bu formatta indirilecektir.
                  </p>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Format ve Kalite
                  </label>
                  <select
                    value={selectedFormatId}
                    onChange={(e) => setSelectedFormatId(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
                  >
                    {formats.map((fmt, idx) => (
                      <option key={idx} value={fmt.format_id}>
                        {fmt.ext.toUpperCase()} - {fmt.resolution !== 'audio only' ? fmt.resolution : 'Sadece Ses'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {downloadState === 'downloading' ? 'İndiriliyor...' : 'İndirme Tamamlandı!'} 
                ({completedCount} / {videos.length})
              </div>
              
              {videos.map(v => {
                const log = progressLog[v.id] || { status: 'waiting', percent: 0 }
                return (
                  <div key={v.id} className="flex flex-col gap-1.5 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-800 dark:text-zinc-200 line-clamp-1 w-[80%]">{v.title}</span>
                      {log.status === 'waiting' && <span className="text-xs text-zinc-400">Bekliyor</span>}
                      {log.status === 'downloading' && <span className="text-xs text-blue-500 font-medium">{log.percent}%</span>}
                      {log.status === 'ready' && <CheckCircle2 size={16} className="text-green-500" />}
                      {log.status === 'error' && <AlertCircle size={16} className="text-red-500" />}
                    </div>
                    {log.status === 'downloading' && (
                      <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${Math.max(log.percent, 5)}%` }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50 dark:bg-zinc-900/50">
          {downloadState === 'idle' && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={startBulkDownload}
                disabled={isLoadingFormats || !selectedFormatId || !videos.length}
                className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Download size={16} />
                Başlat
              </button>
            </>
          )}

          {downloadState === 'done' && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              Kapat
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
