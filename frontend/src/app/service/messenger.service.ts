import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

export interface ChatMessage {
    id: number;
    chatroom: number;
    sender_username: string;
    content: string;
    file: File | null;
    link: URL | null;
    created_at: string;
}

export interface SendMessageRequest {
    chatroom: number;
    content: string;
    file: File | null;
    link: URL | null;
}

export interface ChatRoom {
    id: number;
    name: string;
    is_group: boolean;
    members: number[];
    created_at: string;
}

export interface User {
    id: number;
    username: string;
}

@Injectable({
    providedIn: 'root'
})
export class MessengerService {
    private API_URL = 'http://127.0.0.1:8000/api';
    private socket!: WebSocket;

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    private getAuthHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    getChatHistory(roomId: number): Observable<ChatMessage[]> {
        return this.http.get<ChatMessage[]>(`${this.API_URL}/messages/?room=${roomId}`, {
            headers: this.getAuthHeaders()
        });
    }

    connectWebSocket(roomId: number): WebSocket {
        this.socket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomId}/`);
        return this.socket;
    }

    sendMessage(message: SendMessageRequest): Observable<ChatMessage> {
        const formData = new FormData();
        formData.append('chatroom', message.chatroom.toString());
        formData.append('content', message.content);
        if (message.file) {
            formData.append('file', message.file);
        }
        if (message.link) {
            formData.append('link', message.link.toString());
        }

        return this.http.post<ChatMessage>(
            `${this.API_URL}/messages/`,
            formData,
            { headers: this.getAuthHeaders() }
        );
    }

    disconnectWebSocket(): void {
        if (this.socket) {
            this.socket.close();
        }
    }

    getChatRooms(): Observable<ChatRoom[]> {
        return this.http.get<ChatRoom[]>(`${this.API_URL}/chatrooms/`, {
            headers: this.getAuthHeaders()
        });
    }

    createChatRoom(data: FormData | ChatRoom): Observable<ChatRoom> {
        return this.http.post<ChatRoom>(`${this.API_URL}/chatrooms/`, data, {
            headers: this.getAuthHeaders()
        });
    }

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.API_URL}/users/`, {
            headers: this.getAuthHeaders()
        });
    }
}
