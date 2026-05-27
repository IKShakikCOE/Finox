import { Injectable, signal, computed } from '@angular/core';
import { ChatUser, ChatMessage, Conversation } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class MessageService {
    private currentUserId = 'USR001';

    users = signal<ChatUser[]>([
        { id: 'USR002', name: 'Nusrat Jahan', status: 'online' },
        { id: 'USR003', name: 'Rafiq Islam', status: 'online' },
        { id: 'USR004', name: 'Kamal Hossain', status: 'away' },
        { id: 'USR005', name: 'Fatima Akter', status: 'offline', lastSeen: '2026-05-27T04:30:00' },
        { id: 'USR006', name: 'Tanvir Rahman', status: 'online' }
    ]);

    messages = signal<ChatMessage[]>([
        { id: 'MSG001', senderId: 'USR002', receiverId: 'USR001', content: 'Hey, did you check the new mutual fund report?', timestamp: new Date('2026-05-27T05:30:00'), read: false },
        { id: 'MSG002', senderId: 'USR001', receiverId: 'USR002', content: 'Yes! IDLC Growth Fund looks promising.', timestamp: new Date('2026-05-27T05:32:00'), read: true },
        { id: 'MSG003', senderId: 'USR002', receiverId: 'USR001', content: 'Agreed. Should we add it to compare?', timestamp: new Date('2026-05-27T05:35:00'), read: false },
        { id: 'MSG004', senderId: 'USR003', receiverId: 'USR001', content: 'Can you share the budget report for this month?', timestamp: new Date('2026-05-27T04:00:00'), read: false },
        { id: 'MSG005', senderId: 'USR004', receiverId: 'USR001', content: 'Meeting at 3pm regarding the investment strategy.', timestamp: new Date('2026-05-26T18:00:00'), read: true },
        { id: 'MSG006', senderId: 'USR001', receiverId: 'USR004', content: 'Sure, I will be there.', timestamp: new Date('2026-05-26T18:05:00'), read: true },
        { id: 'MSG007', senderId: 'USR006', receiverId: 'USR001', content: 'The DBBL FDR rate just increased to 7.75%!', timestamp: new Date('2026-05-27T06:00:00'), read: false }
    ]);

    activeConversationUserId = signal<string | null>(null);

    conversations = computed<Conversation[]>(() => {
        const allMessages = this.messages();
        const users = this.users();

        return users.map(user => {
            const userMessages = allMessages.filter(
                m => (m.senderId === user.id && m.receiverId === this.currentUserId) ||
                     (m.senderId === this.currentUserId && m.receiverId === user.id)
            ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

            const lastMsg = userMessages[0];
            const unread = allMessages.filter(m => m.senderId === user.id && m.receiverId === this.currentUserId && !m.read).length;

            return {
                user,
                lastMessage: lastMsg?.content || '',
                lastMessageTime: lastMsg?.timestamp || new Date(),
                unreadCount: unread
            };
        }).sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
    });

    totalUnread = computed(() => this.conversations().reduce((sum, c) => sum + c.unreadCount, 0));

    activeMessages = computed(() => {
        const userId = this.activeConversationUserId();
        if (!userId) return [];
        return this.messages().filter(
            m => (m.senderId === userId && m.receiverId === this.currentUserId) ||
                 (m.senderId === this.currentUserId && m.receiverId === userId)
        ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    });

    openConversation(userId: string) {
        this.activeConversationUserId.set(userId);
        // Mark messages as read
        const updated = this.messages().map(m => {
            if (m.senderId === userId && m.receiverId === this.currentUserId && !m.read) {
                return { ...m, read: true };
            }
            return m;
        });
        this.messages.set(updated);
    }

    sendMessage(receiverId: string, content: string) {
        const newMsg: ChatMessage = {
            id: 'MSG' + Date.now(),
            senderId: this.currentUserId,
            receiverId,
            content,
            timestamp: new Date(),
            read: false
        };
        this.messages.set([...this.messages(), newMsg]);

        // Simulate reply after 2 seconds
        setTimeout(() => {
            const replies = [
                'Got it, thanks!',
                'Let me check and get back to you.',
                'Sounds good!',
                'I will look into it.',
                'Thanks for sharing!'
            ];
            const reply: ChatMessage = {
                id: 'MSG' + (Date.now() + 1),
                senderId: receiverId,
                receiverId: this.currentUserId,
                content: replies[Math.floor(Math.random() * replies.length)],
                timestamp: new Date(),
                read: this.activeConversationUserId() === receiverId
            };
            this.messages.set([...this.messages(), reply]);
        }, 2000);
    }
}
