// API utility functions for server-sent events chat
import { Message } from '@/models/message.model';

export async function sendMessage(content: string, sender?: string): Promise<Message> {
    const response = await fetch(`${(process.env.NEXT_PUBLIC_API_BASE_URL)}/api/server-sent-event/messages/send`, {
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

export function createEventSource(onMessage: (message: Message) => void, onConnected: () => void, onError: (error: string) => void): EventSource {
    // Create a new EventSource connection to the server
    const eventSource = new EventSource(`${(process.env.NEXT_PUBLIC_API_BASE_URL)}/api/server-sent-event/messages/stream`);
    
    // Listen for message events
    eventSource.addEventListener('message', (event) => {
        try {
            const message = JSON.parse(event.data) as Message;
            onMessage(message);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });
    
    // Listen for connected event
    eventSource.addEventListener('connected', () => {
        onConnected();
    });
    
    // Listen for error events
    eventSource.addEventListener('error', () => {
        onError('Connection error. Trying to reconnect...');
    });
    
    return eventSource;
}
