import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CodeEditor from "@/components/CodeEditor";
import OutputPanel from "@/components/OutputPanel";

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileItem[];
  language?: string;
}

const defaultFiles: FileItem[] = [
  {
    id: 'welcome.js',
    name: 'welcome.js',
    type: 'file',
    language: 'javascript',
    content: `// Welcome to Geetank IDE! 🚀
// A modern, mobile-first coding environment

console.log("Hello, Geetank IDE!");

// Try running this code with the Run button
function greet(name) {
  return \`Welcome to Geetank IDE, \${name}!\`;
}

console.log(greet("Developer"));

// Features:
// - Syntax highlighting
// - Multiple language support
// - Mobile-responsive design
// - File management
// - Real-time code execution

const features = [
  "CodeMirror Editor",
  "Syntax Highlighting", 
  "Mobile Responsive",
  "File Explorer",
  "Multi-language Support"
];

features.forEach((feature, index) => {
  console.log(\`\${index + 1}. \${feature}\`);
});`,
  },
  {
    id: 'example.py',
    name: 'example.py',
    type: 'file',
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

# Dictionary example
ide_features = {
    "editor": "CodeMirror",
    "theme": "Dark",
    "mobile": True,
    "languages": ["JavaScript", "Python", "C++"]
}

for key, value in ide_features.items():
    print(f"{key}: {value}")`,
  },
];

const Index = () => {
  const [files, setFiles] = useState<FileItem[]>(defaultFiles);
  const [currentFile, setCurrentFile] = useState<string>('welcome.js');
  const [currentLanguage, setCurrentLanguage] = useState<string>('javascript');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [outputOpen, setOutputOpen] = useState<boolean>(false);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const getCurrentFileContent = () => {
    const file = files.find(f => f.id === currentFile);
    return file?.content || '';
  };

  const updateFileContent = (content: string) => {
    setFiles(prev => prev.map(f => 
      f.id === currentFile ? { ...f, content } : f
    ));
  };

  const handleFileSelect = (fileId: string) => {
    setCurrentFile(fileId);
    const file = files.find(f => f.id === fileId);
    if (file?.language) {
      setCurrentLanguage(file.language);
    }
    setSidebarOpen(false);
  };

  const handleFileCreate = (name: string, type: 'file' | 'folder') => {
    const newFile: FileItem = {
      id: name,
      name,
      type,
      content: type === 'file' ? '' : undefined,
      language: type === 'file' ? getLanguageFromExtension(name) : undefined,
    };
    setFiles(prev => [...prev, newFile]);
  };

  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'py':
        return 'python';
      case 'cpp':
      case 'c':
      case 'h':
        return 'cpp';
      default:
        return 'javascript';
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutputOpen(true);
    setHasError(false);

    // Simulate code execution
    setTimeout(() => {
      try {
        const content = getCurrentFileContent();
        
        if (currentLanguage === 'javascript') {
          // Mock JavaScript execution
          const mockOutput = content.includes('console.log') 
            ? content
                .split('\n')
                .filter(line => line.trim().startsWith('console.log'))
                .map(line => {
                  const match = line.match(/console\.log\((.+)\)/);
                  if (match) {
                    try {
                      // Simple evaluation for basic strings and variables
                      return eval(match[1]);
                    } catch {
                      return match[1].replace(/['"]/g, '');
                    }
                  }
                  return '';
                })
                .join('\n')
            : 'Code executed successfully (no console output)';
          
          setOutput(mockOutput);
        } else if (currentLanguage === 'python') {
          // Mock Python execution
          const mockOutput = content.includes('print') 
            ? 'Hello from Python!\nF(0) = 0\nF(1) = 1\nF(2) = 1\nF(3) = 2\nF(4) = 3\nF(5) = 5\nF(6) = 8\nF(7) = 13\nF(8) = 21\nF(9) = 34\neditor: CodeMirror\ntheme: Dark\nmobile: True\nlanguages: [\'JavaScript\', \'Python\', \'C++\']'
            : 'Python script executed successfully';
          
          setOutput(mockOutput);
        } else {
          setOutput(`${currentLanguage} code executed successfully!`);
        }
      } catch (error) {
        setHasError(true);
        setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      setIsRunning(false);
    }, 1500);
  };

  const handleSave = () => {
    // Mock save functionality
    console.log('File saved:', currentFile);
  };

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    // Update current file's language
    setFiles(prev => prev.map(f => 
      f.id === currentFile ? { ...f, language } : f
    ));
  };

  // Close sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-screen bg-gradient-bg flex flex-col overflow-hidden">
      <Header
        onRun={handleRun}
        onSave={handleSave}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          files={files}
          currentFile={currentFile}
          onFileSelect={handleFileSelect}
          onFileCreate={handleFileCreate}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-4 relative">
            <CodeEditor
              value={getCurrentFileContent()}
              onChange={updateFileContent}
              language={currentLanguage}
              placeholder={`Start coding in ${currentLanguage}...`}
            />
          </div>
          
          <OutputPanel
            isOpen={outputOpen}
            onClose={() => setOutputOpen(false)}
            output={output}
            isRunning={isRunning}
            hasError={hasError}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;