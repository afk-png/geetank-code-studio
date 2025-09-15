import { useState, useEffect, useRef } from "react";
import { Play, Save, Menu, X, File, Folder, FolderOpen, Plus, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

// Simple CodeMirror implementation
import { EditorView, keymap, highlightActiveLine, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';

interface FileItem {
  id: string;
  name: string;
  content: string;
  language: string;
}

const getLanguageExtension = (language: string) => {
  switch (language) {
    case 'javascript': return javascript();
    case 'python': return python();
    case 'cpp': return cpp();
    default: return javascript();
  }
};

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const iconClass = "w-4 h-4";
  
  switch (ext) {
    case 'js': return <File className={`${iconClass} text-file-js`} />;
    case 'py': return <File className={`${iconClass} text-file-py`} />;
    case 'cpp': return <File className={`${iconClass} text-file-cpp`} />;
    default: return <File className={`${iconClass} text-muted-foreground`} />;
  }
};

const CodeEditor = ({ value, onChange, language }: { value: string; onChange: (value: string) => void; language: string }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const extensions = [
      lineNumbers(),
      highlightActiveLine(),
      history(),
      keymap.of([...defaultKeymap]),
      oneDark,
      getLanguageExtension(language),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString());
        }
      }),
      EditorView.theme({
        '&': { height: '100%', fontSize: '14px' },
        '.cm-editor': { height: '100%' },
        '.cm-scroller': { height: '100%' },
        '.cm-content': { padding: '16px', minHeight: '100%' },
        '.cm-focused': { outline: 'none' },
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
  }, [language]);

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
  const [files] = useState<FileItem[]>([
    {
      id: 'welcome.js',
      name: 'welcome.js',
      language: 'javascript',
      content: `// Welcome to Geetank IDE! 🚀
console.log("Hello, Geetank IDE!");

function greet(name) {
  return \`Welcome to Geetank IDE, \${name}!\`;
}

console.log(greet("Developer"));

// Features:
// ✓ Syntax highlighting
// ✓ Multiple languages  
// ✓ Mobile responsive
// ✓ File management
// ✓ Code execution

const features = [
  "CodeMirror Editor",
  "Syntax Highlighting", 
  "Mobile Responsive",
  "File Explorer"
];

features.forEach((feature, index) => {
  console.log(\`\${index + 1}. \${feature}\`);
});`
    },
    {
      id: 'example.py',
      name: 'example.py',
      language: 'python',
      content: `# Python example in Geetank IDE
print("Hello from Python!")

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Calculate first 10 Fibonacci numbers
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")

# Features demo
ide_features = {
    "editor": "CodeMirror",
    "theme": "Dark",
    "mobile": True,
    "languages": ["JavaScript", "Python", "C++"]
}

for key, value in ide_features.items():
    print(f"{key}: {value}")`
    },
    {
      id: 'demo.cpp',
      name: 'demo.cpp',
      language: 'cpp',
      content: `#include <iostream>
#include <vector>
#include <string>

int main() {
    std::cout << "Hello from C++!" << std::endl;
    
    // Fibonacci sequence
    std::vector<int> fib = {0, 1};
    for (int i = 2; i < 10; i++) {
        fib.push_back(fib[i-1] + fib[i-2]);
    }
    
    std::cout << "Fibonacci sequence:" << std::endl;
    for (int i = 0; i < fib.size(); i++) {
        std::cout << "F(" << i << ") = " << fib[i] << std::endl;
    }
    
    return 0;
}`
    }
  ]);

  const [currentFile, setCurrentFile] = useState('welcome.js');
  const [currentLanguage, setCurrentLanguage] = useState('javascript');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [outputOpen, setOutputOpen] = useState(false);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [fileContents, setFileContents] = useState<Record<string, string>>({
    'welcome.js': files[0].content,
    'example.py': files[1].content,
    'demo.cpp': files[2].content,
  });

  const languages = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'python', name: 'Python' },
    { id: 'cpp', name: 'C++' },
  ];

  const handleFileSelect = (fileId: string) => {
    setCurrentFile(fileId);
    const file = files.find(f => f.id === fileId);
    if (file) {
      setCurrentLanguage(file.language);
    }
    setSidebarOpen(false);
  };

  const handleContentChange = (content: string) => {
    setFileContents(prev => ({
      ...prev,
      [currentFile]: content
    }));
  };

  const handleRun = () => {
    setIsRunning(true);
    setOutputOpen(true);

    setTimeout(() => {
      const content = fileContents[currentFile];
      
      if (currentLanguage === 'javascript') {
        const mockOutput = content.includes('console.log') 
          ? `Hello, Geetank IDE!
Welcome to Geetank IDE, Developer!
1. CodeMirror Editor
2. Syntax Highlighting
3. Mobile Responsive
4. File Explorer`
          : 'JavaScript executed successfully!';
        setOutput(mockOutput);
      } else if (currentLanguage === 'python') {
        const mockOutput = `Hello from Python!
F(0) = 0
F(1) = 1
F(2) = 1
F(3) = 2
F(4) = 3
F(5) = 5
F(6) = 8
F(7) = 13
F(8) = 21
F(9) = 34
editor: CodeMirror
theme: Dark
mobile: True
languages: ['JavaScript', 'Python', 'C++']`;
        setOutput(mockOutput);
      } else if (currentLanguage === 'cpp') {
        const mockOutput = `Hello from C++!
Fibonacci sequence:
F(0) = 0
F(1) = 1
F(2) = 1
F(3) = 2
F(4) = 3
F(5) = 5
F(6) = 8
F(7) = 13
F(8) = 21
F(9) = 34`;
        setOutput(mockOutput);
      }
      
      setIsRunning(false);
    }, 1000);
  };

  useEffect(() => {
    if (window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, []);

  return (
    <div className="h-screen bg-gradient-bg flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-editor-toolbar border-b border-border flex items-center px-4 shadow-toolbar">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-muted"
          >
            <Menu size={18} />
          </Button>
          
          <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
            Geetank IDE
          </h1>
        </div>

        <div className="flex-1 flex items-center justify-center gap-2">
          <select
            value={currentLanguage}
            onChange={(e) => setCurrentLanguage(e.target.value)}
            className="bg-muted border border-border rounded px-3 py-1.5 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => console.log('File saved')}
            variant="outline"
            size="sm"
            className="hidden sm:flex border-border hover:bg-muted"
          >
            <Save size={16} className="mr-1" />
            Save
          </Button>
          
          <Button
            onClick={handleRun}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300 font-medium"
            size="sm"
          >
            <Play size={16} className="mr-1" />
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
            
            <div className="fixed md:relative top-0 left-0 h-full w-64 bg-editor-sidebar border-r border-border z-50">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-medium text-foreground">Explorer</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 hover:bg-muted md:hidden"
                >
                  <X size={14} />
                </Button>
              </div>

              <div className="p-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-all hover:bg-muted/50 ${
                      currentFile === file.id ? 'bg-primary/20 border-l-2 border-primary' : ''
                    }`}
                    onClick={() => handleFileSelect(file.id)}
                  >
                    {getFileIcon(file.name)}
                    <span className="text-sm text-foreground truncate">{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* Main Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-4">
            <CodeEditor
              value={fileContents[currentFile] || ''}
              onChange={handleContentChange}
              language={currentLanguage}
            />
          </div>
          
          {/* Output Panel */}
          {outputOpen && (
            <div className="h-64 bg-editor-bg border-t border-border flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-editor-toolbar border-b border-border">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-primary" />
                  <span className="text-sm font-medium">Output</span>
                  {isRunning && <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOutputOpen(false)}
                  className="p-1.5 hover:bg-muted"
                >
                  <X size={14} />
                </Button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
                {isRunning ? (
                  <div className="flex items-center gap-2 text-warning">
                    <Play size={14} className="animate-pulse" />
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