import { oneDark } from '@codemirror/theme-one-dark';
import {
  abyss,
  androidstudio,
  atomone,
  aura,
  bespin,
  dracula,
  duotoneLight,
  duotoneDark,
  eclipse,
  githubLight,
  githubDark,
  gruvboxLight,
  gruvboxDark,
  kimbie,
  material,
  materialDark,
  monokai,
  noctisLilac,
  nord,
  okaidia,
  quietlight,
  red,
  solarizedLight,
  solarizedDark,
  sublime,
  tokyoNight,
  tokyoNightDay,
  tokyoNightStorm,
  vscodeDark,
  xcodeDark,
  xcodeLight,
} from '@uiw/codemirror-themes-all';
import { ThemeOption } from '../types';

export const themes: ThemeOption[] = [
  { id: 'oneDark', name: 'One Dark', type: 'dark', extension: oneDark },
  { id: 'abyss', name: 'Abyss', type: 'dark', extension: abyss },
  { id: 'androidstudio', name: 'Android Studio', type: 'dark', extension: androidstudio },
  { id: 'atomone', name: 'Atom One', type: 'dark', extension: atomone },
  { id: 'aura', name: 'Aura', type: 'dark', extension: aura },
  { id: 'bespin', name: 'Bespin', type: 'dark', extension: bespin },
  { id: 'dracula', name: 'Dracula', type: 'dark', extension: dracula },
  { id: 'duotoneDark', name: 'Duotone Dark', type: 'dark', extension: duotoneDark },
  { id: 'githubDark', name: 'GitHub Dark', type: 'dark', extension: githubDark },
  { id: 'gruvboxDark', name: 'Gruvbox Dark', type: 'dark', extension: gruvboxDark },
  { id: 'kimbie', name: 'Kimbie', type: 'dark', extension: kimbie },
  { id: 'material', name: 'Material', type: 'dark', extension: material },
  { id: 'materialDark', name: 'Material Dark', type: 'dark', extension: materialDark },
  { id: 'monokai', name: 'Monokai', type: 'dark', extension: monokai },
  { id: 'noctisLilac', name: 'Noctis Lilac', type: 'dark', extension: noctisLilac },
  { id: 'nord', name: 'Nord', type: 'dark', extension: nord },
  { id: 'okaidia', name: 'Okaidia', type: 'dark', extension: okaidia },
  { id: 'red', name: 'Red', type: 'dark', extension: red },
  { id: 'solarizedDark', name: 'Solarized Dark', type: 'dark', extension: solarizedDark },
  { id: 'sublime', name: 'Sublime', type: 'dark', extension: sublime },
  { id: 'tokyoNight', name: 'Tokyo Night', type: 'dark', extension: tokyoNight },
  { id: 'tokyoNightStorm', name: 'Tokyo Night Storm', type: 'dark', extension: tokyoNightStorm },
  { id: 'vscodeDark', name: 'VS Code Dark', type: 'dark', extension: vscodeDark },
  { id: 'xcodeDark', name: 'Xcode Dark', type: 'dark', extension: xcodeDark },
  
  // Light themes
  { id: 'duotoneLight', name: 'Duotone Light', type: 'light', extension: duotoneLight },
  { id: 'eclipse', name: 'Eclipse', type: 'light', extension: eclipse },
  { id: 'githubLight', name: 'GitHub Light', type: 'light', extension: githubLight },
  { id: 'gruvboxLight', name: 'Gruvbox Light', type: 'light', extension: gruvboxLight },
  { id: 'quietlight', name: 'Quiet Light', type: 'light', extension: quietlight },
  { id: 'solarizedLight', name: 'Solarized Light', type: 'light', extension: solarizedLight },
  { id: 'tokyoNightDay', name: 'Tokyo Night Day', type: 'light', extension: tokyoNightDay },
  { id: 'xcodeLight', name: 'Xcode Light', type: 'light', extension: xcodeLight },
];

export const getThemeByType = (type: 'dark' | 'light') => {
  return themes.filter(theme => theme.type === type);
};

export const getThemeById = (id: string) => {
  return themes.find(theme => theme.id === id) || themes[0];
};