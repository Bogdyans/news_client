import type { Block, BlockType } from './blocks/types';
import { createEmptyBlock } from './blocks/factory';
import { TextBlockEditor } from './blocks/TextBlockEditor';
import { ImageBlockEditor } from './blocks/ImageBlockEditor';
import { FileBlockEditor } from './blocks/FileBlockEditor';
import styles from './ArticleBlocksEditor.module.scss';

interface Props {
  blocks: Block[];
  onChange: (next: Block[]) => void;
  newsId: string;
  token: string;
}

const ADD_BUTTON_LABELS: Record<BlockType, string> = {
  text: '+ Текст',
  image: '+ Картинка',
  file: '+ Файл',
};

const BLOCK_TYPES_ORDER: BlockType[] = ['text', 'image', 'file'];

/** Собирает статью из блоков: тулбар добавления + список блоков с их редакторами */
export function ArticleBlocksEditor({ blocks, onChange, newsId, token }: Props) {
  function addBlock(type: BlockType) {
    onChange([...blocks, createEmptyBlock(type)]);
  }

  function updateBlock(id: string, next: Block) {
    onChange(blocks.map((block) => (block.id === id ? next : block)));
  }

  function deleteBlock(id: string) {
    onChange(blocks.filter((block) => block.id !== id));
  }

  return (
    <div>
      <div className={styles.addToolbar}>
        {BLOCK_TYPES_ORDER.map((type) => (
          <button key={type} type="button" className={styles.addButton} onClick={() => addBlock(type)}>
            {ADD_BUTTON_LABELS[type]}
          </button>
        ))}
      </div>

      {blocks.length === 0 && (
        <p className={styles.emptyHint}>Статья пока пуста — добавьте первый блок.</p>
      )}

      {blocks.map((block) => {
        const onChangeBlock = (next: Block) => updateBlock(block.id, next);
        const onDeleteBlock = () => deleteBlock(block.id);

        switch (block.type) {
          case 'text':
            return (
              <TextBlockEditor key={block.id} block={block} onChange={onChangeBlock} onDelete={onDeleteBlock} />
            );
          case 'image':
            return (
              <ImageBlockEditor
                key={block.id}
                block={block}
                onChange={onChangeBlock}
                onDelete={onDeleteBlock}
                newsId={newsId}
                token={token}
              />
            );
          case 'file':
            return (
              <FileBlockEditor
                key={block.id}
                block={block}
                onChange={onChangeBlock}
                onDelete={onDeleteBlock}
                newsId={newsId}
                token={token}
              />
            );
        }
      })}
    </div>
  );
}
