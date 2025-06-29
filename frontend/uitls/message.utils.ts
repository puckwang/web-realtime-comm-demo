import { Message } from "@/models/message.model";

/**
 * Merges new messages with existing messages, ensuring no duplicates based on message ID.
 *
 * @param prevMessages - The array of previously received messages.
 * @param newMessages - The array of newly received messages.
 * @returns A new array containing all unique messages.
 */
export const mergeMessages = (prevMessages: Message[], newMessages: Message[]): Message[] => {
    // Create a map of existing message IDs for quick lookup
    const existingIds = new Set(prevMessages.map(msg => msg.id));

    // Filter out messages that already exist and combine with previous messages
    const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));
    return [...prevMessages, ...uniqueNewMessages];
}

/**
 * Gets the timestamp of the latest message from an array of messages.
 *
 * @param messages - The array of messages to check.
 * @returns The timestamp of the latest message, or undefined if there are no messages.
 */
export const getLatestMessageTimestamp = (messages: Message[]): string | undefined => {
    if (messages.length === 0) return undefined;

    // Find the latest message based on the timestamp
    return messages.reduce((latest, current) => {
        return new Date(latest.timestamp) > new Date(current.timestamp) ? latest : current;
    }).timestamp;
}
