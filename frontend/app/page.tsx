'use client';

import { Box, Button, Container, Grid, Paper, Typography } from '@mui/material';
import Link from 'next/link';

export default function Home() {
    return (
        <Box sx={{ minHeight: '100vh', py: 4 }}>
            <Container maxWidth="md">
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Real-time Communication Demo
                </Typography>

                <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                    <Typography variant="h5" gutterBottom align="center">
                        Choose a Chat Method
                    </Typography>

                    <Typography variant="body1" align="center">
                        This demo showcases different real-time communication techniques.
                        Select one of the options below to start chatting.
                    </Typography>

                    <Grid container spacing={3} sx={{ mt: 2 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Link href="/polling" style={{ textDecoration: 'none' }} passHref>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    size="large"
                                    sx={{ py: 2 }}
                                >
                                    Polling Chat
                                </Button>
                            </Link>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Link href="/long-polling" style={{ textDecoration: 'none' }} passHref>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    fullWidth
                                    size="large"
                                    sx={{ py: 2 }}
                                >
                                    Long-Polling Chat
                                </Button>
                            </Link>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Link href="/server-sent-event" style={{ textDecoration: 'none' }} passHref>
                                <Button
                                    variant="contained"
                                    color="success"
                                    fullWidth
                                    size="large"
                                    sx={{ py: 2 }}
                                >
                                    Server-Sent Events Chat
                                </Button>
                            </Link>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Link href="/websocket" style={{ textDecoration: 'none' }} passHref>
                                <Button
                                    variant="contained"
                                    color="info"
                                    fullWidth
                                    size="large"
                                    sx={{ py: 2 }}
                                >
                                    WebSocket Chat
                                </Button>
                            </Link>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Link href="/signalr" style={{ textDecoration: 'none' }} passHref>
                                <Button
                                    variant="contained"
                                    color="warning"
                                    fullWidth
                                    size="large"
                                    sx={{ py: 2 }}
                                >
                                    SignalR Chat
                                </Button>
                            </Link>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        </Box>
    );
}
