import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    List,
    ListItem,
    ListItemText,
    Paper,
    TextField,
    Typography
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { Message } from '@/models/message.model';

// Props for the Chat component
export interface ChatProps {
    sender?: string;
    messages: Message[];
    onSend: (content: string, sender?: string) => Promise<void>;
    error?: string | null;
    loading?: boolean;
}

const Chat: React.FC<ChatProps> = ({ sender, messages, onSend, error, loading }) => {
    const [messageInput, setMessageInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (messageInput.trim()) {
            setIsSending(true);
            try {
                await onSend(messageInput, sender);
            } finally {
                setIsSending(false);
                setMessageInput('');
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Container>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper elevation={3} sx={{ p: 2, height: '80vh', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" component="h1" gutterBottom>
                    Chat Room
                </Typography>

                <Paper
                    variant="outlined"
                    sx={{
                        flex: 1,
                        mb: 2,
                        overflow: 'auto',
                        p: 2,
                        bgcolor: 'background.default'
                    }}
                >
                    <List>
                        {loading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <CircularProgress />
                            </Box>
                        )}
                        {messages.map((message) => (
                            <ListItem
                                key={message.id}
                                alignItems="flex-start"
                                sx={{
                                    mb: 1,
                                    bgcolor: message.sender === sender ? 'primary.light' : 'grey.100',
                                    borderRadius: 2,
                                    p: 1,
                                    maxWidth: '80%',
                                    ml: message.sender === sender ? 'auto' : 0,
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="subtitle2"
                                            sx={{ fontWeight: 'bold' }}
                                            color={message.sender === sender ? 'primary.contrastText' : 'text.primary'}
                                        >
                                            {message.sender}
                                        </Typography>
                                    }
                                    secondary={
                                        <>
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                color={message.sender === sender ? 'primary.contrastText' : 'text.primary'}
                                                sx={{ display: 'block', wordBreak: 'break-word' }}
                                            >
                                                {message.content}
                                            </Typography>
                                            <Typography
                                                component="span"
                                                variant="caption"
                                                color={message.sender === sender ? 'primary.contrastText' : 'text.secondary'}
                                            >
                                                {new Date(message.timestamp).toLocaleTimeString()}
                                            </Typography>
                                        </>
                                    }
                                />
                            </ListItem>
                        ))}
                        <div ref={messagesEndRef} />
                    </List>
                </Paper>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        placeholder="Type a message"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        variant="outlined"
                        size="small"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        endIcon={isSending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || isSending}
                    >
                        {isSending ? 'Sending...' : 'Send'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default Chat;
