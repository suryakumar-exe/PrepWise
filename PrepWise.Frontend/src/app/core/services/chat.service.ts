import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ChatMessage, ChatResponse } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  sendMessage(message: string, userId: number = 1): Observable<ChatResponse> {
    const graphqlQuery = {
      query: `
                mutation SendChatMessage($userId: Int!, $message: String!) {
                    sendChatMessage(userId: $userId, message: $message) {
                        success
                        message
                        response
                    }
                }
            `,
      variables: {
        userId: userId,
        message: message
      }
    };

    console.log('Sending GraphQL request:', graphqlQuery); // Debug log

    return this.http.post<any>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => {
          console.log('GraphQL response:', response); // Debug log
          const result = response.data?.sendChatMessage;
          if (result?.success) {
            return {
              success: true,
              message: result.message,
              response: result.response
            };
          }
          return {
            success: false,
            message: 'Failed to send message',
            response: 'Sorry, I am unable to respond at the moment.'
          };
        }),
        catchError(error => {
          console.error('GraphQL error:', error); // Debug log
          return of({
            success: false,
            message: 'Failed to send message',
            response: 'Sorry, I am unable to respond at the moment.'
          });
        })
      );
  }

  getChatHistory(userId: number = 1): Observable<ChatMessage[]> {
    const graphqlQuery = {
      query: `
                query GetChatHistory($userId: Int!) {
                    chatHistory(userId: $userId) {
                        id
                        content
                        timestamp
                        isUser
                    }
                }
            `,
      variables: {
        userId: userId
      }
    };

    return this.http.post<any>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => {
          const history = response.data?.chatHistory;
          return history || [];
        }),
        catchError(error => {
          console.error('Error fetching chat history:', error);
          return of([]);
        })
      );
  }

  clearChatHistory(userId: number = 1): Observable<boolean> {
    const graphqlQuery = {
      query: `
                mutation ClearChatHistory($userId: Int!) {
                    clearChatHistory(userId: $userId) {
                        success
                        message
                    }
                }
            `,
      variables: {
        userId: userId
      }
    };

    return this.http.post<any>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => {
          const result = response.data?.clearChatHistory;
          return result?.success || false;
        }),
        catchError(error => {
          console.error('Error clearing chat history:', error);
          return of(false);
        })
      );
  }
} 