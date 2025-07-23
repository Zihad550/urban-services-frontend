import { useState, useEffect, useRef } from 'react';
import { useGetBookingMessagesQuery } from '@/redux/api/bookingsApi';
import { useBookingMutations } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Send, PaperclipIcon, Image, File, Smile, Mic, ChevronDown, Info } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface BookingMessagesProps {
    bookingId: string;
}

const BookingMessages = ({ bookingId }: BookingMessagesProps) => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { messages, isLoading, refetch } = useBookingMessages(bookingId);
    const { addMessage, isAddingMessage } = useBookingMutations();

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!message.trim() || !user) return;

        const result = await addMessage(bookingId, message.trim());

        if (result.success) {
            setMessage('');
            refetch();
        } else {
            toast({
                title: 'Error',
                description: 'Failed to send message. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            // In a real app, you would upload the file to a server
            // For now, we'll just show a toast
            toast({
                title: 'File attached',
                description: `${files[0].name} will be sent with your message.`,
            });
            setShowAttachmentOptions(false);
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
        <div className="flex flex-col h-[600px]">
            <Card className="flex-1 overflow-hidden flex flex-col">
                <CardHeader className="border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Booking Conversation</CardTitle>
                            <CardDescription>
                                Communicate with your service provider
                            </CardDescription>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Info className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Messages are shared between you and the service provider</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                            <p className="mb-2">No messages yet</p>
                            <p className="text-sm">Start the conversation by sending a message below.</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isCurrentUser = msg.senderId === user?.id;
                            const isSystem = msg.isSystemMessage;

                            if (isSystem) {
                                return (
                                    <div key={msg.id} className="flex justify-center my-4">
                                        <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm">
                                            {msg.message}
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    {!isCurrentUser && (
                                        <Avatar className="h-8 w-8 mr-2">
                                            <AvatarImage src="/placeholder-avatar.jpg" />
                                            <AvatarFallback>{msg.senderRole.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={`max-w-[70%] ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                                        <div
                                            className={`px-4 py-2 rounded-lg ${isCurrentUser
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {msg.message}
                                            {msg.attachments && msg.attachments.length > 0 && (
                                                <div className="mt-2">
                                                    {msg.attachments.map((attachment, index) => (
                                                        <Badge key={index} variant="outline" className="mr-1">
                                                            <File className="h-3 w-3 mr-1" />
                                                            {attachment.split('/').pop()}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div
                                            className={`text-xs mt-1 text-gray-500 flex items-center ${isCurrentUser ? 'justify-end' : 'justify-start'
                                                }`}
                                        >
                                            <span>{format(new Date(msg.createdAt), 'MMM d, h:mm a')}</span>
                                            <span className="mx-1">•</span>
                                            <span className="capitalize">{msg.senderRole}</span>
                                        </div>
                                    </div>
                                    {isCurrentUser && (
                                        <Avatar className="h-8 w-8 ml-2">
                                            <AvatarImage src={user?.photoURL || undefined} />
                                            <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </CardContent>
                <div className="border-t p-4">
                    <div className="flex items-end gap-2">
                        <div className="relative flex-1">
                            <Textarea
                                placeholder="Type your message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="resize-none pr-10"
                                rows={3}
                            />
                            <div className="absolute bottom-2 right-2">
                                <div className="relative">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
                                    >
                                        <PaperclipIcon className="h-4 w-4" />
                                    </Button>
                                    {showAttachmentOptions && (
                                        <div className="absolute bottom-full right-0 mb-2 bg-white border rounded-lg shadow-lg p-2 flex space-x-1">
                                            <Button variant="ghost" size="icon" onClick={handleFileUpload}>
                                                <File className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={handleFileUpload}>
                                                <Image className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Smile className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Mic className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileSelected}
                                />
                            </div>
                        </div>
                        <Button
                            onClick={handleSendMessage}
                            disabled={!message.trim() || isAddingMessage}
                            className="h-10"
                        >
                            {isAddingMessage ? (
                                <LoadingSpinner className="h-4 w-4" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 flex items-center">
                        <Info className="h-3 w-3 mr-1" />
                        <span>Press Enter to send, Shift+Enter for new line</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

// Helper hook for booking messages
const useBookingMessages = (bookingId: string) => {
    const {
        data: messages = [],
        isLoading,
        refetch,
    } = useGetBookingMessagesQuery({ bookingId }, {
        pollingInterval: 10000, // Poll every 10 seconds for new messages
    });

    return {
        messages,
        isLoading,
        refetch,
    };
};

export default BookingMessages;