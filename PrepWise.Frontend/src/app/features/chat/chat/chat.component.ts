import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ChatService } from '../../../core/services/chat.service';
import { LanguageService } from '../../../core/services/language.service';
import { ChatMessage } from '../../../core/models/chat.model';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {
    @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

    chatForm: FormGroup;
    messages: ChatMessage[] = [];
    isLoading = false;
    isTyping = false;

    quickQuestions = [
        'Explain TNPSC Group 4 exam pattern',
        'What are the important topics for Tamil subject?',
        'How to improve my speed in mathematics?',
        'Tips for current affairs preparation',
        'Explain the Indian Constitution basics',
        'What is the best study strategy for TNPSC?'
    ];

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private chatService: ChatService,
        private toastr: ToastrService,
        public languageService: LanguageService
    ) {
        this.chatForm = this.formBuilder.group({
            message: ['', [Validators.required, Validators.minLength(3)]]
        });
    }

    ngOnInit(): void {
        this.addWelcomeMessage();
        this.loadChatHistory();
    }

    ngAfterViewChecked(): void {
        this.scrollToBottom();
    }

    addWelcomeMessage(): void {
        const welcomeMessage: ChatMessage = {
            id: Date.now(),
            content: `Hello! I'm your AI study assistant for TNPSC Group 4 preparation. I can help you with:
            
• Understanding exam concepts
• Solving practice questions
• Providing study tips and strategies
• Explaining difficult topics
• Current affairs updates
• Mock test guidance

How can I assist you today?`,
            isUser: false,
            timestamp: new Date(),
            type: 'text'
        };
        this.messages.push(welcomeMessage);
    }

    async loadChatHistory(): Promise<void> {
        try {
            const history = await this.chatService.getChatHistory().toPromise();
            if (history && history.length > 0) {
                this.messages = [...this.messages, ...history];
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    async sendMessage(): Promise<void> {
        if (this.chatForm.invalid || this.isLoading) return;

        const messageText = this.chatForm.get('message')?.value.trim();
        if (!messageText) return;

        // Add user message
        const userMessage: ChatMessage = {
            id: Date.now(),
            content: messageText,
            isUser: true,
            timestamp: new Date(),
            type: 'text'
        };
        this.messages.push(userMessage);

        // Clear form
        this.chatForm.patchValue({ message: '' });

        // Show typing indicator
        this.isTyping = true;
        this.isLoading = true;

        try {
            const response = await this.chatService.sendMessage(messageText).toPromise();

            if (response?.success) {
                const aiMessage: ChatMessage = {
                    id: Date.now() + 1,
                    content: response.response,
                    isUser: false,
                    timestamp: new Date(),
                    type: 'text'
                };
                this.messages.push(aiMessage);
            } else {
                this.toastr.error(response?.message || 'Failed to get response');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.toastr.error('An error occurred while sending your message');
        } finally {
            this.isTyping = false;
            this.isLoading = false;
        }
    }

    async sendQuickQuestion(question: string): Promise<void> {
        this.chatForm.patchValue({ message: question });
        await this.sendMessage();
    }

    scrollToBottom(): void {
        try {
            this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
        } catch (err) {
            console.error('Error scrolling to bottom:', err);
        }
    }

    goToDashboard(): void {
        this.router.navigate(['/dashboard']);
    }

    clearChat(): void {
        const confirmed = confirm('Are you sure you want to clear the chat history?');
        if (confirmed) {
            this.messages = [];
            this.addWelcomeMessage();
            this.chatService.clearChatHistory();
        }
    }

    formatTimestamp(timestamp: Date): string {
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    copyMessage(content: string): void {
        navigator.clipboard.writeText(content).then(() => {
            this.toastr.success('Message copied to clipboard!');
        });
    }
} 