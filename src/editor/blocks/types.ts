// Модель контента статьи: массив блоков.
// Markdown — это просто текст с подсказками разметки, поэтому структурными
// блоками остаются только те вещи, которые НЕЛЬЗЯ напечатать как текст —
// картинка и файл. Заголовки, цитаты, код и жирный/курсив — это markdown-
// синтаксис внутри текстового блока, который тулбар вставляет за пользователя.

export interface TextBlock {
  id: string;
  type: 'text';
  /** Сырой markdown: #, ##, >, ```lang, **bold**, *italic* и т.п. */
  text: string;
}

export interface ImageBlock {
  id: string;
  type: 'image';
  /** Публичный путь на бэкенде, например /uploads/<uuid>.png. Пусто, пока файл грузится */
  url: string;
  alt: string;
}

export interface FileBlock {
  id: string;
  type: 'file';
  url: string;
  filename: string;
}

export type Block = TextBlock | ImageBlock | FileBlock;

export type BlockType = Block['type'];
