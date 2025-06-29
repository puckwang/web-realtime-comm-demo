'use client';

import React, { useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import PollingChat from './PollingChat';
import SenderInput from '@/components/SenderInput';
import Link from 'next/link';

export default function PollingPage() {
    const [sender, setSender] = useState('');
    const [isChatStarted, setIsChatStarted] = useState(false);

    const handleStartChat = (senderName: string) => {
        setSender(senderName);
        setIsChatStarted(true);
    };

    return (
        <Box sx={{ minHeight: '100vh', py: 4 }}>
            <Container maxWidth="md">
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Polling Chat
                    </Typography>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        Back to Home
                    </Link>
                </Box>

                {!isChatStarted ? (
                    <SenderInput onStartChat={handleStartChat} />
                ) : (
                    <PollingChat sender={sender} />
                )}
            </Container>
        </Box>
    );
}
