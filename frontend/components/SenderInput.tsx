import React, { useState } from 'react';
import { Button, Paper, TextField, Typography } from '@mui/material';

interface SenderInputProps {
    onStartChat: (sender: string) => void;
}

const SenderInput: React.FC<SenderInputProps> = ({ onStartChat }) => {
    const [sender, setSender] = useState('');

    const handleStartChat = () => {
        if (sender.trim()) {
            onStartChat(sender);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && sender.trim()) {
            handleStartChat();
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: '500px', mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
                Enter your name to start chatting
            </Typography>
            <TextField
                fullWidth
                label="Your Name"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                onKeyPress={handleKeyPress}
                margin="normal"
                variant="outlined"
                autoFocus
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleStartChat}
                disabled={!sender.trim()}
                sx={{ mt: 2 }}
                fullWidth
            >
                Start Chat
            </Button>
        </Paper>
    );
};

export default SenderInput;
