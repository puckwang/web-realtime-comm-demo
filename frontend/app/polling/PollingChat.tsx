import React, { useCallback, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import Chat from '@/components/Chat';
import { getMessagesPolling, sendMessage } from './api';
import { Message } from '@/models/message.model';
import { getLatestMessageTimestamp, mergeMessages } from "@/uitls/message.utils";

const POLLING_INTERVAL = 2000; // 2 seconds

interface PollingChatProps {
    sender?: string;
}

const PollingChat: React.FC<PollingChatProps> = ({ sender }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [lastFetchTime, setLastFetchTime] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Function to fetch messages
    const fetchMessages = useCallback(async (signal: AbortSignal) => {
        try {
            const newMessages = await getMessagesPolling(lastFetchTime, signal);

            if (newMessages.length > 0) {
                setMessages(prevMessages => mergeMessages(prevMessages, newMessages));

                // Update the last fetch time to the timestamp of the most recent message
                if (newMessages.length > 0) {
                    setLastFetchTime(getLatestMessageTimestamp(newMessages));
                }
            }

            setError(null);
            setLoading(false);
        } catch (error) {
            // Don't log or set error if the request was aborted
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error('Error fetching messages:', error);
                setError('Failed to fetch messages. Please try again later.');
                setLoading(false);
            }
        }
    }, [lastFetchTime]);

    // Initial fetch and polling setup
    useEffect(() => {
        // Create an AbortController for cancellation
        const abortController = new AbortController();

        // Initial fetch with abort signal
        fetchMessages(abortController.signal);

        // Set up polling interval with abort signal
        const intervalId = setInterval(() => {
            fetchMessages(abortController.signal);
        }, POLLING_INTERVAL);

        // Clean up interval and abort any in-flight requests on component unmount
        return () => {
            clearInterval(intervalId);
            abortController.abort();
        };
    }, [fetchMessages]);

    // Handle sending a message
    const handleSendMessage = async (content: string, sender?: string) => {
        try {
            setError(null);

            // Send the message to the server
            let message = await sendMessage(content, sender);

            // Add the message to the list immediately
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

export default PollingChat;
