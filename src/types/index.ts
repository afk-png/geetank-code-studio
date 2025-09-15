export interface FileItem {
  id: string;
  name: string;
  content: string;
  language: string;
  isActive?: boolean;
}

export interface EditorSettings {
  wordWrap: boolean;
  smoothCursor: boolean;
  fontSize: number;
  fontFamily: string;
  theme: string;
  tabSize: number;
  lineNumbers: boolean;
  minimap: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  files: FileItem[];
  activeFile?: string;
}

export interface AIProvider {
  id: 'gpt' | 'gemini' | 'deepseek' | 'grok';
  name: string;
  apiKey?: string;
  model: string;
}

export interface ThemeOption {
  id: string;
  name: string;
  type: 'dark' | 'light';
  extension: any;
}