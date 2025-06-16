import { Theme } from '../../../shared/types';

export const themes: Theme[] = [
  {
    id: 'temperature-hot-cold',
    name: '暑いもの・冷たいもの',
    description: '温度に関するお題です',
    examples: {
      low: '氷',
      high: '太陽'
    },
    category: 'temperature'
  },
  {
    id: 'size-big-small',
    name: '大きいもの・小さいもの',
    description: 'サイズに関するお題です',
    examples: {
      low: 'アリ',
      high: 'ゾウ'
    },
    category: 'size'
  },
  {
    id: 'speed-fast-slow',
    name: '速いもの・遅いもの',
    description: 'スピードに関するお題です',
    examples: {
      low: 'カタツムリ',
      high: '新幹線'
    },
    category: 'speed'
  },
  {
    id: 'weight-heavy-light',
    name: '重いもの・軽いもの',
    description: '重さに関するお題です',
    examples: {
      low: '羽毛',
      high: '車'
    },
    category: 'weight'
  },
  {
    id: 'height-tall-short',
    name: '高いもの・低いもの',
    description: '高さに関するお題です',
    examples: {
      low: '芝生',
      high: 'スカイツリー'
    },
    category: 'height'
  },
  {
    id: 'age-old-young',
    name: '古いもの・新しいもの',
    description: '年代に関するお題です',
    examples: {
      low: '今日のニュース',
      high: '恐竜'
    },
    category: 'age'
  },
  {
    id: 'difficulty-hard-easy',
    name: '難しいこと・簡単なこと',
    description: '難易度に関するお題です',
    examples: {
      low: '歩く',
      high: '宇宙旅行'
    },
    category: 'difficulty'
  },
  {
    id: 'popularity-famous-unknown',
    name: '有名なもの・無名なもの',
    description: '知名度に関するお題です',
    examples: {
      low: '隣の家の犬',
      high: 'ピカチュウ'
    },
    category: 'popularity'
  },
  {
    id: 'distance-far-near',
    name: '遠いもの・近いもの',
    description: '距離に関するお題です',
    examples: {
      low: '目の前',
      high: '月'
    },
    category: 'size'
  },
  {
    id: 'brightness-bright-dark',
    name: '明るいもの・暗いもの',
    description: '明るさに関するお題です',
    examples: {
      low: '洞窟',
      high: '電球'
    },
    category: 'temperature'
  }
];

export const getRandomTheme = (): Theme => {
  return themes[Math.floor(Math.random() * themes.length)];
};

export const getThemeById = (id: string): Theme | undefined => {
  return themes.find(theme => theme.id === id);
};