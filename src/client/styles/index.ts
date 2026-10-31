/**
 * 样式拼接入口。顺序：base -> layout -> compat -> misc。
 * 所有移动规则必须落在 @media (max-width: 1023px) 内；桌面零影响是硬约束。
 */
import { LAYOUT_CSS } from './layout.css.ts'
import { COMPAT_CSS } from './compat.css.ts'
import { MISC_CSS } from './misc.css.ts'

const BASE_LINES = [
  '/* ---------- base：桌面零影响的不变量 ---------- */',
  '/* 抑制双击缩放与 300ms 点击延迟；桌面/鼠标不受影响 */',
  'html, body {',
  '  touch-action: manipulation;',
  '}',
  '@media (prefers-reduced-motion: reduce) {',
  '  /* 正确语法（对治 dsh-mobile-glass 的尾逗号语法错误）；后续动效一律在此关闭 */',
  '  *, *::before, *::after {',
  '    animation-duration: 0.01ms !important;',
  '    transition-duration: 0.01ms !important;',
  '  }',
  '}',
]

export const BASE_CSS = BASE_LINES.join('\n')

export const MOBILE_CSS = BASE_CSS + '\n' + LAYOUT_CSS + '\n' + COMPAT_CSS + '\n' + MISC_CSS
