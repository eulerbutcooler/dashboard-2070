"use client";
import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";

const Webrtcchat = () => {
  const [username, setUsername] = useState("");
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  type Message = { author: string; text: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [connectedPeers, setConnectedPeers] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const peersRef = useRef(new Map());
  const clientIdRef = useRef<string | null>(null);

  // **IMPORTANT**: Replace with your computer's local IP address
  const WEBSOCKET_URL = "ws://10.24.53.16:8000"; // Example IP

  useEffect(() => {
    // We only connect after the username is set to avoid connecting without an identity
    if (!isUsernameSet) return;

    wsRef.current = new WebSocket(WEBSOCKET_URL);

    wsRef.current.onopen = () => {
      console.log("Connected to WebSocket server");
      console.log("Waiting for client ID assignment...");
    };

    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      // The logic for handling WebRTC signaling with proper error handling
      switch (message.type) {
        case "init":
          // Store our own client ID for reference
          clientIdRef.current = message.id;
          console.log(`✅ Received client ID: ${message.id}`);
          console.log(
            `📡 Found ${message.otherClientIds.length} existing peers:`,
            message.otherClientIds
          );
          message.otherClientIds.forEach(
            (peerId: any) => createPeer(peerId, true) // We initiate to existing peers
          );
          break;
        case "new-peer":
          // Only the existing client should initiate to the new peer
          console.log(
            `🆕 New peer joined: ${message.id}, My ID: ${clientIdRef.current}`
          );
          if (clientIdRef.current && clientIdRef.current < message.id) {
            // Use string comparison to determine who initiates
            console.log(`🚀 I will initiate connection to ${message.id}`);
            createPeer(message.id, true);
          } else {
            // Just log that we're aware of the new peer but don't initiate
            console.log(
              `⏳ Waiting for peer ${message.id} to initiate connection...`
            );
          }
          break;
        case "offer":
          console.log(`📨 Received offer from ${message.sender}`);
          addPeer(message.signal, message.sender);
          break;
        case "answer":
          console.log(`📨 Received answer from ${message.sender}`);
          const answerPeer = peersRef.current.get(message.sender);
          if (answerPeer && !answerPeer.destroyed) {
            try {
              answerPeer.signal(message.signal);
            } catch (error) {
              console.error(
                `Error signaling answer to peer ${message.sender}:`,
                error
              );
              // Clean up the peer if it's in a bad state
              peersRef.current.delete(message.sender);
              answerPeer.destroy();
            }
          }
          break;
        case "ice-candidate":
          console.log(`🧊 Received ICE candidate from ${message.sender}`);
          const candidatePeer = peersRef.current.get(message.sender);
          if (candidatePeer && !candidatePeer.destroyed) {
            try {
              candidatePeer.signal({ candidate: message.candidate });
            } catch (error) {
              console.error(
                `Error signaling ICE candidate to peer ${message.sender}:`,
                error
              );
              // Clean up the peer if it's in a bad state
              peersRef.current.delete(message.sender);
              candidatePeer.destroy();
            }
          }
          break;
      }
    };

    wsRef.current.onclose = () =>
      console.log("Disconnected from WebSocket server");

    return () => {
      wsRef.current?.close();
      // Properly destroy all peers before clearing the map
      peersRef.current.forEach((peer) => {
        if (!peer.destroyed) {
          peer.destroy();
        }
      });
      peersRef.current.clear();
    };
  }, [isUsernameSet]); // Rerun effect when username is set

  const sendMessageToWs = (payload: {
    type: string;
    target: any;
    candidate?: any;
    signal?: RTCSessionDescriptionInit;
  }) => {
    wsRef.current?.send(JSON.stringify(payload));
  };

  // WebRTC peer creation functions with improved error handling
  const createPeer = (peerID: any, initiator: boolean) => {
    console.log(
      `🔄 Creating peer connection to ${peerID} (initiator: ${initiator})`
    );

    // Check if peer already exists and clean it up first
    const existingPeer = peersRef.current.get(peerID);
    if (existingPeer && !existingPeer.destroyed) {
      console.log(`🧹 Cleaning up existing peer ${peerID}`);
      existingPeer.destroy();
    }

    const peer = new Peer({
      initiator,
      trickle: true,
      config: {
        // Empty iceServers array for local network operation
        iceServers: [],
        // Force gathering of all types of candidates
        iceTransportPolicy: "all",
        iceCandidatePoolSize: 0,
      },
    });

    peer.on("signal", (signal) => {
      console.log(
        `📡 Sending signal from ${clientIdRef.current} to ${peerID}:`,
        signal.type
      );
      if (signal.type === "candidate") {
        sendMessageToWs({
          type: "ice-candidate",
          target: peerID,
          candidate: signal.candidate,
        });
      } else if (signal.type === "offer") {
        sendMessageToWs({ type: "offer", target: peerID, signal });
      }
    });

    peer.on("error", (error) => {
      console.error(`Peer ${peerID} error:`, error);
      peersRef.current.delete(peerID);
    });

    setupPeerEvents(peer, peerID);
    peersRef.current.set(peerID, peer);
  };

  const addPeer = (incomingSignal: string | Peer.SignalData, callerID: any) => {
    console.log(`📞 Received offer from ${callerID}, creating answer peer`);

    // Check if peer already exists and clean it up first
    const existingPeer = peersRef.current.get(callerID);
    if (existingPeer && !existingPeer.destroyed) {
      console.log(`🧹 Cleaning up existing peer ${callerID}`);
      existingPeer.destroy();
    }

    const peer = new Peer({
      initiator: false,
      trickle: true,
      config: {
        // Empty iceServers array for local network operation
        iceServers: [],
        // Force gathering of all types of candidates
        iceTransportPolicy: "all",
        iceCandidatePoolSize: 0,
      },
    });

    peer.on("signal", (signal) => {
      console.log(
        `📡 Sending signal from ${clientIdRef.current} to ${callerID}:`,
        signal.type
      );
      if (signal.type === "candidate") {
        sendMessageToWs({
          type: "ice-candidate",
          target: callerID,
          candidate: signal.candidate,
        });
      } else if (signal.type === "answer") {
        sendMessageToWs({ type: "answer", target: callerID, signal });
      }
    });

    peer.on("error", (error) => {
      console.error(`Peer ${callerID} error:`, error);
      peersRef.current.delete(callerID);
    });

    try {
      peer.signal(incomingSignal);
    } catch (error) {
      console.error(`Error signaling incoming offer from ${callerID}:`, error);
      peer.destroy();
      return;
    }

    setupPeerEvents(peer, callerID);
    peersRef.current.set(callerID, peer);
  };

  const setupPeerEvents = (peer: Peer.Instance, peerID: any) => {
    peer.on("connect", () => {
      console.log(`✅ CONNECTED to peer ${peerID}`);
      setConnectedPeers(peersRef.current.size);
    });

    peer.on("data", (data) => {
      try {
        // When we receive data, we add it to our messages state
        const msg = JSON.parse(data.toString());
        setMessages((prev) => [...prev, msg]);
      } catch (error) {
        console.error(`Error parsing message from peer ${peerID}:`, error);
      }
    });

    peer.on("close", () => {
      console.log(`Disconnected from peer ${peerID}`);
      peersRef.current.delete(peerID);
      setConnectedPeers(peersRef.current.size);
    });

    peer.on("error", (error) => {
      console.error(`Peer ${peerID} connection error:`, error);
      peersRef.current.delete(peerID);
      setConnectedPeers(peersRef.current.size);
    });

    // Add ICE connection state monitoring for debugging
    peer.on("iceStateChange", (iceConnectionState) => {
      console.log(`ICE state for peer ${peerID}:`, iceConnectionState);
      if (
        iceConnectionState === "failed" ||
        iceConnectionState === "disconnected"
      ) {
        console.log(
          `ICE connection failed/disconnected for peer ${peerID}, cleaning up...`
        );
        setTimeout(() => {
          if (peersRef.current.has(peerID)) {
            const failedPeer = peersRef.current.get(peerID);
            if (failedPeer && !failedPeer.destroyed) {
              failedPeer.destroy();
            }
            peersRef.current.delete(peerID);
            setConnectedPeers(peersRef.current.size);
          }
        }, 3000); // Give it 3 seconds before cleanup
      }
    });
  };

  const handleSetUsername = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (username.trim()) {
      setIsUsernameSet(true);
    }
  };

  const handleSendMessage = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // **CHANGE**: The message payload now includes the username
    const messagePayload = {
      author: username,
      text: newMessage,
    };

    // Add our own message to the chat display immediately
    setMessages((prev) => [...prev, messagePayload]);

    // Broadcast the message payload to all connected peers
    peersRef.current.forEach((peer, peerID) => {
      if (peer.connected && !peer.destroyed) {
        try {
          peer.send(JSON.stringify(messagePayload));
        } catch (error) {
          console.error(`Error sending message to peer ${peerID}:`, error);
          // Remove the peer if it's in a bad state
          peersRef.current.delete(peerID);
          if (!peer.destroyed) {
            peer.destroy();
          }
        }
      }
    });
    setNewMessage("");
  };

  // Conditional UI Rendering
  if (!isUsernameSet) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        {/* Main login panel */}
        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-center text-white mb-2 tracking-wide">
              BROADCAST ACCESS
            </h2>
            <p className="text-center text-white/70 mb-8 text-sm">
              OPERATOR AUTHORIZATION REQUIRED
            </p>

            <form onSubmit={handleSetUsername} className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ENTER OPERATOR ID"
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
              >
                <span className="flex items-center justify-center">
                  <span className="mr-2">📡</span>
                  ACCESS TERMINAL
                </span>
              </button>
            </form>

            {/* Status indicator */}
            <div className="flex items-center justify-center mt-6 text-emerald-400 text-xs">
              <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
              SYSTEM READY
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-400 rounded-full mr-3 animate-pulse"></div>
              <h2 className="text-2xl font-bold text-white tracking-wide">
                BROADCAST TERMINAL
              </h2>
              <div className="ml-4 text-red-400 text-sm animate-pulse">
                ● LIVE
              </div>
            </div>
            <div className="text-right">
              <div className="text-white/70 text-sm">OPERATOR:</div>
              <div className="text-white font-semibold">{username}</div>
            </div>
          </div>

          {/* Status bar */}
          <div className="mt-4 flex items-center text-xs space-x-6">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-emerald-400">NETWORK ONLINE</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-amber-400 rounded-full mr-2"></div>
              <span className="text-amber-400">
                {connectedPeers} RECEIVERS ACTIVE
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></div>
              <span className="text-cyan-400">ENCRYPTION: QUANTUM</span>
            </div>
          </div>
        </div>

        {/* Broadcast Messages Container */}
        <div className="relative">
          {/* Subtle top border glow */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

          <div className="h-80 overflow-y-scroll scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-cyan-600 p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-white/50 text-sm py-8">
                <div className="animate-pulse">AWAITING BROADCAST...</div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div key={index} className="w-full">
                {/* Broadcast Message Style */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-sm shadow-lg hover:bg-white/15 transition-all duration-300">
                  {/* Timestamp and sender info */}
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-cyan-400 font-semibold">
                        BROADCAST
                      </span>
                      <span className="mx-2 text-white/30">•</span>
                      <span className="text-purple-400 font-semibold">
                        {msg.author}
                      </span>
                    </div>
                    <div className="text-white/50">
                      {new Date().toLocaleTimeString("en-US", {
                        hour12: false,
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </div>
                  </div>

                  {/* Message content */}
                  <div className="text-white leading-relaxed break-words mb-3">
                    {msg.text}
                  </div>

                  {/* Status indicator */}
                  <div className="flex items-center justify-end text-xs">
                    <span className="text-emerald-400 mr-1">✓</span>
                    <span className="text-emerald-400">TRANSMITTED</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Broadcast Input Section */}
        <div className="p-6 border-t border-white/10">
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="ENTER BROADCAST MESSAGE..."
                className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300"
              />
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-red-500/80 to-orange-500/80 hover:from-red-500 hover:to-orange-500 backdrop-blur-sm text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg border border-white/20 flex items-center"
            >
              <span className="mr-2">📡</span>
              BROADCAST
            </button>
          </form>

          {/* Clean footer */}
          <div className="mt-4 text-xs text-white/50 flex items-center">
            <span className="text-cyan-400 mr-2">$</span>
            <span>
              broadcast_system --network=local --encryption=quantum
              --priority=high
            </span>
            <div className="ml-2 w-2 h-3 bg-cyan-400 animate-pulse rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Webrtcchat;
