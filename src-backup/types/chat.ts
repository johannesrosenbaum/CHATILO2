export interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: Date;
    mediaUrl?: string; // Optional for images, videos, or audio
    likes: number;
}

export interface ChatRoom {
    id: string;
    name: string;
    location: string; // e.g., city or neighborhood
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
    isEventRoom?: boolean; // Optional for event chat rooms
    eventEndTime?: Date; // Optional for event chat rooms
}