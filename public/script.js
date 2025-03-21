class ChatApp {
    constructor() {
        this.socket = io();
        this.currentRoom = null;
        this.currentUser = null;
        this.isAdmin = false;
        
        this.initElements();
        this.setupEventListeners();
        this.setupSocketHandlers();
        this.checkConnection();
    }


        // ... (keep existing constructor and other methods)
    
        async handleJoinRoom() {
            const roomInput = this.elements.roomInput;
            const joinBtn = this.elements.joinChatBtn;
            const errorDisplay = this.elements.joinError;
    
            // Validate input
            const rawCode = roomInput.value;
            const roomCode = rawCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
            
            if (roomCode.length !== 6) {
                this.showError('Please enter a valid 6-character code');
                return;
            }
    
            // Show loading state
            this.setLoadingState(true, joinBtn);
            errorDisplay.style.display = 'none';
    
            try {
                const response = await new Promise((resolve) => {
                    this.socket.emit('join-room', roomCode, resolve);
                    setTimeout(() => resolve({ 
                        status: 'error', 
                        message: 'Server timeout' 
                    }), 5000);
                });
    
                if (response.status === 'success') {
                    this.currentRoom = roomCode;
                    this.currentUser = response.username;
                    this.isAdmin = false;
                    
                    // Update UI
                    this.elements.currentRoom.textContent = roomCode;
                    this.elements.currentUser.textContent = response.username;
                    this.elements.closeRoomBtn.style.display = 'none';
                    
                    // Clear input and show chat
                    roomInput.value = '';
                    this.showPage('chat');
                } else {
                    this.showError(response.message || 'Failed to join room');
                }
            } catch (error) {
                console.error('Join error:', error);
                this.showError('Connection error. Please try again.');
            } finally {
                this.setLoadingState(false, joinBtn);
            }
        }
    
        setLoadingState(isLoading, button) {
            const spinner = button.querySelector('.loading-spinner');
            const text = button.querySelector('.button-text');
            
            button.disabled = isLoading;
            text.textContent = isLoading ? 'Joining...' : 'Join';
            spinner.style.display = isLoading ? 'block' : 'none';
        }
    
        showError(message) {
            const errorDisplay = this.elements.joinError;
            errorDisplay.textContent = message;
            errorDisplay.style.display = 'block';
            
            setTimeout(() => {
                errorDisplay.style.display = 'none';
            }, 3000);
        }
    
        // ... (keep rest of the methods)


    initElements() {
        this.elements = {
            pages: {
                main: document.getElementById('mainPage'),
                create: document.getElementById('createPage'),
                join: document.getElementById('joinPage'),
                chat: document.getElementById('chatPage')
            },
            connectionStatus: document.getElementById('connectionStatus'),
            roomCodeDisplay: document.getElementById('roomCodeDisplay'),
            roomInput: document.getElementById('roomInput'),
            joinError: document.getElementById('joinError'),
            currentRoom: document.getElementById('currentRoom'),
            currentUser: document.getElementById('currentUser'),
            messages: document.getElementById('messages'),
            messageInput: document.getElementById('messageInput'),
            closeRoomBtn: document.getElementById('closeRoom'),
            joinChatBtn: document.getElementById('joinChat')
        };
    }

    setupEventListeners() {
        document.getElementById('createBtn').addEventListener('click', () => this.handleCreateRoom());
        document.getElementById('joinBtn').addEventListener('click', () => this.showPage('join'));
        document.getElementById('startChat').addEventListener('click', () => this.showPage('chat'));
        this.elements.joinChatBtn.addEventListener('click', () => this.handleJoinRoom());
        this.elements.closeRoomBtn.addEventListener('click', () => this.handleCloseRoom());
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        
        document.querySelectorAll('.secondary').forEach(btn => {
            btn.addEventListener('click', () => this.showPage('main'));
        });

        this.elements.roomInput.addEventListener('input', (e) => {
            const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            e.target.value = raw.slice(0, 6);
        });

        this.elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    setupSocketHandlers() {
        this.socket.on('connect', () => {
            this.updateConnectionStatus('Connected', 'var(--success)');
        });

        this.socket.on('disconnect', () => {
            this.updateConnectionStatus('Disconnected', 'var(--danger)');
            this.showPage('main');
        });

        this.socket.on('connect_error', () => {
            this.updateConnectionStatus('Connection Error', 'var(--danger)');
        });

        this.socket.on('new-message', (data) => {
            this.addMessage(data);
        });

        this.socket.on('user-joined', (username) => {
            this.addSystemMessage(`${username} joined the room`);
        });

        this.socket.on('user-left', (username) => {
            this.addSystemMessage(`${username} left the room`);
        });

        this.socket.on('room-closed', () => {
            this.showPage('main');
            alert('Room has been closed by the admin');
        });
    }

    checkConnection() {
        if (!this.socket.connected) {
            this.updateConnectionStatus('Connecting...', 'var(--warning)');
        }
    }

    updateConnectionStatus(text, color) {
        this.elements.connectionStatus.textContent = text;
        this.elements.connectionStatus.style.backgroundColor = color;
    }

    showPage(page) {
        Object.values(this.elements.pages).forEach(p => p.classList.remove('active'));
        this.elements.pages[page].classList.add('active');
        
        if (page === 'chat') {
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        }
    }

    async handleCreateRoom() {
        try {
            const response = await new Promise((resolve) => {
                this.socket.emit('create-room', resolve);
            });

            if (response.status === 'success') {
                this.currentRoom = response.roomCode;
                this.currentUser = response.username;
                this.isAdmin = true;
                this.elements.roomCodeDisplay.textContent = response.roomCode;
                this.elements.currentRoom.textContent = response.roomCode;
                this.elements.currentUser.textContent = response.username;
                this.showPage('create');
            } else {
                alert('Error creating room: ' + response.message);
            }
        } catch (error) {
            console.error('Create room error:', error);
            alert('Failed to create room');
        }
    }

    async handleJoinRoom() {
        const roomCode = this.elements.roomInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        if (roomCode.length !== 6) {
            this.showError('Please enter a valid 6-character code');
            return;
        }

        this.setLoadingState(true);
        
        try {
            const response = await new Promise((resolve) => {
                this.socket.emit('join-room', roomCode, resolve);
                setTimeout(() => resolve({ 
                    status: 'error', 
                    message: 'Server timeout' 
                }), 5000);
            });

            if (response.status === 'success') {
                this.currentRoom = roomCode;
                this.currentUser = response.username;
                this.isAdmin = false;
                this.elements.currentRoom.textContent = roomCode;
                this.elements.currentUser.textContent = response.username;
                this.elements.closeRoomBtn.style.display = 'none';
                this.showPage('chat');
            } else {
                this.showError(response.message || 'Failed to join room');
            }
        } catch (error) {
            console.error('Join error:', error);
            this.showError('Connection error');
        } finally {
            this.setLoadingState(false);
            this.elements.roomInput.value = '';
        }
    }

    setLoadingState(isLoading) {
        this.elements.joinChatBtn.disabled = isLoading;
        const spinner = this.elements.joinChatBtn.querySelector('.loading-spinner');
        const text = this.elements.joinChatBtn.querySelector('.button-text');
        text.textContent = isLoading ? 'Joining...' : 'Join';
        spinner.style.display = isLoading ? 'block' : 'none';
    }

    showError(message) {
        this.elements.joinError.textContent = message;
        this.elements.joinError.style.display = 'block';
        setTimeout(() => {
            this.elements.joinError.style.display = 'none';
        }, 3000);
    }

    addMessage(data) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${data.isAdmin ? 'admin' : ''}`;
        
        const meta = document.createElement('div');
        meta.className = 'message-meta';
        meta.innerHTML = `
            <strong>${data.username}</strong>
            <small>${new Date(data.timestamp).toLocaleTimeString()}</small>
        `;
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = data.message;

        messageDiv.append(meta, content);
        this.elements.messages.appendChild(messageDiv);
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }

    addSystemMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system';
        messageDiv.textContent = text;
        this.elements.messages.appendChild(messageDiv);
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }

    sendMessage() {
        const message = this.elements.messageInput.value.trim();
        if (message) {
            this.socket.emit('send-message', message);
            this.elements.messageInput.value = '';
        }
    }

    handleCloseRoom() {
        if (confirm('Are you sure you want to close this room?')) {
            this.socket.emit('close-room', this.currentRoom);
            this.showPage('main');
        }
    }
}

// Initialize application
new ChatApp();