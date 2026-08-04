import type { ReactNode } from 'react';
import { renderInlineMarkdown } from './inlineMarkdown';
import styles from './BlockView.module.scss';

const HEADING_PATTERN = /^(#{1,3})\s+(.*)$/;
const CODE_FENCE_PATTERN = /^```(.*)$/;

/**
 * Рендерит содержимое текстового блока: заголовки, цитаты, код и обычные
 * абзацы с инлайн-выделением (жирный, курсив).
 */
export function renderTextMarkdown(markdown: string): ReactNode {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const nodes: ReactNode[] = [];
  let paragraphLines: string[] = [];
  let key = 0;

  function flushParagraph(): void {
    const text = paragraphLines.join('\n').trim();
    if (text !== '') {
      nodes.push(
        <p key={key++} className={styles.paragraph}>
          {renderInlineMarkdown(text)}
        </p>,
      );
    }
    paragraphLines = [];
  }

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      flushParagraph();
      i += 1;
      continue;
    }

    const codeMatch = line.match(CODE_FENCE_PATTERN);
    if (codeMatch) {
      flushParagraph();

      const language = codeMatch[1].trim();
      const codeLines: string[] = [];
      i += 1;

      while (i < lines.length && lines[i].trim() !== '```') {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1;

      nodes.push(
        <pre key={key++} className={styles.code}>
          {language !== '' && <span className={styles.codeLanguage}>{language}</span>}
          <code>{codeLines.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    const headingMatch = line.match(HEADING_PATTERN);
    if (headingMatch) {
      flushParagraph();

      const Tag = `h${headingMatch[1].length}` as 'h1' | 'h2' | 'h3';
      nodes.push(
        <Tag key={key++} className={styles.heading}>
          {renderInlineMarkdown(headingMatch[2])}
        </Tag>,
      );
      i += 1;
      continue;
    }

    if (line.startsWith('>')) {
      flushParagraph();

      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i += 1;
      }
      nodes.push(
        <blockquote key={key++} className={styles.quote}>
          {quoteLines.join('\n')}
        </blockquote>,
      );
      continue;
    }

    paragraphLines.push(line);
    i += 1;
  }

  flushParagraph();

  return nodes;
}
