import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import Chat from '@/components/Chat';
import { createEventSource, sendMessage } from './api';
import { Message } from '@/models/message.model';
import { mergeMessages } from "@/uitls/message.utils";

interface ServerSentEventChatProps {
    sender?: string;
}

const ServerSentEventChat: React.FC<ServerSentEventChatProps> = ({ sender }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Set up the SSE connection
    useEffect(() => {
        let eventSource: EventSource | null = null;

        const handleMessage = (message: Message) => {
            setMessages(prevMessages => mergeMessages(prevMessages, [message]));
        };

        const handleConnected = () => {
            setLoading(false);
            setError(null);
        };

        const handleError = (errorMessage: string) => {
            setError(errorMessage);
            setLoading(false);
        };

        // Create the EventSource and set up event handlers
        eventSource = createEventSource(handleMessage, handleConnected, handleError);

        // Clean up the EventSource when the component unmounts
        return () => {
            eventSource?.close();
        };
    }, []);

    // Handle sending a message
    const handleSendMessage = async (content: string, sender?: string) => {
        try {
            setError(null);

            // Send the message to the server
            let message = await sendMessage(content, sender);

            // The message will be received through the SSE connection,
            // but we can also add it to the list immediately for better UX
            setMessages(prevMessages => mergeMessages(prevMessages, [message]));
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Failed to send message. Please try again.');
        }
    };

    return (
        <Box sx={{ position: 'relative' }}>
            <Chat
                sender={sender}
                messages={messages}
                onSend={handleSendMessage}
                error={error}
                loading={loading}
            />
        </Box>
    );
};

export default ServerSentEventChat;
