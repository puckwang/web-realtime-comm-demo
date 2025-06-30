import { Message } from '@/models/message.model';
import { mergeMessages } from '@/uitls/message.utils';

// Event types that can be received from the server
type WebSocketEventType = 'connected' | 'message';

// Structure of events received from the server
interface WebSocketEvent {
    type: WebSocketEventType;
    data?: Message;
    message?: string;
    timestamp?: string;
}

// Structure for message requests sent to the server
interface SendMessageRequest {
    content: string;
    sender: string;
}

/**
 * MessagesWebSocketManager handles WebSocket connections and message management
 * This is based on the backend MessagesWebSocketManager implementation
 */
export class MessagesWebSocketManager {
    private socket: WebSocket | null = null;
    private messages: Message[] = [];
    private isConnected: boolean = false;
    private messageListeners: ((message: Message) => void)[] = [];
    private connectionListeners: ((isConnected: boolean) => void)[] = [];
    private errorListeners: ((error: string) => void)[] = [];

    /**
     * Creates a new instance of MessagesWebSocketManager
     */
    constructor() {
        this.connect();
    }

    /**
     * Establishes a WebSocket connection to the server
     */
    private connect(): void {
        try {
            console.log('Connecting to WebSocket...');
            const wsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('http', 'ws')}/ws/messages`;
            this.socket = new WebSocket(wsUrl);

            this.socket.addEventListener('open', this.handleOpen);
            this.socket.addEventListener('message', this.handleMessage);
            this.socket.addEventListener('error', this.handleError);
            this.socket.addEventListener('close', this.handleClose);
        } catch (error) {
            console.error('Failed to connect to WebSocket:', error);
            this.notifyError('Failed to connect to WebSocket server');
        }
    }

    /**
     * Handles the WebSocket open event
     */
    private handleOpen = (): void => {
        this.isConnected = true;
        this.notifyConnectionChange();
    };

    /**
     * Handles incoming WebSocket messages
     */
    private handleMessage = (event: MessageEvent): void => {
        try {
            const wsEvent = JSON.parse(event.data) as WebSocketEvent;

            switch (wsEvent.type) {
                case 'connected':
                    console.log('WebSocket connected:', wsEvent.message);
                    break;

                case 'message':
                    if (wsEvent.data) {
                        this.messages = mergeMessages(this.messages, [wsEvent.data]);
                        this.notifyNewMessage(wsEvent.data);
                    }
                    break;

                default:
                    console.warn('Unknown event type:', wsEvent);
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    };

    /**
     * Handles WebSocket errors
     */
    private handleError = (): void => {
        this.notifyError('WebSocket connection error');
    };

    /**
     * Handles WebSocket close events
     */
    private handleClose = (): void => {
        this.isConnected = false;
        this.notifyConnectionChange();
        this.notifyError('WebSocket connection closed');

        // Attempt to reconnect after a delay
        if (this.socket) {
            setTimeout(() => {
                if (!this.isConnected) {
                    this.connect();
                }
            }, 3000);
        }
    };

    /**
     * Sends a message through the WebSocket connection
     */
    public sendMessage(content: string, sender: string = 'Anonymous'): void {
        if (!this.isConnected || !this.socket) {
            throw new Error('WebSocket is not connected');
        }

        const message: SendMessageRequest = {
            content,
            sender
        };

        this.socket.send(JSON.stringify(message));
    }

    /**
     * Gets all messages received so far
     */
    public getMessages(): Message[] {
        return [...this.messages];
    }

    /**
     * Adds a listener for new messages
     */
    public addMessageListener(listener: (message: Message) => void): void {
        this.messageListeners.push(listener);
    }

    /**
     * Removes a message listener
     */
    public removeMessageListener(listener: (message: Message) => void): void {
        this.messageListeners = this.messageListeners.filter(l => l !== listener);
    }

    /**
     * Adds a listener for connection state changes
     */
    public addConnectionListener(listener: (isConnected: boolean) => void): void {
        this.connectionListeners.push(listener);
    }

    /**
     * Removes a connection listener
     */
    public removeConnectionListener(listener: (isConnected: boolean) => void): void {
        this.connectionListeners = this.connectionListeners.filter(l => l !== listener);
    }

    /**
     * Adds a listener for connection errors
     */
    public addErrorListener(listener: (error: string) => void): void {
        this.errorListeners.push(listener);
    }

    /**
     * Removes an error listener
     */
    public removeErrorListener(listener: (error: string) => void): void {
        this.errorListeners = this.errorListeners.filter(l => l !== listener);
    }

    /**
     * Notifies all message listeners of a new message
     */
    private notifyNewMessage(message: Message): void {
        this.messageListeners.forEach(listener => listener(message));
    }

    /**
     * Notifies all connection listeners of a connection state change
     */
    private notifyConnectionChange(): void {
        this.connectionListeners.forEach(listener => listener(this.isConnected));
    }

    /**
     * Notifies all error listeners of a connection error
     */
    private notifyError(error: string): void {
        this.errorListeners.forEach(listener => listener(error));
    }

    /**
     * Closes the WebSocket connection
     */
    public disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}
