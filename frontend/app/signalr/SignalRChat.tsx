'use client';

import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import Chat from '@/components/Chat';
import { Message } from '@/models/message.model';
import { getMessagesHub } from './MessagesHub';
import { mergeMessages } from "@/uitls/message.utils";

interface SignalRChatProps {
    sender?: string;
}

const SignalRChat: React.FC<SignalRChatProps> = ({ sender }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Set up the SignalR connection
    useEffect(() => {
        const messagesHub = getMessagesHub();

        // Handle new messages
        const handleMessage = (message: Message) => {
            setMessages(prevMessages => mergeMessages(prevMessages, [message]));
        };

        // Handle connection status changes
        const handleConnectionChange = (isConnected: boolean) => {
            setLoading(!isConnected);
            if (isConnected) {
                setError(null);
            }
        };

        // Handle errors
        const handleError = (errorMessage: string) => {
            setError(errorMessage);
        };

        // Handle message history
        const handleMessagesHistory = (historyMessages: Message[]) => {
            setMessages(prevMessages => mergeMessages(prevMessages, historyMessages));
        };

        // Add event listeners
        messagesHub.addMessageListener(handleMessage);
        messagesHub.addConnectionListener(handleConnectionChange);
        messagesHub.addErrorListener(handleError);
        messagesHub.addMessagesHistoryListener(handleMessagesHistory);

        // Start the connection - recent messages will be sent automatically by the server
        (async () => {
            try {
                await messagesHub.start();
                // No need to explicitly request recent messages as the server sends them on connection
            } catch (err) {
                console.error('Error initializing SignalR:', err);
            }
        })();

        // Clean up event listeners when the component unmounts
        return () => {
            messagesHub.removeMessageListener(handleMessage);
            messagesHub.removeConnectionListener(handleConnectionChange);
            messagesHub.removeErrorListener(handleError);
            messagesHub.removeMessagesHistoryListener(handleMessagesHistory);
            messagesHub.stop();
        };
    }, []);

    // Handle sending a message
    const handleSendMessage = async (content: string, sender?: string) => {
        try {
            setError(null);
            await getMessagesHub().sendMessage(content, sender || 'Anonymous');
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

export default SignalRChat;
