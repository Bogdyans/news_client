import type { ReactNode } from 'react';

// Ловит **bold** и *italic* по очереди слева направо. Не претендует на полную
// поддержку markdown — только то, что умеет проставлять наш тулбар форматирования
const INLINE_PATTERN = /\*\*(.+?)\*\*|\*(.+?)\*/g;

/** Рендерит **bold** / *italic* внутри строки текста в обычный React-узлы */
export function renderInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  INLINE_PATTERN.lastIndex = 0;
  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1] !== undefined) {
      nodes.push(<strong key={key++}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      nodes.push(<em key={key++}>{match[2]}</em>);
    }

    lastIndex = INLINE_PATTERN.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}
