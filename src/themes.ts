// Monaco theme registration. Keep in src root to meet 5-file target

export type ThemeOption = { id: string; name: string };

// Minimal palette set to auto-generate >35 themes
const palettes = [
  { id: 'onedark', name: 'One Dark', bg: '#1e222a', fg: '#d7dae0', sel: '#3b4361', cur: '#528bff', acc: '#61afef' },
  { id: 'dracula', name: 'Dracula', bg: '#282a36', fg: '#f8f8f2', sel: '#44475a', cur: '#ff79c6', acc: '#bd93f9' },
  { id: 'monokai', name: 'Monokai', bg: '#272822', fg: '#f8f8f2', sel: '#49483e', cur: '#f92672', acc: '#66d9ef' },
  { id: 'solarized-dark', name: 'Solarized Dark', bg: '#002b36', fg: '#93a1a1', sel: '#073642', cur: '#268bd2', acc: '#2aa198' },
  { id: 'nord', name: 'Nord', bg: '#2e3440', fg: '#d8dee9', sel: '#3b4252', cur: '#88c0d0', acc: '#81a1c1' },
  { id: 'github-dark', name: 'GitHub Dark', bg: '#0d1117', fg: '#c9d1d9', sel: '#161b22', cur: '#58a6ff', acc: '#79c0ff' },
  { id: 'night-owl', name: 'Night Owl', bg: '#011627', fg: '#d6deeb', sel: '#1d3b53', cur: '#7fdbca', acc: '#82aaff' },
  { id: 'ayu-dark', name: 'Ayu Dark', bg: '#0f1419', fg: '#e6e1cf', sel: '#1b2127', cur: '#ffcc66', acc: '#39bae6' },
  { id: 'gruvbox-dark', name: 'Gruvbox Dark', bg: '#282828', fg: '#ebdbb2', sel: '#3c3836', cur: '#fe8019', acc: '#b8bb26' },
  { id: 'palenight', name: 'Palenight', bg: '#292d3e', fg: '#a6accd', sel: '#343a52', cur: '#c792ea', acc: '#82aaff' },
  { id: 'material-darker', name: 'Material Darker', bg: '#121212', fg: '#e0e0e0', sel: '#1e1e1e', cur: '#bb86fc', acc: '#03dac6' },
  { id: 'vitesse-dark', name: 'Vitesse Dark', bg: '#121212', fg: '#c9d1d9', sel: '#1f1f1f', cur: '#6ee7b7', acc: '#f59e0b' },
  { id: 'tokyo-night', name: 'Tokyo Night', bg: '#1a1b26', fg: '#c0caf5', sel: '#283457', cur: '#7aa2f7', acc: '#bb9af7' },
  { id: 'oceanic-next', name: 'Oceanic Next', bg: '#1b2b34', fg: '#c0c5ce', sel: '#343d46', cur: '#6699cc', acc: '#99c794' },
  { id: 'violet-sunset', name: 'Violet Sunset', bg: '#1a1423', fg: '#e0d7f6', sel: '#2a1e35', cur: '#a277ff', acc: '#61ffca' },
  { id: 'forest-night', name: 'Forest Night', bg: '#0b1c1b', fg: '#d6e9c6', sel: '#122b2a', cur: '#99c794', acc: '#5fb3b3' },
  { id: 'midnight-city', name: 'Midnight City', bg: '#0f172a', fg: '#e2e8f0', sel: '#1e293b', cur: '#38bdf8', acc: '#a78bfa' },
  { id: 'espresso', name: 'Espresso', bg: '#2a1f1d', fg: '#f2f1f0', sel: '#3b2b28', cur: '#c38a7a', acc: '#a3c9a8' },
  { id: 'nebula', name: 'Nebula', bg: '#1b1d2a', fg: '#e6e8ff', sel: '#24273a', cur: '#8bd5ff', acc: '#a6da95' },
  { id: 'matrix', name: 'Matrix', bg: '#0b0f0c', fg: '#cdeccd', sel: '#122016', cur: '#00ff41', acc: '#00b894' },
  { id: 'rose-pine', name: 'Rosé Pine', bg: '#191724', fg: '#e0def4', sel: '#26233a', cur: '#eb6f92', acc: '#9ccfd8' },
  { id: 'catppuccin-mocha', name: 'Catppuccin Mocha', bg: '#1e1e2e', fg: '#cdd6f4', sel: '#313244', cur: '#b4befe', acc: '#94e2d5' },
  { id: 'everforest', name: 'Everforest', bg: '#2d353b', fg: '#d3c6aa', sel: '#343f44', cur: '#a7c080', acc: '#7fbbb3' },
  { id: 'edge-dark', name: 'Edge Dark', bg: '#1e262e', fg: '#c0c5ce', sel: '#2a313a', cur: '#7aa2f7', acc: '#79c0ff' },
  { id: 'iceberg', name: 'Iceberg', bg: '#161821', fg: '#c6c8d1', sel: '#1e2132', cur: '#84a0c6', acc: '#89ddff' },
  { id: 'cobalt', name: 'Cobalt', bg: '#002240', fg: '#d4d4d4', sel: '#003355', cur: '#ff9d00', acc: '#9cdcfe' },
  { id: 'synthwave', name: 'Synthwave', bg: '#2b213a', fg: '#f5e0dc', sel: '#3b2a4a', cur: '#ff7edb', acc: '#74ee15' },
  { id: 'poimandres', name: 'Poimandres', bg: '#14151a', fg: '#a6accd', sel: '#23242a', cur: '#5de4c7', acc: '#89ddff' },
  { id: 'duotone-dark', name: 'Duotone Dark', bg: '#2a2734', fg: '#b9b6d3', sel: '#3b364a', cur: '#6a51e6', acc: '#ffb86b' },
  { id: 'charcoal', name: 'Charcoal', bg: '#121212', fg: '#d0d0d0', sel: '#1f1f1f', cur: '#64b5f6', acc: '#81c784' },
  { id: 'obsidian', name: 'Obsidian', bg: '#131516', fg: '#e0e0e0', sel: '#1c1e1f', cur: '#00bcd4', acc: '#8bc34a' },
  { id: 'spacegray', name: 'Spacegray', bg: '#20242c', fg: '#c5d0e6', sel: '#2c313c', cur: '#7aa2f7', acc: '#c792ea' },
  { id: 'dark-plus', name: 'Dark+ (VSCode)', bg: '#1e1e1e', fg: '#d4d4d4', sel: '#264f78', cur: '#aeafad', acc: '#569cd6' },
  { id: 'noctis', name: 'Noctis', bg: '#1b1e28', fg: '#d5d6db', sel: '#232634', cur: '#dba0f0', acc: '#8bd5ca' },
  { id: 'zenburn', name: 'Zenburn', bg: '#3f3f3f', fg: '#dcdccc', sel: '#2b2b2b', cur: '#f0dfaf', acc: '#8cd0d3' },
  { id: 'quiet-light', name: 'Quiet Light', bg: '#fafafa', fg: '#333333', sel: '#eaeaef', cur: '#0b84ff', acc: '#0b84ff' },
];

