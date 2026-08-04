import type { Block } from './types';
import { renderTextMarkdown } from './renderTextMarkdown';
import { resolveAttachmentUrl } from '../../api/resolveAttachmentUrl';
import styles from './BlockView.module.scss';

/** Читает имя файла из его URL, чтобы показать что-то осмысленное в подписи */
function fileNameFromUrl(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1] ?? url;
}

/**
 * Read-only отрисовка одного блока — используется и в предпросмотре
 * редактора, и на странице просмотра опубликованной статьи
 */
export function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'text':
      return <>{renderTextMarkdown(block.text)}</>;

    case 'image':
      return (
        <figure className={styles.image}>
          <img src={resolveAttachmentUrl(block.url)} alt={block.alt} />
          {block.alt !== '' && <figcaption>{block.alt}</figcaption>}
        </figure>
      );

    case 'file':
      return (
        <p className={styles.file}>
          <a href={resolveAttachmentUrl(block.url)} target="_blank" rel="noreferrer">
            📎 {block.filename || fileNameFromUrl(block.url)}
          </a>
        </p>
      );
  }
}
