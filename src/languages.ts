// Language utilities for Monaco
// Keep this file flat in src/ to satisfy the 5-file requirement target

export type LanguageId =
  | 'plaintext'
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'lua'
  | 'luau'
  | 'cpp'
  | 'csharp'
  | 'php'
  | 'css'
  | 'java'
  | 'json'
  | 'html'
  | 'shell'
  | 'perl';

const extToLanguage: Record<string, LanguageId> = {
  // core
  js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
  ts: 'typescript', tsx: 'typescript',
  json: 'json',
  html: 'html', htm: 'html',
  css: 'css',
  // requested
  py: 'python',
  lua: 'lua',
  luau: 'lua', // map luau -> lua highlighter
  c: 'cpp',
  cc: 'cpp', cpp: 'cpp', cxx: 'cpp', h: 'cpp', hpp: 'cpp',
  cs: 'csharp',
  php: 'php',
  java: 'java',
  pl: 'perl', pm: 'perl',
  sh: 'shell', bash: 'shell', zsh: 'shell',
  txt: 'plaintext'
};

export function getLanguageFromFilename(name: string): LanguageId {
  const parts = name.toLowerCase().split('.');
  const ext = parts.length > 1 ? parts.pop()! : '';
  return (ext && extToLanguage[ext]) || 'plaintext';
}

// Register any extra languages not bundled by Monaco or aliases
// Currently: perl (basic), luau (alias to lua)
export function registerExtraLanguages(monaco: any) {
  // luau as alias to lua for now
  if (!monaco.languages.getLanguages().some((l: any) => l.id === 'luau')) {
    monaco.languages.register({ id: 'luau' });
    // Use lua tokens for luau
    const luaProvider = (monaco.languages as any).getEncodedLanguageId
      ? null
      : null;
    // Map luau to lua by default editor.createModel setting; we will map files to 'lua'
  }

  // Basic Perl monarch (minimal highlighting for keywords, strings, comments, numbers)
  if (!monaco.languages.getLanguages().some((l: any) => l.id === 'perl')) {
    monaco.languages.register({ id: 'perl' });
    monaco.languages.setMonarchTokensProvider('perl', {
      tokenizer: {
        root: [
          [/#[^\n]*/, 'comment'],
          [/\"([\"\\\\]|\\\\.)*\"/, 'string'],
          [/'(['\\]|\\.)*'/, 'string'],
          [/(\b)(sub|my|our|use|package|if|elsif|else|for|foreach|while|until|unless|return|die|warn|given|when|default|do)(\b)/, 'keyword'],
          [/\b(\d+)(?:\.(\d+))?\b/, 'number'],
          [/\$[\w:]+/, 'variable'],
          [/\@[\w:]+/, 'variable'],
          [/\%[\w:]+/, 'variable'],
          [/\b[a-zA-Z_][\w:]*\b/, 'identifier'],
        ],
      },
    });
  }
}