export const themeOptions: ThemeOption[] = palettes.map((p) => ({ id: p.id, name: p.name }));

export function registerThemes(monaco: any) {
  palettes.forEach((p) => {
    monaco.editor.defineTheme(p.id, {
      base: p.id === 'quiet-light' ? 'vs' : 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: p.acc.replace('#', ''), fontStyle: 'italic' },
        { token: 'type', foreground: p.acc.replace('#', ''), fontStyle: 'italic' },
        { token: 'class', foreground: p.acc.replace('#', ''), fontStyle: 'italic' },
        { token: 'function', foreground: p.cur.replace('#', ''), fontStyle: 'italic' },
        { token: 'number', foreground: 'e6db74' },
        { token: 'string', foreground: 'a6e22e' },
        { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
      ],
      colors: {
        'editor.background': p.bg,
        'editor.foreground': p.fg,
        'editorLineNumber.foreground': '#6b7280',
        'editorCursor.foreground': p.cur,
        'editor.selectionBackground': p.sel,
        'editor.inactiveSelectionBackground': p.sel + '88',
        'editor.lineHighlightBackground': p.sel + '55',
        'editorIndentGuide.background': '#374151',
        'editorIndentGuide.activeBackground': '#9ca3af',
        'editorGutter.background': p.bg,
        'editorWidget.background': p.bg,
        'editorHoverWidget.background': p.bg,
        'editorOverviewRuler.border': '#00000000',
        'panel.background': p.bg,
      },
    });
  });
}
