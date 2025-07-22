import { useAuth } from '@/hooks/useAuth';
import { baseApi } from '@/redux/api/baseApi';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Define types for pending requests
interface PendingRequest {
    id: string;
    type: 'worker' | 'tolet';
    status: 'applied' | 'pending' | 'reviewing';
    createdAt: string;
    updatedAt: string;
    details: {
        category?: string;
        location?: string;
        price?: number;
        houseCategory?: string;
        [key: string]: any;
    };
}

// Create API endpoint for pending requests
const pendingRequestsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPendingRequests: builder.query<PendingRequest[], { userId: string }>({
            query: ({ userId }) => ({
                url: `/users/${userId}/pending-requests`,
                method: 'GET',
            }),
            providesTags: ['PendingRequest'],
        }),

        cancelRequest: builder.mutation<{ success: boolean }, { requestId: string }>({
            query: ({ requestId }) => ({
                url: `/pending-requests/${requestId}/cancel`,
                method: 'PATCH',
            }),
            invalidatesTags: ['PendingRequest'],
        }),
    }),
});

export const {
    useGetPendingRequestsQuery,
    useCancelRequestMutation
} = pendingRequestsApi;

export const PendingRequests = () => {
    const { user } = useAuth();
    const userId = user?.uid || '';

    const {
        data: pendingRequests,
        isLoading,
        error,
    } = useGetPendingRequestsQuery({ userId }, { skip: !userId });

    const [cancelRequest, { isLoading: isCancelling }] = useCancelRequestMutation();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-500 rounded-md">
                Error loading pending requests. Please try again later.
            </div>
        );
    }

    const handleCancelRequest = async (requestId: string) => {
        try {
            await cancelRequest({ requestId }).unwrap();
        } catch (error) {
            console.error('Failed to cancel request:', error);
        }
    };

    const getRequestTypeLabel = (type: string) => {
        switch (type) {
            case 'worker':
                return 'Worker Application';
            case 'tolet':
                return 'To-Let Listing';
            default:
                return 'Request';
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'applied':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-amber-100 text-amber-800';
            case 'reviewing':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Pending Requests</h2>
            </div>

            {pendingRequests && pendingRequests.length > 0 ? (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Request Type</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingRequests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell className="font-medium">
                                        {getRequestTypeLabel(request.type)}
                                    </TableCell>
                                    <TableCell>
                                        {request.type === 'worker' ? (
                                            <span>
                                                {request.details.category?.charAt(0).toUpperCase() +
                                                    request.details.category?.slice(1)} Worker
                                            </span>
                                        ) : (
                                            <span>
                                                {request.details.houseCategory} - {request.details.location}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(request.status)}`}>
                                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                        </span>
                                    </TableCell>
                                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCancelRequest(request.id)}
                                            disabled={isCancelling}
                                        >
                                            Cancel
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                        <div className="rounded-full bg-amber-100 p-3 mb-4">
                            <Clock className="h-6 w-6 text-amber-600" />
                        </div>
                        <CardTitle className="text-xl mb-2">No Pending Requests</CardTitle>
                        <CardDescription className="text-center max-w-md">
                            You don't have any pending worker applications or to-let listings.
                            When you submit an application or listing, it will appear here.
                        </CardDescription>
                    </CardContent>
                </Card>
            )}

            <div className="bg-blue-50 p-4 rounded-md flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                    <h3 className="font-medium text-blue-800 mb-1">Request Processing Information</h3>
                    <p className="text-sm text-blue-700">
                        Worker applications typically take 2-3 business days to process.
                        To-Let listings are usually reviewed within 24 hours. You'll receive
                        an email notification once your request has been processed.
                    </p>
                </div>
            </div>
        </div>
    );
};