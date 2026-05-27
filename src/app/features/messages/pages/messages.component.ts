import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { BadgeModule } from 'primeng/badge';
import { MessageService } from '../services/message.service';

@Component({
    selector: 'fx-messages',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, BadgeModule],
    template: `
        <div class="card p-0 overflow-hidden" style="height: calc(100vh - 9rem)">
            <div class="flex h-full">
                <!-- Conversations List -->
                <div class="w-full md:w-1/3 border-right-1 surface-border flex flex-col">
                    <div class="p-4 border-bottom-1 surface-border">
                        <h5 class="m-0">Messages</h5>
                    </div>
                    <div class="flex-1 overflow-y-auto">
                        <div
                            *ngFor="let conv of msgService.conversations()"
                            class="flex items-center gap-3 p-3 cursor-pointer hover:surface-hover border-bottom-1 surface-border"
                            [class.surface-ground]="msgService.activeConversationUserId() === conv.user.id"
                            (click)="openChat(conv.user.id)"
                        >
                            <div class="relative">
                                <div class="flex items-center justify-center bg-primary border-circle" style="width: 2.5rem; height: 2.5rem">
                                    <span class="text-sm font-bold text-white">{{ getInitials(conv.user.name) }}</span>
                                </div>
                                <span
                                    class="absolute border-circle"
                                    style="width: 10px; height: 10px; bottom: 0; right: 0; border: 2px solid var(--surface-card)"
                                    [class.bg-green-500]="conv.user.status === 'online'"
                                    [class.bg-yellow-500]="conv.user.status === 'away'"
                                    [class.bg-gray-400]="conv.user.status === 'offline'"
                                ></span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between">
                                    <span class="font-semibold text-sm">{{ conv.user.name }}</span>
                                    <span class="text-xs text-muted-color">{{ conv.lastMessageTime | date: 'HH:mm' }}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-muted-color truncate" style="max-width: 150px">{{ conv.lastMessage }}</span>
                                    <span *ngIf="conv.unreadCount > 0" class="flex items-center justify-center bg-primary text-white border-circle text-xs font-bold" style="width: 1.25rem; height: 1.25rem">{{ conv.unreadCount }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Chat Area -->
                <div class="flex-1 flex flex-col">
                    <!-- No chat selected -->
                    <div *ngIf="!msgService.activeConversationUserId()" class="flex-1 flex items-center justify-center">
                        <div class="text-center text-muted-color">
                            <i class="pi pi-comments text-5xl mb-3 block"></i>
                            <p class="text-lg">Select a conversation to start chatting</p>
                        </div>
                    </div>

                    <!-- Active chat -->
                    <ng-container *ngIf="msgService.activeConversationUserId()">
                        <!-- Chat header -->
                        <div class="p-4 border-bottom-1 surface-border flex items-center gap-3">
                            <div class="flex items-center justify-center bg-primary border-circle" style="width: 2.5rem; height: 2.5rem">
                                <span class="text-sm font-bold text-white">{{ getInitials(getActiveUserName()) }}</span>
                            </div>
                            <div>
                                <span class="font-semibold block">{{ getActiveUserName() }}</span>
                                <span class="text-xs text-muted-color">{{ getActiveUserStatus() }}</span>
                            </div>
                        </div>

                        <!-- Messages -->
                        <div #chatContainer class="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                            <div *ngFor="let msg of msgService.activeMessages()" class="flex" [class.justify-end]="msg.senderId === 'USR001'" [class.justify-start]="msg.senderId !== 'USR001'">
                                <div
                                    class="p-3 border-round max-w-3/4"
                                    style="max-width: 70%"
                                    [class.bg-primary]="msg.senderId === 'USR001'"
                                    [class.text-white]="msg.senderId === 'USR001'"
                                    [class.surface-ground]="msg.senderId !== 'USR001'"
                                >
                                    <span class="text-sm">{{ msg.content }}</span>
                                    <div class="text-xs mt-1 opacity-70">{{ msg.timestamp | date: 'HH:mm' }}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Input -->
                        <div class="p-4 border-top-1 surface-border flex items-center gap-3">
                            <input
                                pInputText
                                type="text"
                                [(ngModel)]="newMessage"
                                placeholder="Type a message..."
                                class="flex-1"
                                (keyup.enter)="sendMessage()"
                                fluid
                            />
                            <p-button icon="pi pi-send" (onClick)="sendMessage()" [disabled]="!newMessage.trim()" />
                        </div>
                    </ng-container>
                </div>
            </div>
        </div>
    `
})
export class MessagesComponent {
    public msgService = inject(MessageService);
    @ViewChild('chatContainer') chatContainer!: ElementRef;

    newMessage = '';

    getInitials(name: string): string {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    getActiveUserName(): string {
        const userId = this.msgService.activeConversationUserId();
        const user = this.msgService.users().find(u => u.id === userId);
        return user?.name || '';
    }

    getActiveUserStatus(): string {
        const userId = this.msgService.activeConversationUserId();
        const user = this.msgService.users().find(u => u.id === userId);
        return user?.status || 'offline';
    }

    openChat(userId: string) {
        this.msgService.openConversation(userId);
        this.scrollToBottom();
    }

    sendMessage() {
        if (!this.newMessage.trim()) return;
        const userId = this.msgService.activeConversationUserId();
        if (userId) {
            this.msgService.sendMessage(userId, this.newMessage);
            this.newMessage = '';
            this.scrollToBottom();
        }
    }

    private scrollToBottom() {
        setTimeout(() => {
            if (this.chatContainer) {
                this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
            }
        }, 100);
    }
}
