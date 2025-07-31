import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DocumentNode } from 'graphql';
import { ChatMessage, ChatResponse } from '../models/chat.model';

const SEND_MESSAGE: DocumentNode = gql`
  mutation SendChatMessage($message: String!) {
    sendChatMessage(message: $message) {
      success
      message
      response
    }
  }
`;

const GET_CHAT_HISTORY: DocumentNode = gql`
  query GetChatHistory {
    chatHistory {
      id
      content
      isUser
      timestamp
      type
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private apollo: Apollo) { }

  sendMessage(message: string): Observable<ChatResponse> {
    return this.apollo.mutate<{ sendChatMessage: ChatResponse }>({
      mutation: SEND_MESSAGE,
      variables: { message }
    }).pipe(
      map(result => result.data?.sendChatMessage!)
    );
  }

  getChatHistory(): Observable<ChatMessage[]> {
    return this.apollo.watchQuery<{ chatHistory: ChatMessage[] }>({
      query: GET_CHAT_HISTORY
    }).valueChanges.pipe(
      map(result => result.data?.chatHistory || [])
    );
  }

  clearChatHistory(): void {
    // Clear from local storage or cache
    localStorage.removeItem('chatHistory');
  }
} 