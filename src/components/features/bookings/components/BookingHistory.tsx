import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerBookings } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { format } from 'date-fns';
import {
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
    ChevronRight,
    Filter,
    Search
} from 'lucide-react';
import type { BookingStatus } from '@/types/common';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BookingHistory = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const { bookings, isLoading, pagination } = useCustomerBookings({
        userId: user?.id || '',
        page: currentPage,
        limit: 10,
        status: statusFilter !== 'all' ? [statusFilter] : undefined,
    });

    // Filter bookings by search query (service name or worker name)
    const filteredBookings = searchQuery
        ? bookings.filter(booking =>
            booking.serviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.workerId.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : bookings;

    // Get status badge info
    const getStatusBadge = (status: BookingStatus) => {
        switch (status) {
            case 'pending':
                return {
                    icon: <Clock className="h-4 w-4 mr-1" />,
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    label: 'Pending'
                };
            case 'accepted':
                return {
                    icon: <CheckCircle className="h-4 w-4 mr-1" />,
                    color: 'bg-blue-100 text-blue-800 border-blue-200',
                    label: 'Accepted'
                };
            case 'in_progress':
                return {
                    icon: <Clock className="h-4 w-4 mr-1" />,
                    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                    label: 'In Progress'
                };
            case 'completed':
                return {
                    icon: <CheckCircle className="h-4 w-4 mr-1" />,
                    color: 'bg-green-100 text-green-800 border-green-200',
                    label: 'Completed'
                };
            case 'cancelled':
                return {
                    icon: <XCircle className="h-4 w-4 mr-1" />,
                    color: 'bg-red-100 text-red-800 border-red-200',
                    label: 'Cancelled'
                };
            case 'rejected':
                return {
                    icon: <AlertCircle className="h-4 w-4 mr-1" />,
                    color: 'bg-red-100 text-red-800 border-red-200',
                    label: 'Rejected'
                };
            default:
                return {
                    icon: <Clock className="h-4 w-4 mr-1" />,
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    label: status
                };
        }
    };

    // Handle pagination
    const totalPages = pagination?.totalPages || 1;

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-10">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-2xl font-bold">My Bookings</h2>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search bookings..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center">
                        <Filter className="h-4 w-4 mr-2 text-gray-500" />
                        <Select
                            value={statusFilter}
                            onValueChange={(value) => setStatusFilter(value as any)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="accepted">Accepted</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {filteredBookings.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-4">No bookings found</p>
                    <Button onClick={() => navigate('/services')}>Browse Services</Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredBookings.map((booking) => {
                        const statusBadge = getStatusBadge(booking.status);

                        return (
                            <div
                                key={booking.id}
                                className="border rounded-lg overflow-hidden hover:border-primary transition-colors cursor-pointer"
                                onClick={() => navigate(`/dashboard/bookings/${booking.id}`)}
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center">
                                            <Badge className={`${statusBadge.color} border flex items-center mr-3`}>
                                                {statusBadge.icon}
                                                {statusBadge.label}
                                            </Badge>
                                            <h3 className="font-medium">Booking #{booking.id.slice(-6)}</h3>
                                        </div>

                                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-sm">
                                            <div className="flex items-center">
                                                <span className="text-gray-500 mr-2">Service:</span>
                                                <span>{booking.serviceId}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-gray-500 mr-2">Professional:</span>
                                                <span>{booking.workerId}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-gray-500 mr-2">Date:</span>
                                                <span>{format(new Date(booking.scheduledDate), 'MMM d, yyyy - h:mm a')}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-gray-500 mr-2">Amount:</span>
                                                <span>${booking.totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <Button variant="ghost" size="icon">
                                            <ChevronRight className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                            >
                                {page}
                            </Button>
                        ))}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingHistory;