import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { deleteNews, listNews, publishNews } from '../api/news';
import { formatApiError } from '../utils/formatApiError';
import type { News } from '../types/api';
import { StatusBadge } from '../components/StatusBadge';
import styles from './ArticlesListPage.module.scss';

const PAGE_SIZE = 10;

type Tab = 'mine' | 'published';

export function ArticlesListPage() {
  const { token, user } = useAuth();

  const [tab, setTab] = useState<Tab>('mine');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<News[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function loadList() {
    if (token === null || user === null) return;

    setIsLoading(true);
    setError(null);

    const params =
      tab === 'mine' ? { author: user.id, page, limit: PAGE_SIZE } : { status: 'published' as const, page, limit: PAGE_SIZE };

    listNews(token, params)
      .then((result) => {
        setItems(result.items);
        setTotalPages(result.totalPages);
      })
      .catch((err: unknown) => setError(formatApiError(err, 'Не удалось загрузить список статей.')))
      .finally(() => setIsLoading(false));
  }

  useEffect(loadList, [token, user, tab, page]);

  function switchTab(nextTab: Tab) {
    setTab(nextTab);
    setPage(1);
  }

  async function handlePublishNow(id: string) {
    if (token === null) return;
    try {
      await publishNews(token, id);
      loadList();
    } catch (err) {
      setError(formatApiError(err, 'Не удалось опубликовать статью.'));
    }
  }

  async function handleDelete(id: string) {
    if (token === null) return;
    if (!window.confirm('Удалить статью без возможности восстановления?')) return;

    try {
      await deleteNews(token, id);
      loadList();
    } catch (err) {
      setError(formatApiError(err, 'Не удалось удалить статью.'));
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1>Статьи</h1>
        <Link to="/articles/new" className={styles.newButton}>
          + Новая статья
        </Link>
      </div>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${tab === 'mine' ? styles.active : ''}`}
          onClick={() => switchTab('mine')}
        >
          Мои статьи
        </button>
        <button
          type="button"
          className={`${styles.tab} ${tab === 'published' ? styles.active : ''}`}
          onClick={() => switchTab('published')}
        >
          Все опубликованные
        </button>
      </div>

      {error !== null && <p className={styles.error}>{error}</p>}

      {isLoading ? (
        <p>Загрузка…</p>
      ) : items.length === 0 ? (
        <p className={styles.emptyHint}>Пока здесь пусто.</p>
      ) : (
        items.map((item) => (
          <div key={item.id} className={styles.item}>
            <div className={styles.itemInfo}>
              <Link
                to={item.status === 'published' ? `/articles/${item.id}` : `/articles/${item.id}/edit`}
                className={styles.itemTitle}
              >
                {item.title}
              </Link>
              <div className={styles.itemMeta}>
                <StatusBadge status={item.status} publishAt={item.publishAt} />
                {tab === 'published' && <span>{item.author.name}</span>}
              </div>
            </div>

            {tab === 'mine' && (
              <div className={styles.itemActions}>
                <Link to={`/articles/${item.id}/edit`}>Редактировать</Link>
                {item.status !== 'published' && (
                  <button type="button" onClick={() => handlePublishNow(item.id)}>
                    Опубликовать
                  </button>
                )}
                <button type="button" className={styles.dangerAction} onClick={() => handleDelete(item.id)}>
                  Удалить
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
            ← Назад
          </button>
          <span>
            Страница {page} из {totalPages}
          </span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>
            Вперёд →
          </button>
        </div>
      )}
    </div>
  );
}
