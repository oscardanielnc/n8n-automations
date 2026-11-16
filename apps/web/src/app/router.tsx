import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { AppShell } from './AppShell';

// One chunk per page (code splitting by route).
const HomePage = lazy(() => import('../features/home/HomePage').then((m) => ({ default: m.HomePage })));
const ErrorsPage = lazy(() => import('../features/errors/ErrorsPage').then((m) => ({ default: m.ErrorsPage })));

const page = (el: React.ReactNode) => <Suspense fallback={null}>{el}</Suspense>;

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: page(<HomePage />) },
      { path: '/errors', element: page(<ErrorsPage />) },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
