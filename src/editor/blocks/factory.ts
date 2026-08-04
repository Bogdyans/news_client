import type { Block, BlockType } from './types';

/** Создаёт пустой блок нужного типа для кнопки "добавить блок" в тулбаре */
export function createEmptyBlock(type: BlockType): Block {
  const id = crypto.randomUUID();

  switch (type) {
    case 'text':
      return { id, type, text: '' };
    case 'image':
      return { id, type, url: '', alt: '' };
    case 'file':
      return { id, type, url: '', filename: '' };
  }
}
