import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { css } from '@codemirror/lang-css';
import { java } from '@codemirror/lang-java';
import { php } from '@codemirror/lang-php';
// import { lua } from '@codemirror/lang-lua'; // Not available

export interface Language {
  id: string;
  name: string;
  extension: any;
  fileExtensions: string[];
}

export const languages: Language[] = [
  {
    id: 'javascript',
    name: 'JavaScript',
    extension: javascript,
    fileExtensions: ['js', 'jsx', 'mjs', 'ts', 'tsx']
  },
  {
    id: 'python',
    name: 'Python',
    extension: python,
    fileExtensions: ['py', 'pyw', 'pyc', 'pyo', 'pyd']
  },
  {
    id: 'cpp',
    name: 'C++',
    extension: cpp,
    fileExtensions: ['cpp', 'cc', 'cxx', 'c++', 'c', 'h', 'hpp', 'hxx', 'cs']
  },
  {
    id: 'css',
    name: 'CSS',
    extension: css,
    fileExtensions: ['css', 'scss', 'sass', 'less']
  },
  {
    id: 'java',
    name: 'Java',
    extension: java,
    fileExtensions: ['java', 'class', 'jar']
  },
  {
    id: 'php',
    name: 'PHP',
    extension: php,
    fileExtensions: ['php', 'php3', 'php4', 'php5', 'phtml']
  },
  {
    id: 'lua',
    name: 'Lua',
    extension: javascript, // Fallback to JS highlighting
    fileExtensions: ['lua', 'luau']
  },
  {
    id: 'perl',
    name: 'Perl',
    extension: javascript, // Fallback to JS highlighting
    fileExtensions: ['pl', 'pm', 'perl']
  }
];

export const getLanguageFromFilename = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return 'javascript';
  
  const language = languages.find(lang => 
    lang.fileExtensions.includes(ext)
  );
  
  return language?.id || 'javascript';
};

export const getLanguageExtension = (languageId: string) => {
  const language = languages.find(lang => lang.id === languageId);
  return language?.extension() || javascript();
};

export const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const iconClass = "w-4 h-4";
  
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'mjs':
      return `${iconClass} text-file-js`;
    case 'py':
    case 'pyw':
      return `${iconClass} text-file-py`;
    case 'cpp':
    case 'cc':
    case 'cxx':
    case 'c++':
    case 'c':
    case 'h':
    case 'hpp':
    case 'cs':
      return `${iconClass} text-file-cpp`;
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return `${iconClass} text-file-css`;
    case 'java':
    case 'class':
    case 'jar':
      return `${iconClass} text-file-java`;
    case 'php':
    case 'phtml':
      return `${iconClass} text-file-php`;
    case 'lua':
    case 'luau':
      return `${iconClass} text-file-lua`;
    case 'pl':
    case 'pm':
    case 'perl':
      return `${iconClass} text-file-lua`;
    default:
      return `${iconClass} text-muted-foreground`;
  }
};