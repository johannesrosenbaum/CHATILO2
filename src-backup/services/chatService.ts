import { ChatRoom, Message } from '../types/chat';

class ChatService {
    private chatRooms: Map<string, ChatRoom> = new Map();

    createChatRoom(location: string): ChatRoom {
        const newChatRoom: ChatRoom = {
            id: this.generateId(),
            location,
            messages: [],
            likes: 0,
            createdAt: new Date(),
        };
        this.chatRooms.set(newChatRoom.id, newChatRoom);
        return newChatRoom;
    }

    sendMessage(chatRoomId: string, message: Message): void {
        const chatRoom = this.chatRooms.get(chatRoomId);
        if (chatRoom) {
            chatRoom.messages.push(message);
        }
    }

    likeMessage(chatRoomId: string, messageId: string): void {
        const chatRoom = this.chatRooms.get(chatRoomId);
        if (chatRoom) {
            const message = chatRoom.messages.find(msg => msg.id === messageId);
            if (message) {
                message.likes = (message.likes || 0) + 1;
            }
        }
    }

    getChatRoom(chatRoomId: string): ChatRoom | undefined {
        return this.chatRooms.get(chatRoomId);
    }

    private generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }
}

export default new ChatService();