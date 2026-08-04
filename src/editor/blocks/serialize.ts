import type { Block } from './types';

/** Пустой блок нет смысла сохранять — не даёт полезного markdown */
export function isBlockEmpty(block: Block): boolean {
  switch (block.type) {
    case 'text':
      return block.text.trim() === '';
    case 'image':
    case 'file':
      return block.url.trim() === '';
  }
}

function blockToMarkdown(block: Block): string {
  switch (block.type) {
    // Текстовый блок уже хранит готовый markdown — пользователь печатает его
    // напрямую (или тулбар вставляет разметку), сериализовать тут нечего
    case 'text':
      return block.text;

    case 'image':
      return `![${block.alt}](${block.url})`;

    case 'file':
      return `[${block.filename}](${block.url})`;
  }
}

/** Превращает список блоков в markdown-текст, который уходит в поле content */
export function blocksToMarkdown(blocks: Block[]): string {
  return blocks
    .filter((block) => !isBlockEmpty(block))
    .map(blockToMarkdown)
    .join('\n\n');
}
