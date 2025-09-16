import { useEffect, useMemo, useRef, useState } from 'react'
import Editor, { Monaco } from '@monaco-editor/react'
import { registerExtraLanguages, getLanguageFromFilename, type LanguageId } from './languages'
import { registerThemes, themeOptions } from './themes'

// Types
type FileItem = { id: string; name: string; language: LanguageId; content: string; isActive?: boolean }
type Workspace = { id: string; name: string; fileIds: string[] }

type EditorSettings = {
  wordWrap: boolean
  smoothCursor: boolean
  fontSize: number
  fontFamily: string
  theme: string
}

type AIProvider = { id: 'gpt'|'gemini'|'deepseek'|'grok'; name: string; model: string; apiKey?: string }

// Helpers
const uid = () => Math.random().toString(36).slice(2)
const storage = {
  load<T>(k: string, d: T): T { try { return JSON.parse(localStorage.getItem(k) || ''); } catch { return d }},
  save<T>(k: string, v: T) { localStorage.setItem(k, JSON.stringify(v)) }
}

export default function App() {
  // Files & workspaces
  const [files, setFiles] = useState<FileItem[]>(() => storage.load<FileItem[]>('files', [
    { id: uid(), name: 'untitled.txt', language: 'plaintext', content: '', isActive: true },
  ]))
  const [activeFileId, setActiveFileId] = useState<string>(() => storage.load('activeFileId', files[0].id))
  const activeFile = files.find(f => f.id === activeFileId) || files[0]

  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => storage.load('workspaces', [
    { id: 'default', name: 'Default', fileIds: files.map(f=>f.id) }
  ]))
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => storage.load('activeWorkspaceId', 'default'))

  // Settings
  const [settings, setSettings] = useState<EditorSettings>(() => storage.load('settings', {
    wordWrap: true,
    smoothCursor: true,
    fontSize: 14,
    fontFamily: 'SF Mono, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    theme: 'onedark'
  }))

  // Fonts
  const [fonts, setFonts] = useState<string[]>(() => storage.load('fonts', [
    'SF Mono', 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'IBM Plex Mono', 'Source Code Pro', 'Menlo', 'Monaco', 'Consolas'
  ]))

  // Panels
  const [showSidebar, setShowSidebar] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [outputOpen, setOutputOpen] = useState(false)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)

  // AI providers
  const [aiProviders, setAiProviders] = useState<AIProvider[]>(() => storage.load('aiProviders', [
    { id: 'gpt', name: 'GPT-4', model: 'gpt-4' },
    { id: 'gemini', name: 'Gemini Pro', model: 'gemini-pro' },
    { id: 'deepseek', name: 'DeepSeek', model: 'deepseek-coder' },
    { id: 'grok', name: 'Grok', model: 'grok-beta' },
  ]))
  const [selectedAI, setSelectedAI] = useState<'gpt'|'gemini'|'deepseek'|'grok'>('gpt')

  // Monaco refs
  const monacoRef = useRef<Monaco | null>(null)
  const editorRef = useRef<any>(null)

  // Persist
  useEffect(() => { storage.save('files', files) }, [files])
  useEffect(() => { storage.save('activeFileId', activeFileId) }, [activeFileId])
  useEffect(() => { storage.save('workspaces', workspaces) }, [workspaces])
  useEffect(() => { storage.save('activeWorkspaceId', activeWorkspaceId) }, [activeWorkspaceId])
  useEffect(() => { storage.save('settings', settings) }, [settings])
  useEffect(() => { storage.save('fonts', fonts) }, [fonts])
  useEffect(() => { storage.save('aiProviders', aiProviders) }, [aiProviders])

  // Handlers: files
  const addNewFile = () => {
    const newFile: FileItem = { id: uid(), name: 'untitled.txt', language: 'plaintext', content: '', isActive: true }
    setFiles(prev => prev.map(f => ({...f, isActive:false})).concat(newFile))
    setActiveFileId(newFile.id)
  }
  const removeFile = (id: string) => {
    setFiles(prev => {
      const next = prev.filter(f=>f.id!==id)
      if (next.length === 0) {
        const nf = { id: uid(), name: 'untitled.txt', language: 'plaintext', content: '', isActive: true }
        setActiveFileId(nf.id)
        return [nf]
      }
      if (id === activeFileId) setActiveFileId(next[0].id)
      return next
    })
  }
  const renameFile = (id: string, name: string) => {
    const lang = getLanguageFromFilename(name)
    setFiles(prev => prev.map(f => f.id===id ? {...f, name, language: lang } : f))
  }
  const updateContent = (id: string, content: string) => {
    setFiles(prev => prev.map(f => f.id===id ? {...f, content } : f))
  }

  // File ops: open/save
  const openFiles = () => {
    const input = document.createElement('input')
    input.type = 'file'; input.multiple = true
    input.onchange = async (e:any) => {
      const list: FileItem[] = []
      const files = Array.from(e.target.files as FileList)
      for (const file of files) {
        const text = await file.text()
        const name = file.name
        const language = getLanguageFromFilename(name)
        list.push({ id: uid(), name, language, content: text })
      }
      if (list.length) {
        setFiles(prev => prev.concat(list))
        setActiveFileId(list[list.length-1].id)
      }
    }
    input.click()
  }
  const download = (name: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = name
    a.click(); URL.revokeObjectURL(url)
  }
  const saveFile = () => { if (activeFile) download(activeFile.name, activeFile.content) }
  const saveFileAs = () => {
    const name = prompt('Save as', activeFile?.name || 'untitled.txt') || 'untitled.txt'
    if (activeFile) download(name, activeFile.content)
  }

  // Run mock
  const runCode = () => {
    setIsRunning(true); setOutput(''); setOutputOpen(true)
    setTimeout(() => {
      const lang = activeFile?.language || 'plaintext'
      const content = activeFile?.content.trim() || ''
      let out = ''
      if (!content) out = 'No code to execute.'
      else if (lang === 'javascript' && content.includes('console.log')) out = 'JavaScript executed successfully!\nHello, Geetank IDE with Monaco!'
      else out = `${lang} code processed successfully!`
      setOutput(out); setIsRunning(false)
    }, 600)
  }

  // Monaco lifecycle
  const handleBeforeMount = (monaco: Monaco) => {
    monacoRef.current = monaco
    registerThemes(monaco)
    registerExtraLanguages(monaco)
  }
  const handleMount = (_: any, editor: any) => {
    editorRef.current = editor
  }

  // Apply theme when changed
  useEffect(() => {
    if (monacoRef.current) monacoRef.current.editor.setTheme(settings.theme)
  }, [settings.theme])

  // Font upload
  const handleFontUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.ttf,.otf,.woff,.woff2'
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0]; if (!file) return
      const arrayBuf = await file.arrayBuffer()
      const fontName = file.name.replace(/\.[^.]+$/, '')
      const font = new FontFace(fontName, arrayBuf)
      await font.load()
      ;(document as any).fonts.add(font)
      setFonts(prev => Array.from(new Set([fontName, ...prev])))
      setSettings(s => ({...s, fontFamily: `${fontName}, ${s.fontFamily}`}))
    }
    input.click()
  }

  // Monaco options
  const editorOptions = useMemo(() => ({
    wordWrap: settings.wordWrap ? 'on' : 'off',
    cursorBlinking: settings.smoothCursor ? 'smooth' as const : 'blink' as const,
    cursorSmoothCaretAnimation: settings.smoothCursor ? 'on' : 'off',
    fontSize: settings.fontSize,
    fontFamily: settings.fontFamily,
    minimap: { enabled: false },
    automaticLayout: true,
    smoothScrolling: true,
    scrollBeyondLastLine: false,
    renderWhitespace: 'selection' as const,
    tabSize: 2,
  }), [settings])

  const setActive = (id: string) => { setFiles(prev => prev.map(f=>({...f, isActive: f.id===id}))); setActiveFileId(id) }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Header */}
      <header className="h-12 flex items-center justify-between px-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--editor-toolbar))] shadow-[var(--shadow-toolbar)]">
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-md hover:bg-[hsl(var(--muted))] transition" onClick={()=>setShowSidebar(s=>!s)} aria-label="Toggle Sidebar">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2Z"/></svg>
          </button>
          <h1 className="text-sm font-bold bg-[var(--gradient-primary)] bg-clip-text text-transparent">Geetank IDE</h1>
        </div>

        {/* Tabs */}
        <div className="flex-1 flex items-center justify-center px-2">
          <div className="flex gap-1 max-w-[60%] overflow-x-auto no-scrollbar">
            {files.map(f => (
              <div key={f.id} onClick={()=>setActive(f.id)}
                   className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs cursor-pointer transition ${f.id===activeFileId? 'bg-[hsl(var(--primary)/0.2)] border border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted)/0.3)] hover:bg-[hsl(var(--muted)/0.6)] text-[hsl(var(--muted-foreground))]'}`}>
                <span className="max-w-28 truncate">{f.name}</span>
                <button className="hover:text-[hsl(var(--destructive))]" onClick={(e)=>{e.stopPropagation(); removeFile(f.id)}}>×</button>
              </div>
            ))}
            <button className="p-1 h-6 w-6 rounded-md bg-[hsl(var(--muted)/0.4)] hover:bg-[hsl(var(--muted)/0.7)]" onClick={addNewFile}>+</button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button onClick={()=>setShowAI(s=>!s)} className="p-1.5 rounded-md border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]">⚡</button>
          <button onClick={()=>setShowSettings(s=>!s)} className="p-1.5 rounded-md border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]">⚙️</button>
          <button onClick={runCode} className="px-2 py-1 h-7 text-xs rounded-md bg-[var(--gradient-primary)] hover:shadow-[var(--shadow-glow)] transition">Run</button>
        </div>
      </header>

      <div className="h-[calc(100vh-3rem)] w-full flex overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <aside className="w-64 h-full border-r border-[hsl(var(--border))] bg-[hsl(var(--editor-sidebar))] animate-slide-in-right">
            <div className="p-2 border-b border-[hsl(var(--border))] flex items-center gap-1">
              <button className="btn" onClick={openFiles}>Open</button>
              <button className="btn" onClick={addNewFile}>New</button>
              <button className="btn" onClick={saveFile}>Save</button>
              <button className="btn" onClick={saveFileAs}>Save As</button>
            </div>
            <div className="p-2 space-y-2 overflow-y-auto h-[calc(100%-40px)]">
              <h3 className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Files</h3>
              {files.map(file => (
                <div key={file.id} onClick={()=>setActive(file.id)} className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer ${file.id===activeFileId ? 'bg-[hsl(var(--primary)/0.15)]' : 'hover:bg-[hsl(var(--muted)/0.5)]'}`}>
                  <input className="bg-transparent outline-none flex-1 text-xs" value={file.name} onChange={e=>renameFile(file.id, e.target.value)} />
                </div>
              ))}

              <h3 className="mt-4 text-xs font-semibold text-[hsl(var(--muted-foreground))]">Workspaces</h3>
              {workspaces.map(w => (
                <div key={w.id} className={`px-2 py-1 rounded-md text-xs cursor-pointer ${w.id===activeWorkspaceId? 'bg-[hsl(var(--primary)/0.15)]' : 'hover:bg-[hsl(var(--muted)/0.5)]'}`} onClick={()=>setActiveWorkspaceId(w.id)}>
                  {w.name}
                </div>
              ))}
              <button className="btn w-full" onClick={()=>{
                const nw = { id: uid(), name: `Workspace ${workspaces.length+1}`, fileIds: files.map(f=>f.id) }
                setWorkspaces(prev=>[...prev, nw]); setActiveWorkspaceId(nw.id)
              }}>New Workspace</button>
            </div>
          </aside>
        )}

        {/* Editor */}
        <main className="flex-1 relative">
          <Editor
            beforeMount={handleBeforeMount}
            onMount={handleMount}
            theme={settings.theme}
            language={activeFile?.language || 'plaintext'}
            value={activeFile?.content || ''}
            onChange={(v)=> updateContent(activeFileId, v || '')}
            options={editorOptions}
            className="h-full"
          />
        </main>

        {/* Settings Panel */}
        {showSettings && (
          <aside className="w-80 h-full border-l border-[hsl(var(--border))] bg-[hsl(var(--editor-sidebar))] animate-slide-in-right p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Settings</h3>
              <button className="btn" onClick={()=>setShowSettings(false)}>✕</button>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label>Word Wrap</label>
              <input type="checkbox" checked={settings.wordWrap} onChange={e=>setSettings(s=>({...s, wordWrap: e.target.checked}))} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label>Smooth Cursor</label>
              <input type="checkbox" checked={settings.smoothCursor} onChange={e=>setSettings(s=>({...s, smoothCursor: e.target.checked}))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Font Size</label>
              <input type="range" min={10} max={24} value={settings.fontSize} onChange={e=>setSettings(s=>({...s, fontSize: parseInt(e.target.value)}))} className="w-full" />
              <div className="text-xs text-[hsl(var(--muted-foreground))]">{settings.fontSize}px</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Font Family</label>
              <select value={settings.fontFamily.split(',')[0]} onChange={e=>setSettings(s=>({...s, fontFamily: `${e.target.value}, ${s.fontFamily}` }))} className="w-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-md px-2 py-1 text-sm">
                {fonts.map(f=> <option key={f} value={f}>{f}</option>)}
              </select>
              <button className="btn w-full" onClick={handleFontUpload}>Load Custom Font</button>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Theme</label>
              <select value={settings.theme} onChange={e=>setSettings(s=>({...s, theme: e.target.value}))} className="w-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-md px-2 py-1 text-sm">
                {themeOptions.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </aside>
        )}

        {/* AI Panel */}
        {showAI && (
          <aside className="w-80 h-full border-l border-[hsl(var(--border))] bg-[hsl(var(--editor-sidebar))] animate-slide-in-right p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Coding Agent</h3>
              <button className="btn" onClick={()=>setShowAI(false)}>✕</button>
            </div>
            {aiProviders.map(p => (
              <div key={p.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="radio" name="ai" checked={p.id===selectedAI} onChange={()=>setSelectedAI(p.id)} />
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className={`ml-auto text-xs ${p.apiKey? 'text-green-500' : 'text-[hsl(var(--muted-foreground))]'}`}>{p.apiKey? 'Connected' : 'Not set'}</span>
                </div>
                <input type="password" placeholder="API Key" value={p.apiKey || ''} onChange={e=>setAiProviders(prev=>prev.map(x=>x.id===p.id?{...x, apiKey:e.target.value}:x))} className="w-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-md px-2 py-1 text-sm" />
              </div>
            ))}
            <button className="btn w-full" disabled={!aiProviders.find(x=>x.id===selectedAI)?.apiKey}>Generate Code</button>
          </aside>
        )}
      </div>

      {/* Output */}
      {outputOpen && (
        <div className="h-40 border-t border-[hsl(var(--border))] bg-[hsl(var(--editor-bg))]">
          <div className="flex items-center justify-between px-3 py-2 bg-[hsl(var(--editor-toolbar))] border-b border-[hsl(var(--border))]">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[hsl(var(--primary))]">›</span>
              <span className="font-medium">Output</span>
              {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--warning))] animate-pulse"/>}
            </div>
            <button className="btn" onClick={()=>setOutputOpen(false)}>✕</button>
          </div>
          <div className="p-3 h-[calc(100%-36px)] overflow-auto text-xs font-mono">
            {isRunning? <div className="text-[hsl(var(--warning))] animate-pulse">Running code...</div> : output ? <pre className="whitespace-pre-wrap text-green-500">{output}</pre> : <div className="text-[hsl(var(--muted-foreground))]">No output yet. Click "Run" to execute.</div>}
          </div>
        </div>
      )}

      <style>{`.btn{padding:.375rem .5rem;border-radius:.5rem;border:1px solid hsl(var(--border));background:transparent;transition:var(--transition-fast)}.btn:hover{background:hsl(var(--muted))}`}</style>
    </div>
  )
}
