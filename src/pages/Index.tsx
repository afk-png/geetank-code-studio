import { useState, useEffect, useRef } from "react";
import { 
  Play, Save, Menu, X, File, Folder, FolderOpen, Plus, Terminal, 
  Settings, Zap, Code, Palette, Type, Monitor, Wifi, WifiOff 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// CodeMirror imports
import { EditorView, keymap, highlightActiveLine, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history } from '@codemirror/commands';
import { search, searchKeymap } from '@codemirror/search';
import { autocompletion } from '@codemirror/autocomplete';

// Types and utilities
import type { FileItem, EditorSettings, Workspace, AIProvider } from '../types';
import { languages, getLanguageFromFilename, getLanguageExtension, getFileIcon } from '../utils/languages';
import { themes, getThemeById } from '../utils/themes';

const CodeEditor = ({ 
  value, 
  onChange, 
  language, 
  settings 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  language: string;
  settings: EditorSettings;
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const theme = getThemeById(settings.theme);
    
    const extensions = [
      lineNumbers(),
      highlightActiveLine(),
      history(),
      search(),
      autocompletion(),
      keymap.of([...defaultKeymap, ...searchKeymap]),
      theme.extension,
      getLanguageExtension(language),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString());
        }
      }),
      ...(settings.wordWrap ? [EditorView.lineWrapping] : []),
      EditorView.theme({
        '&': { 
          height: '100%', 
          fontSize: `${settings.fontSize}px`,
          fontFamily: settings.fontFamily
        },
        '.cm-editor': { height: '100%' },
        '.cm-scroller': { height: '100%' },
        '.cm-content': { 
          padding: '16px', 
          minHeight: '100%',
          tabSize: settings.tabSize
        },
        '.cm-focused': { outline: 'none' },
        '.cm-cursor': {
          borderLeft: settings.smoothCursor ? '2px solid' : '1px solid',
          transition: settings.smoothCursor ? 'all 0.1s ease' : 'none'
        }
      }),
    ];

    const state = EditorState.create({
      doc: value,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [language, settings]);

  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== value) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value,
        },
      });
    }
  }, [value]);

  return (
    <div className="h-full bg-editor-bg rounded-lg overflow-hidden">
      <div ref={editorRef} className="h-full" />
    </div>
  );
};

