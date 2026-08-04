import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ArticlesListPage } from './pages/ArticlesListPage';
import { ArticleEditorPage } from './pages/ArticleEditorPage';
import { ArticleViewPage } from './pages/ArticleViewPage';
import { NotFoundPage } from './pages/NotFoundPage';

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  );
}

/**
 * Дерево маршрутов приложения
 */
export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/articles" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <ProtectedLayout />,
    children: [
      { path: 'articles', element: <ArticlesListPage /> },
      { path: 'articles/new', element: <ArticleEditorPage /> },
      { path: 'articles/:id/edit', element: <ArticleEditorPage /> },
      { path: 'articles/:id', element: <ArticleViewPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
