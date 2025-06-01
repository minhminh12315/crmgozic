import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MessengerService, ChatMessage, SendMessageRequest, ChatRoom, User } from '../service/messenger.service';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-messenger',
    templateUrl: './messenger.component.html',
    styleUrls: ['./messenger.component.css'],
    standalone: true,
    imports: [
        FormsModule,
        CommonModule,
        HttpClientModule
    ],
    providers: [MessengerService]
})

export class MessengerComponent implements OnInit, AfterViewInit, AfterViewChecked {
    @ViewChild('fileInput') fileInput!: ElementRef;
    @ViewChild('chatBox') chatBox!: ElementRef;

    currentUsername: string = '';
    socket!: WebSocket;
    messages: ChatMessage[] = [];
    messageInput: string = '';
    selectedFile: File | null = null;
    clientId: string = crypto.randomUUID();

    // Chat rooms
    chatRooms: ChatRoom[] = [];
    selectedRoom: ChatRoom | null = null;
    // showDirectMessages: boolean = true;
    // showGroups: boolean = true;

    // Link handling
    showLinkModal: boolean = false;
    linkInput: string = '';
    selectedLink: string | null = null;

    // New Chat Modal
    showNewChatModal: boolean = false;
    newChatName: string = '';
    isGroupChat: boolean = false;
    users: User[] = [];
    selectedUsers: number[] = [];

    constructor(
        private messengerService: MessengerService,
        private authService: AuthService
    ) {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
            this.currentUsername = currentUser.username;
            console.log('Messenger initialized with user:', this.currentUsername);
        } else {
            console.log('No user found when initializing messenger');
        }

