export interface ChatUser {
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'offline' | 'away';
    lastSeen?: string;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: Date;
    read: boolean;
}

export interface Conversation {
    user: ChatUser;
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
}
