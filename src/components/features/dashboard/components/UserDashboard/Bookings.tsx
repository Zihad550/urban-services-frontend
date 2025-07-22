import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGetCustomerBookingsQuery } from '@/redux/api/bookingsApi';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { BookingStatus } from '@/types/common';
import { Eye, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';

export const Bookings = () => {
    const { user } = useAuth();
    const userId = user?.uid || '';
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');

    const {
        data: bookingsData,
        isLoading,
        error,
    } = useGetCustomerBookingsQuery({
        userId,
        page,
        limit,
        status: statusFilter ? [statusFilter] : undefined,
    }, { skip: !userId });

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-500 rounded-md">
                Error loading bookings. Please try again later.
            </div>
        );
    }

    const bookings = bookingsData?.data || [];
    const totalPages = bookingsData?.pagination?.totalPages || 1;

    const getStatusBadgeClass = (status: BookingStatus) => {
        switch (status) {
            case 'pending':
                return 'bg-amber-100 text-amber-800';
            case 'accepted':
                return 'bg-blue-100 text-blue-800';
            case 'in_progress':
                return 'bg-indigo-100 text-indigo-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Bookings</h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Filter by status:</span>
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => setStatusFilter(value as BookingStatus | '')}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {bookings.length > 0 ? (
                <>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Worker</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bookings.map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">{booking.serviceName}</TableCell>
                                        <TableCell>{booking.workerName}</TableCell>
                                        <TableCell>{formatDate(booking.scheduledDate)}</TableCell>
                                        <TableCell>${booking.totalAmount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(booking.status)}`}>
                                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link to={`/bookings/${booking.id}`}>
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Link>
                                                </Button>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link to={`/bookings/${booking.id}/receipt`}>
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        Receipt
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                    <PaginationItem key={pageNum}>
                                        <PaginationLink
                                            onClick={() => setPage(pageNum)}
                                            isActive={page === pageNum}
                                        >
                                            {pageNum}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </>
            ) : (
                <div className="text-center py-10 bg-gray-50 rounded-md">
                    <p className="text-muted-foreground mb-4">You don't have any bookings yet.</p>
                    <Button asChild>
                        <Link to="/services">Browse Services</Link>
                    </Button>
                </div>
            )}
        </div>
    );
};