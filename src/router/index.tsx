import type { RouteObject } from 'react-router';
import { createBrowserRouter } from 'react-router';
import { HomePage } from '../components/features/home';
import {
    WorkerDashboardHome,
    CurrentWorks,
    AllWorks,
    WorkRequest
} from '../components/features/dashboard/components/WorkerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminRoute } from './components/AdminRoute';
import { ErrorPage } from './components/ErrorPage';
import { LoginPage } from './components/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RegisterPage } from './components/RegisterPage';
import { UserDashboard } from './components/UserDashboard';
import { UserRoute } from './components/UserRoute';
import { WorkerDashboard } from './components/WorkerDashboard';
import { WorkerRoute } from './components/WorkerRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { RootLayout } from './layouts/RootLayout';
import { adminDashboardLoader } from './loaders/adminDashboardLoader';
import { dashboardLoader } from './loaders/dashboardLoader';
import { userDashboardLoader } from './loaders/userDashboardLoader';
import { workerDashboardLoader } from './loaders/workerDashboardLoader';

const routes: RouteObject[] = [
    {
        path: '/',
        element: <RootLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: 'login',
                element: <LoginPage />,
            },
            {
                path: 'register',
                element: <RegisterPage />,
            },
            {
                path: 'dashboard',
                element: (
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                ),
                loader: dashboardLoader,
                children: [
                    {
                        path: 'admin',
                        element: (
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        ),
                        loader: adminDashboardLoader,
                    },
                    {
                        path: 'user',
                        element: (
                            <UserRoute>
                                <UserDashboard />
                            </UserRoute>
                        ),
                        loader: userDashboardLoader,
                    },
                    {
                        path: 'worker',
                        element: (
                            <WorkerRoute>
                                <WorkerDashboard />
                            </WorkerRoute>
                        ),
                        loader: workerDashboardLoader,
                        children: [
                            {
                                index: true,
                                element: <WorkerDashboardHome />,
                            },
                            {
                                path: 'current-works',
                                element: <CurrentWorks />,
                            },
                            {
                                path: 'all-works',
                                element: <AllWorks />,
                            },
                            {
                                path: 'work-requests',
                                element: <WorkRequest />,
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

export const router = createBrowserRouter(routes);