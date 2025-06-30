'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import Chat from '@/components/Chat';
import { Message } from '@/models/message.model';
import { MessagesWebSocketManager } from "@/app/websocket/MessagesWebSocketManager";

interface WebSocketChatProps {
    sender?: string;
}

const WebSocketChat: React.FC<WebSocketChatProps> = ({ sender }) => {
    const messagesWebSocketManager = useRef<MessagesWebSocketManager>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Set up the WebSocket connection and event listeners
    useEffect(() => {
        const ws = messagesWebSocketManager.current ??= new MessagesWebSocketManager();

        // Set up event listeners
        const handleMessage = () => {
            setMessages(ws.getMessages());
        };

        const handleConnectionChange = (isConnected: boolean) => {
            setLoading(!isConnected);
            if (isConnected) {
                setError(null);
            }
        };

        const handleError = (errorMessage: string) => {
            setError(errorMessage);
        };

        // Add event listeners
        ws.addMessageListener(handleMessage);
        ws.addConnectionListener(handleConnectionChange);
        ws.addErrorListener(handleError);

        // Clean up event listeners when the component unmounts
        return () => {
            ws.removeMessageListener(handleMessage);
            ws.removeConnectionListener(handleConnectionChange);
            ws.removeErrorListener(handleError);
            ws?.disconnect();
            messagesWebSocketManager.current = null;
        };
    }, []);

    // Handle sending a message
    const handleSendMessage = async (content: string, sender?: string) => {
        try {
            setError(null);
            messagesWebSocketManager.current?.sendMessage(content, sender || 'Anonymous');
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

export default WebSocketChat;
