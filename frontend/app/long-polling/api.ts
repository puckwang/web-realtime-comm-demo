// API utility functions for long-polling chat
import { Message } from '@/models/message.model';

export async function sendMessage(content: string, sender?: string): Promise<Message> {
    const response = await fetch(`${(process.env.NEXT_PUBLIC_API_BASE_URL)}/api/long-polling/messages/send`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, sender }),
    });

    if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
    }

    return response.json();
}

export async function getInitMessages(signal?: AbortSignal): Promise<Message[]> {
    const url = `${(process.env.NEXT_PUBLIC_API_BASE_URL)}/api/long-polling/messages`;

    const response = await fetch(url, { signal });

    if (!response.ok) {
        throw new Error(`Failed to get messages: ${response.statusText}`);
    }

    return response.json();
}

export async function getMessagesLongPolling(since?: string, signal?: AbortSignal): Promise<Message[]> {
    const url = since
        ? `${(process.env.NEXT_PUBLIC_API_BASE_URL)}/api/long-polling/messages/receive?since=${encodeURIComponent(since)}`
        : `${(process.env.NEXT_PUBLIC_API_BASE_URL)}/api/long-polling/messages/receive`;

    const response = await fetch(url, { signal });

    if (!response.ok) {
        throw new Error(`Failed to get messages: ${response.statusText}`);
    }

    return response.json();
}
