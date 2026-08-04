import type { Block } from './types';

const CODE_FENCE_PATTERN = /^```/;
const IMAGE_LINE_PATTERN = /^!\[([^\]]*)\]\(([^)]*)\)$/;
const FILE_LINE_PATTERN = /^\[([^\]]*)\]\(([^)]*)\)$/;

/**
 * Разбирает markdown обратно в блоки — нужно, чтобы открыть уже сохранённую
 * статью в редакторе и продолжить её собирать из тех же блоков.
 *
 * Текстовый блок хранит markdown как есть, поэтому разбирать заголовки/цитаты/код
 * тут не нужно — единственное, что действительно является отдельной сущностью,
 * это картинка и файл: каждая строка, стоящая отдельным "абзацем" и совпадающая
 * с markdown-синтаксисом ссылки/картинки, становится своим блоком, а всё
 * остальное между ними склеивается в один текстовый блок.
 *
 * Строки внутри ```-блока кода не проверяются на этот синтаксис — иначе
 * пример markdown-ссылки, вставленный в код, разбил бы текст на части.
 */
export function parseMarkdownToBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let textLines: string[] = [];
  let insideCodeFence = false;

  function flushText(): void {
    const text = textLines.join('\n').trim();
    if (text !== '') {
      blocks.push({ id: crypto.randomUUID(), type: 'text', text });
    }
    textLines = [];
  }

  for (const line of lines) {
    if (CODE_FENCE_PATTERN.test(line)) {
      insideCodeFence = !insideCodeFence;
      textLines.push(line);
      continue;
    }

    if (!insideCodeFence) {
      const imageMatch = line.trim().match(IMAGE_LINE_PATTERN);
      if (imageMatch) {
        flushText();
        blocks.push({ id: crypto.randomUUID(), type: 'image', alt: imageMatch[1], url: imageMatch[2] });
        continue;
      }

      const fileMatch = line.trim().match(FILE_LINE_PATTERN);
      if (fileMatch) {
        flushText();
        blocks.push({ id: crypto.randomUUID(), type: 'file', filename: fileMatch[1], url: fileMatch[2] });
        continue;
      }
    }

    textLines.push(line);
  }

  flushText();

  return blocks;
}
