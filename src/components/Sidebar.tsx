import { useState } from "react";
import { File, Folder, FolderOpen, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileItem[];
  language?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileItem[];
  currentFile: string;
  onFileSelect: (fileId: string) => void;
  onFileCreate: (name: string, type: 'file' | 'folder') => void;
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const iconClass = "w-4 h-4";
  
  switch (ext) {
    case 'js':
    case 'jsx':
      return <File className={`${iconClass} text-file-js`} />;
    case 'py':
      return <File className={`${iconClass} text-file-py`} />;
    case 'cpp':
    case 'c':
    case 'h':
      return <File className={`${iconClass} text-file-cpp`} />;
    case 'html':
      return <File className={`${iconClass} text-file-html`} />;
    case 'css':
      return <File className={`${iconClass} text-file-css`} />;
    default:
      return <File className={`${iconClass} text-muted-foreground`} />;
  }
};

const Sidebar = ({ isOpen, onClose, files, currentFile, onFileSelect, onFileCreate }: SidebarProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileInput, setShowNewFileInput] = useState(false);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      onFileCreate(newFileName.trim(), 'file');
      setNewFileName('');
      setShowNewFileInput(false);
    }
  };

  const renderFileTree = (items: FileItem[], depth = 0) => {
    return items.map((item) => (
      <div key={item.id} style={{ marginLeft: `${depth * 12}px` }}>
        <div
          className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-fast hover:bg-muted/50 ${
            currentFile === item.id ? 'bg-primary/20 border-l-2 border-primary' : ''
          }`}
          onClick={() => {
            if (item.type === 'folder') {
              toggleFolder(item.id);
            } else {
              onFileSelect(item.id);
            }
          }}
        >
          {item.type === 'folder' ? (
            expandedFolders.has(item.id) ? (
              <FolderOpen className="w-4 h-4 text-primary" />
            ) : (
              <Folder className="w-4 h-4 text-primary" />
            )
          ) : (
            getFileIcon(item.name)
          )}
          <span className="text-sm text-foreground truncate">{item.name}</span>
        </div>
        
        {item.type === 'folder' && expandedFolders.has(item.id) && item.children && (
          <div>
            {renderFileTree(item.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:relative top-0 left-0 h-full w-64 bg-editor-sidebar border-r border-border z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${!isOpen ? 'md:w-0 md:border-0' : ''}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-medium text-foreground">Explorer</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNewFileInput(true)}
              className="p-1.5 hover:bg-muted"
            >
              <Plus size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1.5 hover:bg-muted md:hidden"
            >
              <X size={14} />
            </Button>
          </div>
        </div>

        <div className="p-2 overflow-y-auto h-[calc(100%-60px)]">
          {showNewFileInput && (
            <div className="mb-2 px-2">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFile();
                  if (e.key === 'Escape') setShowNewFileInput(false);
                }}
                placeholder="filename.js"
                className="w-full bg-input border border-border rounded px-2 py-1 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                autoFocus
              />
            </div>
          )}
          
          {renderFileTree(files)}
        </div>
      </div>
    </>
  );
};

export default Sidebar;