const Index = () => {
  // Main state
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'untitled.txt',
      language: 'javascript',
      content: '',
      isActive: true
    }
  ]);
  
  const [activeFileId, setActiveFileId] = useState('1');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [outputOpen, setOutputOpen] = useState(false);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAI, setShowAI] = useState(false);
  
  // Workspaces
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    { id: '1', name: 'Default Workspace', files: [] }
  ]);
  const [activeWorkspace, setActiveWorkspace] = useState('1');
  
  // Settings
  const [settings, setSettings] = useState<EditorSettings>({
    wordWrap: true,
    smoothCursor: true,
    fontSize: 14,
    fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
    theme: 'oneDark',
    tabSize: 2,
    lineNumbers: true,
    minimap: false
  });
  
  // AI providers
  const [aiProviders, setAiProviders] = useState<AIProvider[]>([
    { id: 'gpt', name: 'GPT-4', model: 'gpt-4' },
    { id: 'gemini', name: 'Gemini Pro', model: 'gemini-pro' },
    { id: 'deepseek', name: 'DeepSeek', model: 'deepseek-coder' },
    { id: 'grok', name: 'Grok', model: 'grok-beta' }
  ]);
  const [selectedAI, setSelectedAI] = useState<string>('gpt');

  const activeFile = files.find(f => f.id === activeFileId);

  const handleFileSelect = (fileId: string) => {
    setFiles(prev => prev.map(f => ({ ...f, isActive: f.id === fileId })));
    setActiveFileId(fileId);
    setSidebarOpen(false);
  };

  const handleContentChange = (content: string) => {
    setFiles(prev => prev.map(f => 
      f.id === activeFileId ? { ...f, content } : f
    ));
  };

  const handleFileRename = (fileId: string, newName: string) => {
    const newLanguage = getLanguageFromFilename(newName);
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, name: newName, language: newLanguage } : f
    ));
  };

  const addNewFile = () => {
    const newId = Date.now().toString();
    const newFile: FileItem = {
      id: newId,
      name: 'untitled.txt',
      content: '',
      language: 'javascript',
      isActive: true
    };
    
    setFiles(prev => [...prev.map(f => ({ ...f, isActive: false })), newFile]);
    setActiveFileId(newId);
  };

  const removeFile = (fileId: string) => {
    if (files.length === 1) return;
    
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== fileId);
      if (fileId === activeFileId && filtered.length > 0) {
        filtered[0].isActive = true;
        setActiveFileId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleRun = () => {
    setIsRunning(true);
    setOutputOpen(true);

    setTimeout(() => {
      const content = activeFile?.content || '';
      const language = activeFile?.language || 'javascript';
      
      let mockOutput = '';
      
      if (content.trim() === '') {
        mockOutput = 'No code to execute.';
      } else {
        switch (language) {
          case 'javascript':
            mockOutput = content.includes('console.log') 
              ? 'JavaScript executed successfully!\nHello, Geetank IDE!'
              : 'JavaScript code executed successfully!';
            break;
          case 'python':
            mockOutput = content.includes('print') 
              ? 'Python executed successfully!\nHello from Python!'
              : 'Python code executed successfully!';
            break;
          case 'cpp':
            mockOutput = 'C++ compiled and executed successfully!\nHello from C++!';
            break;
          case 'java':
            mockOutput = 'Java compiled and executed successfully!\nHello from Java!';
            break;
          case 'css':
            mockOutput = 'CSS parsed successfully!\nStyles applied.';
            break;
          default:
            mockOutput = `${language} code executed successfully!`;
        }
      }
      
      setOutput(mockOutput);
      setIsRunning(false);
    }, 1000);
  };

  const updateSetting = (key: keyof EditorSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const loadFont = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ttf,.otf,.woff,.woff2';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const fontName = file.name.split('.')[0];
        updateSetting('fontFamily', `"${fontName}", monospace`);
      }
    };
    input.click();
  };

  useEffect(() => {
    if (window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, []);

  return (
    <div className="h-screen bg-gradient-bg flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-12 bg-editor-toolbar border-b border-border flex items-center px-3 shadow-toolbar">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-1.5 hover:bg-muted"
          >
            <Menu size={16} />
          </Button>
          
          <h1 className="text-sm font-bold bg-gradient-primary bg-clip-text text-transparent">
            Geetank IDE
          </h1>
        </div>

        <div className="flex-1 flex items-center justify-center gap-2 px-4">
          {/* File tabs */}
          <div className="flex gap-1 max-w-md overflow-x-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer transition-all ${
                  file.id === activeFileId 
                    ? 'bg-primary/20 text-primary border border-primary/30' 
                    : 'bg-muted/30 hover:bg-muted/50 text-muted-foreground'
                }`}
                onClick={() => handleFileSelect(file.id)}
              >
                <File size={12} className={getFileIcon(file.name)} />
                <span className="max-w-16 truncate">{file.name}</span>
                {files.length > 1 && (
                  <X 
                    size={10} 
                    className="hover:text-destructive" 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                  />
                )}
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={addNewFile}
              className="p-1 h-6 w-6"
            >
              <Plus size={12} />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            onClick={() => setShowAI(!showAI)}
            variant="outline"
            size="sm"
            className="p-1.5 border-border hover:bg-muted"
          >
            <Zap size={14} />
          </Button>
          
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            size="sm"
            className="p-1.5 border-border hover:bg-muted"
          >
            <Settings size={14} />
          </Button>
          
          <Button
            onClick={handleRun}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300 font-medium text-xs px-2 py-1 h-7"
            size="sm"
          >
            <Play size={12} className="mr-1" />
            Run
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            
            <div className="fixed md:relative top-0 left-0 h-full w-60 bg-editor-sidebar border-r border-border z-50">
              <Tabs defaultValue="files" className="h-full flex flex-col">
                <div className="flex items-center justify-between p-2 border-b border-border">
                  <TabsList className="grid w-full grid-cols-2 h-8">
                    <TabsTrigger value="files" className="text-xs">Files</TabsTrigger>
                    <TabsTrigger value="workspace" className="text-xs">Workspace</TabsTrigger>
                  </TabsList>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 hover:bg-muted md:hidden"
                  >
                    <X size={12} />
                  </Button>
                </div>

                <TabsContent value="files" className="flex-1 p-2 m-0">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-all hover:bg-muted/50 group ${
                        file.id === activeFileId ? 'bg-primary/20 border-l-2 border-primary' : ''
                      }`}
                      onClick={() => handleFileSelect(file.id)}
                    >
                      <File size={14} className={getFileIcon(file.name)} />
                      <input
                        type="text"
                        value={file.name}
                        onChange={(e) => handleFileRename(file.id, e.target.value)}
                        className="text-xs bg-transparent border-none outline-none flex-1 text-foreground"
                        onBlur={(e) => {
                          if (!e.target.value.trim()) {
                            handleFileRename(file.id, 'untitled.txt');
                          }
                        }}
                      />
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="workspace" className="flex-1 p-2 m-0">
                  <div className="space-y-2">
                    {workspaces.map((workspace) => (
                      <div
                        key={workspace.id}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-all hover:bg-muted/50 ${
                          workspace.id === activeWorkspace ? 'bg-primary/20' : ''
                        }`}
                        onClick={() => setActiveWorkspace(workspace.id)}
                      >
                        <Folder size={14} className="text-muted-foreground" />
                        <span className="text-xs text-foreground truncate">{workspace.name}</span>
                      </div>
                    ))}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs h-8"
                      onClick={() => {
                        const newWorkspace: Workspace = {
                          id: Date.now().toString(),
                          name: `Workspace ${workspaces.length + 1}`,
                          files: []
                        };
                        setWorkspaces(prev => [...prev, newWorkspace]);
                      }}
                    >
                      <Plus size={12} className="mr-1" />
                      New Workspace
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
        
        {/* Main Editor */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Settings Panel */}
          {showSettings && (
            <div className="absolute top-0 right-0 w-80 h-full bg-editor-sidebar border-l border-border z-40 overflow-y-auto">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Settings</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                    <X size={14} />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs">Word Wrap</label>
                    <input
                      type="checkbox"
                      checked={settings.wordWrap}
                      onChange={(e) => updateSetting('wordWrap', e.target.checked)}
                      className="rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-xs">Smooth Cursor</label>
                    <input
                      type="checkbox"
                      checked={settings.smoothCursor}
                      onChange={(e) => updateSetting('smoothCursor', e.target.checked)}
                      className="rounded"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs">Font Size</label>
                    <input
                      type="range"
                      min="10"
                      max="24"
                      value={settings.fontSize}
                      onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-xs text-muted-foreground">{settings.fontSize}px</span>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs">Font Family</label>
                    <Button variant="outline" size="sm" onClick={loadFont} className="w-full text-xs">
                      Load Custom Font
                    </Button>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs">Theme</label>
                    <select
                      value={settings.theme}
                      onChange={(e) => updateSetting('theme', e.target.value)}
                      className="w-full bg-muted border border-border rounded px-2 py-1 text-xs"
                    >
                      {themes.map((theme) => (
                        <option key={theme.id} value={theme.id}>
                          {theme.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Panel */}
          {showAI && (
            <div className="absolute top-0 right-0 w-80 h-full bg-editor-sidebar border-l border-border z-40 overflow-y-auto">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Coding Agent</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowAI(false)}>
                    <X size={14} />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {aiProviders.map((provider) => (
                    <div key={provider.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id={provider.id}
                          name="ai-provider"
                          checked={selectedAI === provider.id}
                          onChange={() => setSelectedAI(provider.id)}
                        />
                        <label htmlFor={provider.id} className="text-xs font-medium">
                          {provider.name}
                        </label>
                        {provider.apiKey ? <Wifi size={12} className="text-success" /> : <WifiOff size={12} className="text-muted-foreground" />}
                      </div>
                      
                      <input
                        type="password"
                        placeholder="API Key"
                        value={provider.apiKey || ''}
                        onChange={(e) => {
                          setAiProviders(prev => prev.map(p => 
                            p.id === provider.id ? { ...p, apiKey: e.target.value } : p
                          ));
                        }}
                        className="w-full bg-muted border border-border rounded px-2 py-1 text-xs"
                      />
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                    disabled={!aiProviders.find(p => p.id === selectedAI)?.apiKey}
                  >
                    <Code size={12} className="mr-1" />
                    Generate Code
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 p-3">
            <CodeEditor
              value={activeFile?.content || ''}
              onChange={handleContentChange}
              language={activeFile?.language || 'javascript'}
              settings={settings}
            />
          </div>
          
          {/* Output Panel */}
          {outputOpen && (
            <div className="h-48 bg-editor-bg border-t border-border flex flex-col">
              <div className="flex items-center justify-between px-3 py-2 bg-editor-toolbar border-b border-border">
                <div className="flex items-center gap-2">
                  <Terminal size={12} className="text-primary" />
                  <span className="text-xs font-medium">Output</span>
                  {isRunning && <div className="w-1.5 h-1.5 bg-warning rounded-full animate-pulse" />}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOutputOpen(false)}
                  className="p-1 hover:bg-muted"
                >
                  <X size={12} />
                </Button>
              </div>

              <div className="flex-1 p-3 overflow-y-auto font-mono text-xs">
                {isRunning ? (
                  <div className="flex items-center gap-2 text-warning">
                    <Play size={12} className="animate-pulse" />
                    <span>Running code...</span>
                  </div>
                ) : output ? (
                  <pre className="whitespace-pre-wrap text-success">{output}</pre>
                ) : (
                  <div className="text-muted-foreground">
                    No output yet. Click "Run" to execute your code.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;