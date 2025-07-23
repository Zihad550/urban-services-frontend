import { Outlet, useLoaderData } from 'react-router';
import { WorkerDashboard as WorkerDashboardComponent } from '../../components/features/dashboard/components/WorkerDashboard';
import type { WorkerDashboardLoaderData } from '../types';

export const WorkerDashboard: React.FC = () => {
    // We're now using the comprehensive worker dashboard component
    // that we implemented in the features directory
    return <WorkerDashboardComponent />;
};