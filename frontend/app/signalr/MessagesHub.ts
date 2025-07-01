// API utility functions for SignalR chat
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { Message } from '@/models/message.model';

/**
 * MessagesHub manages the SignalR connection and message handling
 */
export class MessagesHub {
    private connection: HubConnection;
    private messageListeners: ((message: Message) => void)[] = [];
    private connectionListeners: ((isConnected: boolean) => void)[] = [];
    private errorListeners: ((error: string) => void)[] = [];
    private messagesHistoryListeners: ((messages: Message[]) => void)[] = [];

    /**
     * Creates a new instance of MessagesHub
     */
    constructor() {
        // Create the SignalR connection
        this.connection = new HubConnectionBuilder()
            .withUrl(`${process.env.NEXT_PUBLIC_API_BASE_URL}/hubs/messages`)
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        // Set up event handlers
        this.setupEventHandlers();
    }

    /**
     * Sets up event handlers for the SignalR connection
     */
    private setupEventHandlers(): void {
        // Handle received messages
        this.connection.on('ReceiveMessage', (message: Message) => {
            this.notifyMessageListeners(message);
        });

        // Handle connection status
        this.connection.on('Connected', (message: string) => {
            console.log('SignalR connected:', message);
            this.notifyConnectionListeners(true);
        });

        // Handle errors
        this.connection.on('Error', (errorMessage: string) => {
            this.notifyErrorListeners(errorMessage);
        });

        // Handle message history
        this.connection.on('MessagesHistory', (messages: Message[]) => {
            this.notifyMessagesHistoryListeners(messages);
        });

        // Handle connection state changes
        this.connection.onreconnecting(() => {
            console.log('SignalR reconnecting...');
            this.notifyConnectionListeners(false);
        });

        this.connection.onreconnected(() => {
            console.log('SignalR reconnected');
            this.notifyConnectionListeners(true);
        });

        this.connection.onclose(() => {
            console.log('SignalR connection closed');
            this.notifyConnectionListeners(false);
        });
    }

    /**
     * Starts the SignalR connection
     */
    public async start(): Promise<void> {
        try {
            if (this.connection.state === HubConnectionState.Disconnected) {
                await this.connection.start();
                console.log('SignalR connection started');
            }
        } catch (error) {
            console.error('Error starting SignalR connection:', error);
            this.notifyErrorListeners('Failed to connect to SignalR hub');
            throw error;
        }
    }

    /**
     * Stops the SignalR connection
     */
    public async stop(): Promise<void> {
        try {
            await this.connection.stop();
            console.log('SignalR connection stopped');
        } catch (error) {
            console.error('Error stopping SignalR connection:', error);
        }
    }

    /**
     * Sends a message through the SignalR connection
     */
    public async sendMessage(content: string, sender: string = 'Anonymous'): Promise<void> {
        try {
            if (this.connection.state !== HubConnectionState.Connected) {
                await this.start();
            }
            await this.connection.invoke('SendMessage', content, sender);
        } catch (error) {
            console.error('Error sending message:', error);
            this.notifyErrorListeners('Failed to send message');
            throw error;
        }
    }

    /**
     * Gets messages since a specific time
     */
    public async getMessages(since: Date): Promise<void> {
        try {
            if (this.connection.state !== HubConnectionState.Connected) {
                await this.start();
            }
            await this.connection.invoke('GetMessages', since);
        } catch (error) {
            console.error('Error getting messages:', error);
            this.notifyErrorListeners('Failed to get messages');
            throw error;
        }
    }

    /**
     * Gets recent messages (last hour)
     */
    public async getRecentMessages(): Promise<void> {
        try {
            if (this.connection.state !== HubConnectionState.Connected) {
                await this.start();
            }
            await this.connection.invoke('GetRecentMessages');
        } catch (error) {
            console.error('Error getting recent messages:', error);
            this.notifyErrorListeners('Failed to get recent messages');
            throw error;
        }
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
     * Adds a listener for errors
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
     * Adds a listener for message history
     */
    public addMessagesHistoryListener(listener: (messages: Message[]) => void): void {
        this.messagesHistoryListeners.push(listener);
    }

    /**
     * Removes a message history listener
     */
    public removeMessagesHistoryListener(listener: (messages: Message[]) => void): void {
        this.messagesHistoryListeners = this.messagesHistoryListeners.filter(l => l !== listener);
    }

    /**
     * Notifies all message listeners of a new message
     */
    private notifyMessageListeners(message: Message): void {
        this.messageListeners.forEach(listener => listener(message));
    }

    /**
     * Notifies all connection listeners of a connection state change
     */
    private notifyConnectionListeners(isConnected: boolean): void {
        this.connectionListeners.forEach(listener => listener(isConnected));
    }

    /**
     * Notifies all error listeners of an error
     */
    private notifyErrorListeners(error: string): void {
        this.errorListeners.forEach(listener => listener(error));
    }

    /**
     * Notifies all message history listeners of received messages
     */
    private notifyMessagesHistoryListeners(messages: Message[]): void {
        this.messagesHistoryListeners.forEach(listener => listener(messages));
    }
}

// Create a singleton instance of the MessagesHub
let messagesHubInstance: MessagesHub | null = null;

/**
 * Gets the singleton instance of the MessagesHub
 */
export function getMessagesHub(): MessagesHub {
    if (!messagesHubInstance) {
        messagesHubInstance = new MessagesHub();
    }
    return messagesHubInstance;
}
