# Dashboard 2070 - Post-Apocalyptic Survival Dashboard

A futuristic post-apocalyptic personal dashboard with immersive survival gameplay, real-time vitals monitoring, and peer-to-peer communication capabilities.

## 🌟 Features

### Core Dashboard
- **📸 Camera Integration**: Capture your photo to personalize the experience
- **🎮 Survival Game**: Infinite survival mechanics with health decay and decision-making
- **📊 Real-time Vitals**: Health monitoring, AQI tracking, radiation levels, and weather conditions
- **📻 Radio Communications**: Live survivor messages with status indicators
- **🏠 Safehouse Integration**: Quick access to shelter and safety resources
- **🎨 Animated Character**: Dynamic character cycling with post-apocalyptic themes

### WebRTC Chat System
- **🌐 Peer-to-Peer Communication**: Direct browser-to-browser messaging without servers
- **🔒 Offline Capable**: Works on local networks without internet connectivity
- **📡 Real-time Messaging**: Instant communication between connected survivors
- **👥 Multi-peer Support**: Connect with multiple users simultaneously
- **🔐 Secure Communication**: Direct encrypted connections between peers

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser with WebRTC support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/eulerbutcooler/dashboard-2070.git
   cd dashboard-2070
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🛠 Technology Stack

### Frontend Framework
- **Next.js 15.5.2**: React framework with server-side rendering
- **React 19**: Component-based UI library
- **TypeScript**: Type-safe JavaScript development

### Styling & Animation
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **Framer Motion 11.15.0**: Advanced animation library for smooth UI transitions

### WebRTC Dependencies

#### Core WebRTC Library
- **simple-peer 9.11.1**: Simplified WebRTC peer-to-peer connections
  - Abstracts complex WebRTC APIs
  - Handles ICE candidates and signaling
  - Cross-browser compatibility
  - Automatic fallback mechanisms

#### Type Definitions
- **@types/simple-peer**: TypeScript type definitions for simple-peer
  - Provides type safety for WebRTC operations
  - Enhanced IDE support and autocomplete

### UI Components
- **Lucide React 0.468.0**: Modern icon library with React components

## 📡 WebRTC Chat System

### How It Works

The WebRTC chat system enables direct peer-to-peer communication between browsers without requiring a central server for message relay.

#### Architecture
1. **WebSocket Signaling Server**: Facilitates initial peer discovery and connection establishment
2. **Simple-Peer Library**: Handles WebRTC peer connection management
3. **Direct P2P Communication**: Once connected, messages flow directly between browsers

#### Key Features

**🔄 Automatic Peer Management**
- Automatic connection establishment with new peers
- Graceful handling of peer disconnections
- ICE candidate exchange for NAT traversal

**📱 Offline Operation**
- Works on local networks without internet
- No external server dependencies for messaging
- Local WebSocket server for peer discovery

**🛡 Security**
- End-to-end encrypted communication
- No message storage on servers
- Direct browser-to-browser connections

#### Dependencies Explained

**simple-peer**
- Primary WebRTC abstraction library
- Simplifies peer connection creation and management
- Handles complex WebRTC signaling automatically
- Provides fallback mechanisms for different network configurations

**WebSocket Server (External)**
- Required for initial peer discovery
- Runs on `ws://10.24.53.16:8000` (configurable)
- Only used for signaling, not message relay
- Can be hosted locally for complete offline operation

### Usage

1. **Enter Operator ID**: Set your username in the broadcast terminal
2. **Automatic Connection**: System automatically discovers and connects to other peers
3. **Send Messages**: Type and broadcast messages to all connected survivors
4. **Real-time Updates**: See connection status and active receivers

## 🎮 Survival Game Mechanics

- **Health Decay**: 100% → 0% over 60 seconds
- **Survival Choices**: Random encounters every 5 seconds
- **Health Recovery**: Make correct choices to gain +17 health
- **Infinite Gameplay**: Balanced mechanics for continuous survival

## 🏗 Project Structure

```
dashboard-2070/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main application entry
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── dashboard.tsx     # Main dashboard component
│   │   ├── WebrtcChat.tsx    # P2P chat system
│   │   └── vital-card.tsx    # Vitals display component
│   └── lib/
│       └── utils.ts          # Utility functions
├── public/
│   ├── bg.png               # Background image
│   ├── char.png             # Character images
│   ├── char2.png
│   └── char3.png
└── README.md
```

## 🔧 Configuration

### WebRTC Settings
Update the WebSocket URL in `src/components/WebrtcChat.tsx`:
```typescript
const WEBSOCKET_URL = "ws://YOUR_IP_ADDRESS:8000";
```

### Deployment
For production deployment, ensure:
- HTTPS is enabled (required for camera access)
- WebSocket server is accessible
- Proper CORS configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**WebRTC Connection Failed**
- Ensure WebSocket server is running
- Check firewall settings
- Verify local network connectivity

**Camera Access Denied**
- Enable camera permissions in browser
- Use HTTPS in production
- Check browser compatibility

**Build Errors**
- Run `npm install` to ensure all dependencies are installed
- Clear `.next` cache: `rm -rf .next`
- Restart development server

## 🌟 Acknowledgments

- Post-apocalyptic theme inspiration from cyberpunk aesthetics
- WebRTC implementation based on simple-peer library
- UI design influenced by terminal and command-line interfaces

---

**Stay alive, survivor. The wasteland is harsh, but together we can rebuild.** 🌅
