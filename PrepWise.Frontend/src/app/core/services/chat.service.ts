import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ChatMessage, ChatResponse } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  sendMessage(message: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/api/chat/send`, { message })
      .pipe(
        catchError(error => {
          console.error('Error sending chat message:', error);
          return of({
            success: false,
            message: 'Failed to send message',
            response: 'Sorry, I am unable to respond at the moment.'
          });
        })
      );
  }

  getChatHistory(): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/api/chat/history`)
      .pipe(
        catchError(error => {
          console.error('Error fetching chat history:', error);
          return of([]);
        })
      );
  }

  clearChatHistory(): void {
    // Clear from local storage or cache
    localStorage.removeItem('chatHistory');
  }
} 