        // Subscribe to auth changes
        this.authService.currentUser$.subscribe(user => {
            if (user) {
                this.currentUsername = user.username;
                console.log('User updated in messenger:', this.currentUsername);
            } else {
                console.log('User logged out or not authenticated');
            }
        });
    }

    ngOnInit(): void {
        console.log('Messenger component initialized. Current user:', this.currentUsername);
        this.loadChatRooms();
        this.loadUsers();
    }

    ngAfterViewInit() {
        this.scrollToBottom();
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    loadChatRooms(): void {
        this.messengerService.getChatRooms().subscribe({
            next: (rooms) => {
                this.chatRooms = rooms;
                // If there are rooms, select the first one by default
                if (rooms.length > 0 && !this.selectedRoom) {
                    this.selectRoom(rooms[0]);
                }
            },
            error: (error) => {
                console.error('Error loading chat rooms:', error);
            }
        });
    }

    selectRoom(room: ChatRoom): void {
        if (this.selectedRoom?.id === room.id) return;

        // Disconnect from current room's WebSocket if connected
        if (this.socket) {
            this.disconnectFromCurrentRoom();
        }

        this.selectedRoom = room;
        this.messages = []; // Clear current messages
        this.loadChatHistory(room.id);
        this.connectToRoom(room.id);
    }

    // toggleCategory(category: 'direct' | 'groups'): void {
    //     if (category === 'direct') {
    //         this.showDirectMessages = !this.showDirectMessages;
    //     } else {
    //         this.showGroups = !this.showGroups;
    //     }
    // }

    getFilteredRooms(isGroup: boolean): ChatRoom[] {
        return this.chatRooms.filter(room => room.is_group === isGroup);
    }

    getLastMessage(room: ChatRoom): string {
        if (this.selectedRoom?.id === room.id && this.messages.length > 0) {
            const lastMessage = this.messages[this.messages.length - 1];
            return `${lastMessage.sender_username}: ${lastMessage.content}` || "No message content";
        }
        return "Click to view conversation";
    }

    getLastMessageTime(room: ChatRoom): string {
        if (this.selectedRoom?.id === room.id && this.messages.length > 0) {
            const lastMessage = this.messages[this.messages.length - 1];
            return this.formatTime(lastMessage.created_at);
        }
        return "";
    }

    loadUsers(): void {
        this.messengerService.getUsers().subscribe({
            next: (users) => {
                // Filter out current user
                this.users = users.filter(user => user.username !== this.currentUsername);
            },
            error: (error) => {
                console.error('Error loading users:', error);
            }
        });
    }

    toggleUserSelection(userId: number): void {
        const index = this.selectedUsers.indexOf(userId);
        if (index === -1) {
            if (!this.isGroupChat && this.selectedUsers.length > 0) {
                // For direct messages, only allow one user selection
                this.selectedUsers = [userId];
            } else {
                this.selectedUsers.push(userId);
            }
        } else {
            this.selectedUsers.splice(index, 1);
        }
    }

    createNewChat(): void {
        if (!this.newChatName.trim() || this.selectedUsers.length === 0) return;

        const formData = new FormData();
        formData.append('name', this.newChatName.trim());
        formData.append('is_group', this.isGroupChat.toString());
        this.selectedUsers.forEach(userId => {
            formData.append('members', userId.toString());
        });

        this.messengerService.createChatRoom(formData).subscribe({
            next: (room) => {
                this.chatRooms.unshift(room);
                this.selectRoom(room);
                this.showNewChatModal = false;
                this.resetNewChatForm();
            },
            error: (error) => {
                console.error('Error creating chat room:', error);
                // Có thể thêm thông báo lỗi cho người dùng ở đây
            }
        });
    }

    resetNewChatForm(): void {
        this.newChatName = '';
        this.isGroupChat = false;
        this.selectedUsers = [];
    }

    disconnectFromCurrentRoom(): void {
        if (this.socket) {
            this.socket.close();
        }
    }

    connectToRoom(roomId: number): void {
        this.socket = this.messengerService.connectWebSocket(roomId);

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.clientId === this.clientId) {
                return;
            }

            this.messages.push({
                id: Date.now(),
                chatroom: this.selectedRoom!.id,
                sender_username: data.user,
                content: data.message,
                file: data.file,
                link: data.link ? new URL(data.link) : null,
                created_at: new Date().toISOString()
            });

            // Scroll to bottom with a small delay to ensure message is rendered
            // setTimeout(() => this.scrollToBottom(), 100);
            this.scrollToBottom();
        };

        this.socket.onopen = () => {
            console.log('Connected to WebSocket');
            this.scrollToBottom();
        };

        this.socket.onclose = () => {
            console.log('WebSocket disconnected');
            this.scrollToBottom();
        };
    }

    scrollToBottom(): void {
        try {
            const element = this.chatBox?.nativeElement;
            if (element) {
                element.scrollTop = element.scrollHeight;
            }
        } catch (err) {
            console.error('Error scrolling to bottom:', err);
        }
    }

    loadChatHistory(roomId: number): void {
        this.messengerService.getChatHistory(roomId)
            .subscribe({
                next: (history) => {
                    this.messages = history;
                    this.scrollToBottom();
                },
                error: (error: Error) => {
                    console.error('Error fetching chat history:', error);
                }
            });
    }

    sendMessage(): void {
        if (!this.selectedRoom) return;

        if (this.messageInput.trim() || this.selectedFile || this.selectedLink) {
            const newMessage: SendMessageRequest = {
                chatroom: this.selectedRoom.id,
                content: this.messageInput.trim(),
                file: this.selectedFile,
                link: this.selectedLink ? new URL(this.selectedLink) : null
            };

            if (this.messageInput.trim() || this.selectedLink) {
                this.messengerService.sendMessage(newMessage).subscribe({
                    next: (response: ChatMessage) => {
                        this.messages.push({
                            id: response.id,
                            chatroom: response.chatroom,
                            sender_username: response.sender_username,
                            content: response.content,
                            file: response.file,
                            link: response.link,
                            created_at: response.created_at
                        });

                        this.socket.send(JSON.stringify({
                            message: response.content,
                            user: response.sender_username,
                            file: response.file,
                            link: response.link,
                            clientId: this.clientId
                        }));

                        this.messageInput = '';
                        this.selectedFile = null;
                        this.selectedLink = null;
                        if (this.fileInput) {
                            this.fileInput.nativeElement.value = '';
                        }
                        this.scrollToBottom();
                    },
                    error: (error: Error) => {
                        console.error('Error sending message:', error);
                    }
                });
            } else if (this.selectedFile) {
                this.messengerService.sendMessage(newMessage).subscribe({
                    next: (response: ChatMessage) => {
                        this.messages.push({
                            id: response.id,
                            chatroom: response.chatroom,
                            sender_username: response.sender_username,
                            content: response.content,
                            file: response.file,
                            link: response.link,
                            created_at: response.created_at
                        });

                        this.socket.send(JSON.stringify({
                            message: response.content,
                            user: response.sender_username,
                            file: response.file,
                            link: response.link,
                            clientId: this.clientId
                        }));

                        this.messageInput = '';
                        this.selectedFile = null;
                        this.selectedLink = null;
                        if (this.fileInput) {
                            this.fileInput.nativeElement.value = '';
                        }
                        this.scrollToBottom();
                    },
                    error: (error: Error) => {
                        console.error('Error sending message with file:', error);
                    }
                });
            }
        }
    }

    formatTime(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleString();
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
        }
    }

    removeSelectedFile(): void {
        this.selectedFile = null;
        if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
        }
    }

    getFilename(file: File | string): string {
        if (file instanceof File) {
            return file.name;
        } else if (typeof file === 'string') {
            return file.split('/').pop() || '';
        }
        return '';
    }

    openLinkInput(): void {
        this.showLinkModal = true;
    }

    addLink(): void {
        if (this.linkInput.trim()) {
            if (!this.linkInput.startsWith('http://') && !this.linkInput.startsWith('https://')) {
                this.linkInput = 'http://' + this.linkInput;
            }
            this.selectedLink = this.linkInput;
            this.linkInput = '';
            this.showLinkModal = false;
        }
    }

    cancelLink(): void {
        this.linkInput = '';
        this.showLinkModal = false;
    }

    removeSelectedLink(): void {
        this.selectedLink = null;
    }

    openNewChatModal(): void {
        this.showNewChatModal = true;
        this.resetNewChatForm();
    }

    cancelNewChat(): void {
        this.showNewChatModal = false;
        this.resetNewChatForm();
    }

    getRoomDisplayName(room: ChatRoom): string {
        if (room.is_group) {
            return room.name;
        } else {
            // Tìm user còn lại trong phòng chat 1-1
            const otherUser = this.users.find(user =>
                room.members.includes(user.id) && user.username !== this.currentUsername
            );
            return otherUser ? otherUser.username : room.name;
        }
    }
}
