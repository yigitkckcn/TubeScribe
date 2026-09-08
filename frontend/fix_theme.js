import fs from 'fs'

const files = [
  'src/components/Sidebar.jsx',
  'src/components/PlaylistTab.jsx',
  'src/components/TranscriptTab.jsx',
  'src/components/SavedTab.jsx',
  'src/components/VideoArea.jsx',
  'src/App.jsx'
]

const replacements = [
  // Sidebar Tabs
  { from: /'text-zinc-100 border-b-2 border-blue-500'/g, to: "'text-zinc-900 dark:text-zinc-100 border-b-2 border-blue-500'" },
  { from: /'text-zinc-500 hover:text-zinc-300'/g, to: "'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'" },
  
  // PlaylistTab & SavedTab active video
  { from: /'bg-zinc-800'/g, to: "'bg-zinc-200 dark:bg-zinc-800'" },
  { from: /'hover:bg-zinc-800\/60'/g, to: "'hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'" },
  { from: /bg-zinc-800/g, to: "bg-zinc-200 dark:bg-zinc-800" }, // wait this might double replace.
  
  // TranscriptTab active line
  { from: /'bg-zinc-800 border-l-2 border-blue-500 pl-1\.5'/g, to: "'bg-zinc-200 dark:bg-zinc-800 border-l-2 border-blue-500 pl-1.5'" },
  { from: /'hover:bg-zinc-800\/60 border-l-2 border-transparent pl-1\.5'/g, to: "'hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 border-l-2 border-transparent pl-1.5'" },
  { from: /'bg-blue-500\/20 text-blue-300'/g, to: "'bg-blue-500/20 text-blue-700 dark:text-blue-300'" },
  { from: /'text-zinc-300 hover:bg-zinc-800'/g, to: "'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'" },

  // TranscriptTab search bar
  { from: /'bg-zinc-800\/50 border-zinc-700 hover:border-zinc-600'/g, to: "'bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'" },
  { from: /'bg-zinc-800 border-blue-500'/g, to: "'bg-zinc-100 dark:bg-zinc-800 border-blue-500'" },
  
  // TranscriptTab Export Modal buttons
  { from: /'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'/g, to: "'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'" },

  // VideoArea.jsx toggle save button
  { from: /'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'/g, to: "'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'" }
]

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8')
  
  // specific fixes
  content = content.replace(/'bg-zinc-800'/g, "'bg-zinc-200 dark:bg-zinc-800'")
  content = content.replace(/'hover:bg-zinc-800\/60'/g, "'hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'")
  
  // Apply all replacements
  replacements.forEach(r => {
    content = content.replace(r.from, r.to)
  })
  
  fs.writeFileSync(file, content)
})
