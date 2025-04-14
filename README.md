# LAN_TALK

A modern, minimalistic yet vibrant LAN-based communication app with messaging, voice call, and video call features without internet dependency.

## UI Preview

The LAN_TALK interface features a modern, cyberpunk-inspired design with the following elements:

- Deep blue gradient background with subtle grid patterns
- Left sidebar showing online users with their status
- Main chat area in the center with message bubbles
- Chat input at the bottom with a gradient send button
- Voice and video call controls
- Headers with glassmorphism effects
- Neon accents in cyan and blue
- Dark color scheme optimized for low-light environments

The UI is designed to be intuitive and responsive, working well on both desktop and tablet devices within a local network environment.

## Features

- 🔐 **Local Authentication**: User registration and login without internet dependency
- 💬 **Messaging**: Real-time text messaging over local network
- 📞 **Voice Calls**: Make voice calls to other users on the same network
- 📹 **Video Calls**: Video conference with peers without internet
- 📂 **File Sharing**: Send files to other users on the local network
- 🌐 **Network Discovery**: Automatically find other users on the local network
- 🔒 **Security**: Encrypted communication and secure authentication

## Technology Stack

- **Frontend**: Next.js, React, TailwindCSS, Socket.IO Client, WebRTC
- **Backend**: Node.js, Express, Socket.IO, JWT Authentication
- **Database**: Simple JSON file storage for users (lightweight, no external DB needed)

## Installation

### Prerequisites

- Node.js 16+ or Bun 1.0+
- A Local Area Network (LAN) with multiple devices

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/lan-talk.git
cd lan-talk
```

2. Install dependencies:

```bash
# Using npm
npm install

# Using Bun (recommended)
bun install
```

3. Start the development server:

```bash
# Using npm
npm run dev:full

# Using Bun
bun run dev:full
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

### Accessing on Your Local Network

To allow other devices on your network to connect to the server:

1. Find your computer's local IP address (e.g., 192.168.1.100)
2. Other devices can connect by visiting:
```
http://192.168.1.100:3000
```

### Using the App

1. **Register an Account**: Create a new account from the login page
2. **Connect**: The app will automatically connect to the local server
3. **Chat**: Select a user from the sidebar to start chatting
4. **Call**: Use the call controls at the bottom of a chat to initiate voice or video calls
5. **Files**: Share files with other users directly in the chat

## Running in Production

To build and run the app for production:

```bash
# Build the frontend
bun run build

# Start the production server
bun run start
```

## LAN Setup Recommendations

For best performance:

- Use a stable wired or wireless network
- Ensure all devices are connected to the same local network
- For larger networks, consider a dedicated router for the LAN_TALK network

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- The cyberpunk design inspiration
- Icons from Lucide React
- ShadcnUI components

---

Created with ❤️ for local network communication
