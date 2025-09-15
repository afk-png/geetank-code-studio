import { Play, Save, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onRun: () => void;
  onSave: () => void;
  onToggleSidebar: () => void;
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

const Header = ({ onRun, onSave, onToggleSidebar, currentLanguage, onLanguageChange }: HeaderProps) => {
  const languages = [
    { id: 'javascript', name: 'JavaScript', color: 'text-file-js' },
    { id: 'python', name: 'Python', color: 'text-file-py' },
    { id: 'cpp', name: 'C++', color: 'text-file-cpp' },
    { id: 'html', name: 'HTML', color: 'text-file-html' },
    { id: 'css', name: 'CSS', color: 'text-file-css' },
  ];

  return (
    <header className="h-14 bg-editor-toolbar border-b border-border flex items-center px-4 shadow-toolbar">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
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
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-muted border border-border rounded px-3 py-1.5 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-smooth"
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
          onClick={onSave}
          variant="outline"
          size="sm"
          className="hidden sm:flex border-border hover:bg-muted"
        >
          <Save size={16} className="mr-1" />
          Save
        </Button>
        
        <Button
          onClick={onRun}
          className="bg-gradient-primary hover:shadow-glow transition-all duration-300 font-medium"
          size="sm"
        >
          <Play size={16} className="mr-1" />
          Run
        </Button>
      </div>
    </header>
  );
};

export default Header;