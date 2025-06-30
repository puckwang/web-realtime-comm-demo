'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import Chat from '@/components/Chat';
import { getInitMessages, getMessagesLongPolling, sendMessage } from './api';
import { Message } from '@/models/message.model';
import { getLatestMessageTimestamp, mergeMessages } from "@/uitls/message.utils";

interface LongPollingChatProps {
    sender?: string;
}

const LongPollingChat: React.FC<LongPollingChatProps> = ({ sender }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [lastFetchTime, setLastFetchTime] = useState<string | undefined>(undefined);
    const [init, setInit] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Function to fetch messages using long polling
    const fetchMessages = useCallback(async (signal: AbortSignal) => {
        try {
            const newMessages = init ?
                await getInitMessages(signal) :
                await getMessagesLongPolling(lastFetchTime, signal);

            if (newMessages.length > 0) {
                setMessages(prevMessages => mergeMessages(prevMessages, newMessages));

                // Update the last fetch time to the timestamp of the most recent message
                if (newMessages.length > 0) {
                    setLastFetchTime(getLatestMessageTimestamp(newMessages));
                }
            }

            setInit(false);
        } catch (error) {
            // Don't log or set error if the request was aborted
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error('Error fetching messages:', error);
                setError('Failed to fetch messages. Please try again later.');
                setInit(false);

                // Wait a bit before retrying after an error
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        } finally {
            // Start the next long polling request if not aborted
            // We do this in a setTimeout to avoid potential call stack issues
            if (signal?.aborted === false) {
                setTimeout(() => fetchMessages(signal), 1000);
            }
        }
    }, [lastFetchTime, init]);

    // Initial fetch setup
    useEffect(() => {
        // Create an AbortController for cancellation
        const abortController = new AbortController();

        // Start long polling with the abort signal
        fetchMessages(abortController.signal);

        // Clean up: abort any in-flight requests and stop polling
        return () => {
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
                loading={init}
            />
        </Box>
    );
};

export default LongPollingChat;
