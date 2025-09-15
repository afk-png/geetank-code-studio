import { useState } from "react";
import { Terminal, X, AlertCircle, CheckCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OutputPanelProps {
  isOpen: boolean;
  onClose: () => void;
  output: string;
  isRunning: boolean;
  hasError: boolean;
}

const OutputPanel = ({ isOpen, onClose, output, isRunning, hasError }: OutputPanelProps) => {
  const [activeTab, setActiveTab] = useState<'output' | 'terminal'>('output');

  if (!isOpen) return null;

  return (
    <div className="h-64 bg-editor-bg border-t border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-editor-toolbar border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('output')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-fast ${
                activeTab === 'output'
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Terminal size={14} />
              Output
              {isRunning && (
                <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
              )}
              {!isRunning && hasError && (
                <AlertCircle size={12} className="text-destructive" />
              )}
              {!isRunning && !hasError && output && (
                <CheckCircle size={12} className="text-success" />
              )}
            </button>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="p-1.5 hover:bg-muted"
        >
          <X size={14} />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'output' && (
          <div className="h-full p-4 overflow-y-auto font-mono text-sm">
            {isRunning ? (
              <div className="flex items-center gap-2 text-warning">
                <Play size={14} className="animate-pulse" />
                <span>Running code...</span>
              </div>
            ) : output ? (
              <pre className={`whitespace-pre-wrap ${hasError ? 'text-destructive' : 'text-success'}`}>
                {output}
              </pre>
            ) : (
              <div className="text-muted-foreground">
                No output yet. Click "Run" to execute your code.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;