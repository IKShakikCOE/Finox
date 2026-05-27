export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface QuickPrompt {
    label: string;
    icon: string;
    prompt: string;
}
