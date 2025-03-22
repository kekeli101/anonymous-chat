# Anonymous Chat Application

## Overview
This is a simple real-time anonymous chat application built using **Node.js**, **Express**, and **Socket.IO**. Users can create or join chat rooms, send messages, and chat anonymously with others in the same room. The person who creates the room becomes the "admin" and has the ability to close the room, which disconnects all users.

---

## Features
1. **Create Room**: Users can create a new chat room with a unique 6-digit room key.
2. **Join Room**: Users can join an existing room by entering the 6-digit room key.
3. **Anonymous Usernames**: Each user is assigned a random, anonymous username (e.g., `Red-Lion-Apple`).
4. **Real-Time Messaging**: Users can send and receive messages in real-time within the room.
5. **Admin Controls**: The room creator (admin) can close the room, which disconnects all users.
6. **Responsive UI**: The application has a clean and responsive user interface.

---

## How It Works

### 1. **Create a Room**
- Click the **"Create Room"** button on the greeting page.
- A unique 6-digit room key is generated and displayed.
- The user becomes the admin of the room and is automatically joined into the room.
- The admin can start chatting or close the room at any time.

### 2. **Join a Room**
- Click the **"Join Room"** button on the greeting page.
- Enter the 6-digit room key provided by the room admin.
- If the room exists, the user is assigned a random username and joined into the room.
- The user can start chatting with others in the room.

### 3. **Send Messages**
- Once in the chat room, users can type messages in the input box and press **Enter** or click the **Send** button.
- Messages are broadcasted to all users in the room in real-time.

### 4. **Close Room (Admin Only)**
- The admin can click the **"Close Room"** button to close the room.
- All users in the room are disconnected and redirected to the greeting page.

---

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Steps to Run the Application

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-repo/anonymous-chat-app.git
   cd anonymous-chat-app
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Server**:
   ```bash
   node server.js
   ```

4. **Access the Application**:
   - Open your browser and go to `http://localhost:3000`.
   - The application should be up and running.

---

## Folder Structure
```
anonymous-chat-app/
├── public/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # CSS for styling
│   └── script.js           # Client-side JavaScript
├── server.js               # Server-side code
├── package.json            # Project dependencies
└── README.md               # Documentation
```

---

## Code Overview

### 1. **Server-Side (`server.js`)**
- Uses **Express** to serve static files and handle routes.
- Uses **Socket.IO** for real-time communication.
- Manages rooms and users using `Map` objects.
- Generates random room keys and usernames.

### 2. **Client-Side (`script.js`)**
- Handles user interactions (create room, join room, send messages).
- Listens for Socket.IO events (`new-message`, `room-closed`).
- Updates the UI dynamically based on server responses.

### 3. **Frontend (`index.html` and `styles.css`)**
- Provides a clean and responsive user interface.
- Uses CSS animations for message display.

---

## Key Functionality

### Room Creation
- When a user creates a room:
  - A unique 6-digit room key is generated.
  - The user is set as the admin.
  - The room is added to the `activeRooms` map.

### Joining a Room
- When a user joins a room:
  - The room key is validated.
  - A random username is assigned.
  - The user is added to the room's user list.

### Sending Messages
- When a user sends a message:
  - The message is emitted to the server.
  - The server broadcasts the message to all users in the room.

### Closing a Room
- When the admin closes a room:
  - All users in the room are notified.
  - The room is removed from the `activeRooms` map.

---

## Screenshots

### Greeting Page
![Greeting Page](screenshots/greeting-page.png)

### Create Room Page
![Create Room Page](screenshots/create-room.png)

### Join Room Page
![Join Room Page](screenshots/join-room.png)

### Chat Page
![Chat Page](screenshots/chat-page.png)

---

## Troubleshooting

### 1. **Messages Not Showing**
- Ensure the server is running and the client is connected.
- Check the browser console for errors.
- Verify that the `new-message` event is being emitted and received.

### 2. **Close Room Button Not Showing**
- Ensure the `isAdmin` flag is being set correctly.
- Verify that the `toggleCloseRoomButton` function is being called.

### 3. **Room Not Found**
- Ensure the room key is entered correctly.
- Verify that the room exists in the `activeRooms` map.

---

## Future Enhancements
1. **Persistent Rooms**: Save rooms in a database for longer-lasting sessions.
2. **User Authentication**: Add user authentication for personalized experiences.
3. **File Sharing**: Allow users to share files in the chat.
4. **Emoji Support**: Add emoji support for messages.
5. **Mobile App**: Develop a mobile version of the application.

---

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Author
[Your Name]  
[Your Email]  
[Your GitHub Profile]

---

Enjoy chatting anonymously! 🚀
