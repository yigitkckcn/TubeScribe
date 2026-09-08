import fs from 'fs'

const files = [
  'src/App.jsx',
  'src/components/Navbar.jsx',
  'src/components/Sidebar.jsx',
  'src/components/VideoArea.jsx',
  'src/components/PlaylistTab.jsx',
  'src/components/TranscriptTab.jsx',
  'src/components/SavedTab.jsx'
]

function replaceClasses(content) {
  // Regex to match exact tailwind classes with optional prefixes like hover:, focus:
  // We use a function replacement to append the dark version.
  
  const map = {
    'bg-zinc-950': 'bg-zinc-50 dark:bg-zinc-950',
    'bg-zinc-900': 'bg-white dark:bg-zinc-900',
    'bg-zinc-800/80': 'bg-zinc-100/80 dark:bg-zinc-800/80',
    'bg-zinc-800/60': 'bg-zinc-100/60 dark:bg-zinc-800/60',
    'bg-zinc-800/50': 'bg-zinc-100/50 dark:bg-zinc-800/50',
    'bg-zinc-800': 'bg-zinc-100 dark:bg-zinc-800',
    'bg-zinc-700': 'bg-zinc-200 dark:bg-zinc-700',
    'text-zinc-100': 'text-zinc-900 dark:text-zinc-100',
    'text-zinc-200': 'text-zinc-800 dark:text-zinc-200',
    'text-zinc-300': 'text-zinc-700 dark:text-zinc-300',
    'text-zinc-400': 'text-zinc-600 dark:text-zinc-400',
    'text-zinc-500': 'text-zinc-500 dark:text-zinc-500', // same
    'text-zinc-600': 'text-zinc-500 dark:text-zinc-600',
    'border-zinc-800': 'border-zinc-200 dark:border-zinc-800',
    'border-zinc-700': 'border-zinc-300 dark:border-zinc-700',
    'border-zinc-600': 'border-zinc-300 dark:border-zinc-600'
  }

  // Find all class strings in className="..."
  return content.replace(/className=(["'`])(.*?)\1/g, (match, quote, classList) => {
    const classes = classList.split(/\s+/)
    const newClasses = classes.map(cls => {
      // Extract prefix if any
      const parts = cls.split(':')
      const baseClass = parts.pop()
      const prefixes = parts.join(':')
      
      if (map[baseClass]) {
        const replacement = map[baseClass]
        // Apply prefixes to both parts
        const replacementClasses = replacement.split(' ')
        return replacementClasses.map(rc => prefixes ? `${prefixes}:${rc}` : rc).join(' ')
      }
      return cls
    })
    
    return `className=${quote}${newClasses.join(' ')}${quote}`
  })
}

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8')
  let newContent = replaceClasses(content)
  fs.writeFileSync(file, newContent)
})
