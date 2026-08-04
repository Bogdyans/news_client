import { useRef } from 'react';
import type { TextBlock } from './types';
import { BlockShell } from './BlockShell';
import styles from './blockEditors.module.scss';

interface Props {
  block: TextBlock;
  onChange: (next: TextBlock) => void;
  onDelete: () => void;
}

/** Границы строки, в которой лежит позиция `position`, в исходной строке `value` */
function getLineBounds(value: string, position: number): [number, number] {
  const start = value.lastIndexOf('\n', position - 1) + 1;
  const nextNewline = value.indexOf('\n', position);
  const end = nextNewline === -1 ? value.length : nextNewline;
  return [start, end];
}

/**
 * Текстовый блок: обычная textarea с markdown внутри плюс тулбар,
 * который вставляет разметку в позицию курсора — заголовки, цитату, код
 * и жирный/курсив
 */
export function TextBlockEditor({ block, onChange, onDelete }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /** Оборачивает выделение маркером с обеих сторон — для **bold** и *italic* */
  function wrapSelection(marker: string) {
    const textarea = textareaRef.current;
    if (textarea === null) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const selected = value.slice(selectionStart, selectionEnd);
    const before = value.slice(0, selectionStart);
    const after = value.slice(selectionEnd);

    onChange({ ...block, text: `${before}${marker}${selected}${marker}${after}` });

    requestAnimationFrame(() => {
      textarea.focus();
      const start = selectionStart + marker.length;
      textarea.setSelectionRange(start, start + selected.length);
    });
  }

  /** Ставит перед строкой с курсором "# "/"## "/"### ", заменяя прежний уровень заголовка */
  function insertHeading(level: 1 | 2 | 3) {
    const textarea = textareaRef.current;
    if (textarea === null) return;

    const { selectionStart, value } = textarea;
    const [lineStart, lineEnd] = getLineBounds(value, selectionStart);

    const line = value.slice(lineStart, lineEnd).replace(/^#{1,3}\s+/, '');
    const nextLine = `${'#'.repeat(level)} ${line}`;

    onChange({ ...block, text: value.slice(0, lineStart) + nextLine + value.slice(lineEnd) });

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = lineStart + nextLine.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  /** Ставит "> " перед каждой строкой, задетой выделением (или перед текущей строкой) */
  function insertQuote() {
    const textarea = textareaRef.current;
    if (textarea === null) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const [blockStart] = getLineBounds(value, selectionStart);
    const [, blockEnd] = getLineBounds(value, selectionEnd);

    const quoted = value
      .slice(blockStart, blockEnd)
      .split('\n')
      .map((line) => `> ${line}`)
      .join('\n');

    onChange({ ...block, text: value.slice(0, blockStart) + quoted + value.slice(blockEnd) });

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = blockStart + quoted.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  /** Оборачивает выделение в ```-блок кода на отдельных строках */
  function insertCodeFence() {
    const textarea = textareaRef.current;
    if (textarea === null) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const selected = value.slice(selectionStart, selectionEnd);
    const before = value.slice(0, selectionStart);
    const after = value.slice(selectionEnd);
    const fenceStart = '```\n';

    onChange({ ...block, text: `${before}${fenceStart}${selected}\n\`\`\`${after}` });

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = before.length + fenceStart.length;
      textarea.setSelectionRange(cursor, cursor + selected.length);
    });
  }

  return (
    <BlockShell label="Текст" onDelete={onDelete}>
      <div className={styles.toolbar}>
        <button type="button" className={styles.toolbarButton} onClick={() => wrapSelection('**')}>
          <strong>Ж</strong>
        </button>
        <button type="button" className={styles.toolbarButton} onClick={() => wrapSelection('*')}>
          <em>К</em>
        </button>
        <button type="button" className={styles.toolbarButton} onClick={() => insertHeading(1)}>
          H1
        </button>
        <button type="button" className={styles.toolbarButton} onClick={() => insertHeading(2)}>
          H2
        </button>
        <button type="button" className={styles.toolbarButton} onClick={() => insertHeading(3)}>
          H3
        </button>
        <button type="button" className={styles.toolbarButton} onClick={insertQuote}>
          Цитата
        </button>
        <button type="button" className={styles.toolbarButton} onClick={insertCodeFence}>
          Код
        </button>
      </div>
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={block.text}
        onChange={(event) => onChange({ ...block, text: event.target.value })}
        rows={6}
        placeholder="Текст статьи. Выделите фрагмент и используйте кнопки для разметки"
      />
    </BlockShell>
  );
}
