'use client'

export type StylePack = 'naruto_like' | 'jjk_like' | 'ghibli_like' | 'dbz_like' | 'demon_like'

export interface StylePackConfig {
  lineWeight: 'thin' | 'medium' | 'soft' | 'bold' | 'ink'
  saturation: 'pastel' | 'mid' | 'high'
  contrast: 'low' | 'med' | 'high'
  palette: string[]
  label: string
}

export const STYLE_PACKS: Record<StylePack, StylePackConfig> = {
  naruto_like: {
    lineWeight: 'medium',
    saturation: 'high',
    contrast: 'med',
    palette: ['#fbbf24', '#ef4444', '#111827'],
    label: 'Naruto-like'
  },
  jjk_like: {
    lineWeight: 'thin',
    saturation: 'mid',
    contrast: 'high',
    palette: ['#93c5fd', '#0ea5e9', '#0b0e10'],
    label: 'Jujutsu Kaisen-like'
  },
  ghibli_like: {
    lineWeight: 'soft',
    saturation: 'pastel',
    contrast: 'low',
    palette: ['#a7f3d0', '#fef3c7', '#64748b'],
    label: 'Studio Ghibli-like'
  },
  dbz_like: {
    lineWeight: 'bold',
    saturation: 'high',
    contrast: 'high',
    palette: ['#f59e0b', '#f97316', '#0b0e10'],
    label: 'Dragon Ball Z-like'
  },
  demon_like: {
    lineWeight: 'ink',
    saturation: 'mid',
    contrast: 'high',
    palette: ['#a78bfa', '#ef4444', '#0b0e10'],
    label: 'Demon Slayer-like'
  }
}

export function getStylePack(key: StylePack): StylePackConfig | undefined {
  return STYLE_PACKS[key]
}

export function getStylePackLabel(key: StylePack): string {
  return STYLE_PACKS[key]?.label || key
}
