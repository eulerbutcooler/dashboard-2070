'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, Heart, Wind, Droplets, Radio } from 'lucide-react'
import Image from 'next/image'
import WebrtcChat from './WebrtcChat'

export default function Dashboard() {
  const [showDashboard, setShowDashboard] = useState(false)
  const [userImage, setUserImage] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [health, setHealth] = useState(100)
  const [currentAqiIndex, setCurrentAqiIndex] = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const [popupType, setPopupType] = useState<'cat' | 'water' | 'food' | 'shelter' | 'medicine' | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameTime, setGameTime] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [nextPopupTime, setNextPopupTime] = useState(0)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<{id: string, sender: string, message: string, timestamp: Date}[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chatVideoRef = useRef<HTMLVideoElement>(null)

  const charImages = ['/char2.png', '/char3.png']
  
  // AQI values for post-apocalyptic world (very poor air quality)
  const aqiValues = [
    { value: 412, status: 'Hazardous', color: '#7e1e9c' },
    { value: 387, status: 'Hazardous', color: '#7e1e9c' },
    { value: 456, status: 'Hazardous', color: '#7e1e9c' },
    { value: 398, status: 'Hazardous', color: '#7e1e9c' },
    { value: 523, status: 'Hazardous', color: '#7e1e9c' },
    { value: 445, status: 'Hazardous', color: '#7e1e9c' },
    { value: 367, status: 'Very Unhealthy', color: '#8f3f97' },
    { value: 489, status: 'Hazardous', color: '#7e1e9c' },
    { value: 401, status: 'Hazardous', color: '#7e1e9c' },
    { value: 512, status: 'Hazardous', color: '#7e1e9c' }
  ]

  const weather = {
    temp: '47°C',
    condition: 'Toxic Storm',
    radiation: '8.3 μSv/h'
  }

  // Radio messages from survivors
  const radioMessages = [
    { name: 'Aman', message: 'Found a supply cache near the old mall. Coordinates 34.2N, 45.8W', status: 'online' },
    { name: 'Rahul', message: 'Warning: Mutant pack spotted in sector 7. Stay away from the industrial zone.', status: 'urgent' },
    { name: 'Rishab', message: 'Anyone copy? Setting up a safe house near the river. Fresh water available.', status: 'online' },
    { name: 'Aditya', message: 'Medical supplies are running low. Does anyone have antibiotics to trade?', status: 'urgent' },
    { name: 'Harsh', message: 'Solar panels still functional. Can provide power for essential equipment.', status: 'online' },
    { name: 'Priya', message: 'Crops are growing well in the greenhouse. Harvest ready in 3 days.', status: 'online' },
    { name: 'Vikram', message: 'Radio tower is down in my sector. Switching to backup frequency 144.5 MHz.', status: 'urgent' },
    { name: 'Neha', message: 'Scavenged some canned goods from the subway tunnels. Food for 2 weeks.', status: 'online' },
    { name: 'Arjun', message: 'Vehicle repair complete. Can transport survivors to safe zones.', status: 'online' },
    { name: 'Kavya', message: 'Storm approaching from the east. Seek shelter immediately!', status: 'urgent' },
    { name: 'Dev', message: 'Established contact with northern settlement. They have a functioning hospital.', status: 'online' },
    { name: 'Ananya', message: 'Found an underground bunker with working generators. Room for 10 people.', status: 'online' },
    { name: 'Rohit', message: 'Trading post open at dawn. Accepting fuel, medicine, and ammunition.', status: 'online' },
    { name: 'Sneha', message: 'Water purification system online. Clean water available at coordinates 12.5N, 67.3E.', status: 'online' },
    { name: 'Karan', message: 'Hostile group moving south. Estimated 15-20 armed individuals. Be careful.', status: 'urgent' }
  ]

  // Survival encounters with balanced health for infinite survival
  const survivalEncounters = [
    {
      type: 'cat',
      title: '🐱 Stray Cat Found!',
      description: 'A hungry stray cat approaches you. What do you do?',
      choices: [
        { text: '🤲 Pet', action: 'pet', healthChange: 0 },
        { text: '🍖 Eat', action: 'eat', healthChange: 17 }
      ]
    },
    {
      type: 'water',
      title: '💧 Water Found!',
      description: 'You discover a bottle of clean water. What do you do?',
      choices: [
        { text: '💧 Drink', action: 'drink', healthChange: 17 },
        { text: '🚫 Save for Later', action: 'save', healthChange: 0 }
      ]
    },
    {
      type: 'food',
      title: '🥫 Canned Food!',
      description: 'You find a can of food, but it looks expired. What do you do?',
      choices: [
        { text: '🍽️ Eat Anyway', action: 'eat', healthChange: 17 },
        { text: '🗑️ Throw Away', action: 'discard', healthChange: 0 }
      ]
    },
    {
      type: 'shelter',
      title: '🏚️ Abandoned Building!',
      description: 'You find an abandoned building. It could be dangerous or safe. What do you do?',
      choices: [
        { text: '🏠 Enter & Rest', action: 'enter', healthChange: 17 },
        { text: '🚶 Keep Moving', action: 'continue', healthChange: 0 }
      ]
    },
    {
      type: 'medicine',
      title: '💊 Medical Supplies!',
      description: 'You discover some medical supplies. They might help or be contaminated. What do you do?',
      choices: [
        { text: '💉 Use Medicine', action: 'use', healthChange: 17 },
        { text: '🚫 Leave Them', action: 'ignore', healthChange: 0 }
      ]
    }
  ]

  // Character animation cycle - Always running
  useEffect(() => {
    if (showDashboard) {
      const interval = setInterval(() => {
        setCurrentCharIndex((prev) => (prev + 1) % charImages.length)
      }, 500)
      
      return () => clearInterval(interval)
    }
  }, [showDashboard, charImages.length])

  // AQI cycling - Always running
  useEffect(() => {
    if (showDashboard) {
      const interval = setInterval(() => {
        setCurrentAqiIndex((prev) => (prev + 1) % aqiValues.length)
      }, 2000) // Change every 2 seconds
      
      return () => clearInterval(interval)
    }
  }, [showDashboard, aqiValues.length])

  // Radio message cycling - every 7 seconds (always running)
  useEffect(() => {
    if (showDashboard) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => {
          const nextIndex = (prev + 1) % radioMessages.length
          return nextIndex
        })
      }, 7000) // Change every 7 seconds
      
      return () => clearInterval(interval)
    }
  }, [showDashboard, radioMessages.length])

  // Health decay system - Always running
  useEffect(() => {
    if (gameStarted && !gameOver) {
      const interval = setInterval(() => {
        setHealth((prevHealth) => {
          const newHealth = Math.max(0, prevHealth - (100 / 600)) // 100% ÷ 600 updates = 0.167% per update
          if (newHealth === 0) {
            setGameOver(true)
          }
          return newHealth
        })
        
        setGameTime(prev => prev + 0.1) // Track total time
      }, 100) // Update every 100ms (600 updates = 60 seconds)

      return () => clearInterval(interval)
    }
  }, [gameStarted, gameOver])

  // Question system - EXACTLY every 5 seconds with auto-change
  useEffect(() => {
    if (gameStarted && !gameOver) {
      // Set first popup at 2 seconds, then every 5 seconds after that
      if (nextPopupTime === 0) {
        setNextPopupTime(2) // First popup at 2 seconds
      }
      
      const checkForPopup = () => {
        if (gameTime >= nextPopupTime) {
          // Pick a random encounter
          const randomEncounter = survivalEncounters[Math.floor(Math.random() * survivalEncounters.length)]
          setShowPopup(true)
          setPopupType(randomEncounter.type as any)
          setNextPopupTime(prev => prev + 5) // Next popup in 5 seconds
        }
      }
      
      // Check every 100ms if it's time for a popup
      const interval = setInterval(checkForPopup, 100)
      
      return () => clearInterval(interval)
    }
  }, [gameStarted, gameOver, gameTime, nextPopupTime, survivalEncounters])

  // Auto-close popup after 5 seconds
  useEffect(() => {
    if (showPopup) {
      const timeout = setTimeout(() => {
        setShowPopup(false)
        setPopupType(null)
      }, 5000) // Auto-close after 5 seconds
      
      return () => clearTimeout(timeout)
    }
  }, [showPopup])

  const handlePopupChoice = (action: string, healthChange: number) => {
    setHealth((prev) => Math.min(100, prev + healthChange))
    setShowPopup(false)
    setPopupType(null)
  }

  const resetGame = () => {
    setHealth(100)
    setGameTime(0)
    setGameOver(false)
    setShowPopup(false)
    setPopupType(null)
    setNextPopupTime(0)
    setCurrentMessageIndex(0)
    setGameStarted(true)
  }

  const handleStartClick = () => {
    setShowCamera(true)
    startCamera()
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' 
        } 
      })
      setCameraStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Error accessing camera. Please allow camera permissions.')
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      setIsCapturing(true)
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageDataUrl = canvas.toDataURL('image/png')
        setUserImage(imageDataUrl)
        setIsCapturing(false)
        stopCamera()
      }
    }
  }

  const handleNext = () => {
    setShowDashboard(true)
    setGameStarted(true)
    setNextPopupTime(2) // First popup at 2 seconds
  }

  const handleRetry = () => {
    setUserImage(null)
    setIsCapturing(false)
    startCamera()
  }

  const toggleChat = () => {
    setShowChat(!showChat)
    if (!showChat && !localStream) {
      startChatVideo()
    }
  }

  const startChatVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240 }, 
        audio: true 
      })
      setLocalStream(stream)
      if (chatVideoRef.current) {
        chatVideoRef.current.srcObject = stream
      }
      setIsConnected(true)
    } catch (error) {
      console.error('Error accessing camera for chat:', error)
    }
  }

  const stopChatVideo = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
      setIsConnected(false)
    }
  }

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        sender: 'You',
        message: newMessage.trim(),
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, message])
      setNewMessage('')
      
      // Simulate a response (in real implementation, this would come from WebRTC peer)
      setTimeout(() => {
        const response = {
          id: (Date.now() + 1).toString(),
          sender: 'Survivor',
          message: 'Copy that, stay safe out there!',
          timestamp: new Date()
        }
        setChatMessages(prev => [...prev, response])
      }, 1000)
    }
  }

  // Show start screen if dashboard hasn't been initialized
  if (!showDashboard) {
    return (
      <div 
        className="min-h-screen relative flex items-center justify-center"
        style={{
          backgroundImage: 'url(/bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Translucent blurred overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        
        <div className="relative z-10 text-center">
          {!showCamera ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.button
                onClick={handleStartClick}
                className="px-12 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xl font-semibold rounded-lg hover:bg-white/20 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                START
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 max-w-2xl mx-auto"
            >
              {!userImage ? (
                <>
                  <div className="mb-6">
                    <Camera className="h-12 w-12 text-white mx-auto mb-4" />
                    <h2 className="text-white text-xl font-semibold mb-2">Capture Your Photo</h2>
                    <p className="text-white/70">Position yourself in the camera view</p>
                  </div>
                  
                  <div className="relative mb-6">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full max-w-md mx-auto rounded-lg border-2 border-white/20"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <motion.button
                      onClick={() => {
                        stopCamera()
                        setShowCamera(false)
                      }}
                      className="px-6 py-3 bg-red-500/20 backdrop-blur-md border border-red-500/30 text-white font-semibold rounded-lg hover:bg-red-500/30 transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                    
                    <motion.button
                      onClick={captureImage}
                      disabled={isCapturing}
                      className="px-8 py-3 bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-300 disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Camera className="h-5 w-5 mr-2 inline" />
                      {isCapturing ? 'Capturing...' : 'Capture'}
                    </motion.button>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <h2 className="text-white text-xl font-semibold mb-4">Photo Captured!</h2>
                  <div className="relative mb-6">
                    <img
                      src={userImage}
                      alt="Captured"
                      className="w-64 h-64 object-cover rounded-lg border-2 border-white/20 mx-auto"
                    />
                  </div>
                  <div className="flex gap-4 justify-center">
                    <motion.button
                      onClick={handleRetry}
                      className="px-6 py-3 bg-red-500/20 backdrop-blur-md border border-red-500/30 text-white font-semibold rounded-lg hover:bg-red-500/30 transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Retake
                    </motion.button>
                    <motion.button
                      onClick={handleNext}
                      className="px-8 py-3 bg-green-500/20 backdrop-blur-md border border-green-500/30 text-white font-semibold rounded-lg hover:bg-green-500/30 transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Next
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* No blur overlay after upload */}
      
      {/* Find Safehouses Button */}
      <motion.div
        className="fixed top-8 left-8 z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.a
          href="https://wikisillygoose.eulerbutcooler.tech"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-black/60 backdrop-blur-md border border-white/20 rounded-lg p-6 w-80 hover:bg-black/70 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🏠</div>
            <div>
              <h2 className="text-white text-xl font-bold">SAFEHOUSES</h2>
              <p className="text-white/70 text-sm">Find shelter & safety</p>
            </div>
          </div>
        </motion.a>
      </motion.div>
      
      {/* WebRTC Chat Component */}
      <motion.div
        className="fixed left-8 bottom-8 z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <WebrtcChat />
      </motion.div>
      
      {/* Animated Character cycling through images */}
      <motion.div
        className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0
        }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <Image
            src={charImages[currentCharIndex]}
            alt="Character"
            width={800}
            height={800}
            className="drop-shadow-lg"
          />
        </div>
      </motion.div>

      {/* Vitals Card */}
      <motion.div
        className="fixed top-8 right-8 z-10"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-lg p-6 w-80">
          <h2 className="text-white text-xl font-bold mb-4 flex items-center">
            <Heart className="h-5 w-5 mr-2 text-red-500" />
            VITALS
          </h2>
          
          {/* Health Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/80 text-sm">Health</span>
              <span className="text-white/80 text-sm">{Math.round(health)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 to-green-500 rounded-full"
                initial={{ width: '100%' }}
                animate={{ width: `${health}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>

          {/* AQI */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/80 text-sm flex items-center">
                <Wind className="h-4 w-4 mr-1" />
                AQI
              </span>
              <span 
                className="text-sm font-bold"
                style={{ color: aqiValues[currentAqiIndex].color }}
              >
                {aqiValues[currentAqiIndex].value}
              </span>
            </div>
            <div 
              className="text-xs px-2 py-1 rounded"
              style={{ 
                backgroundColor: `${aqiValues[currentAqiIndex].color}20`,
                color: aqiValues[currentAqiIndex].color 
              }}
            >
              {aqiValues[currentAqiIndex].status}
            </div>
          </div>

          {/* Weather */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-white/80 text-sm">Temperature</span>
              <span className="text-orange-400 text-sm font-bold">{weather.temp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80 text-sm">Condition</span>
              <span className="text-purple-400 text-sm">{weather.condition}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80 text-sm">Radiation</span>
              <span className="text-yellow-400 text-sm font-bold">{weather.radiation}</span>
            </div>
          </div>

          {/* Game Stats */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/60">Survived</span>
                <span className="text-white/80 font-bold">{(gameTime / 60).toFixed(1)}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Status</span>
                <span className={`text-xs font-bold ${health > 50 ? 'text-green-400' : health > 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {health > 50 ? 'STABLE' : health > 20 ? 'CRITICAL' : 'DYING'}
                </span>
              </div>
            </div>
            {/* Game state indicator */}
            <div className="mt-2 text-xs text-center">
              <div className="space-y-1">
                <span className="text-white/50">🔄 Health decays 100% → 0% in 60s</span>
                <div className="text-white/30">
                  Next choice: {Math.max(0, nextPopupTime - gameTime).toFixed(1)}s
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Radio Card */}
      <motion.div
        className="fixed top-8 right-8 z-10"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{ marginTop: '420px' }} // Position below vitals card
      >
        <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-lg p-6 w-80">
          <h2 className="text-white text-xl font-bold mb-4 flex items-center">
            <Radio className="h-5 w-5 mr-2 text-green-500" />
            RADIO
          </h2>
          
          {/* Radio Message */}
          <motion.div
            key={currentMessageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            {/* Sender Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    radioMessages[currentMessageIndex].status === 'urgent' 
                      ? 'bg-red-500' 
                      : 'bg-green-500'
                  }`}
                />
                <span className="text-white/90 font-semibold text-sm">
                  {radioMessages[currentMessageIndex].name}
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                radioMessages[currentMessageIndex].status === 'urgent'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-green-500/20 text-green-400'
              }`}>
                {radioMessages[currentMessageIndex].status === 'urgent' ? 'URGENT' : 'ONLINE'}
              </span>
            </div>

            {/* Message Content */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-white/80 text-sm leading-relaxed">
                {radioMessages[currentMessageIndex].message}
              </p>
            </div>

            {/* Signal Strength Indicator */}
            <div className="flex items-center space-x-2">
              <span className="text-white/60 text-xs">Signal:</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((bar) => (
                  <div
                    key={bar}
                    className={`w-1 rounded-full ${
                      bar <= 4 ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                    style={{ height: `${bar * 2 + 2}px` }}
                  />
                ))}
              </div>
              <span className="text-green-400 text-xs font-semibold">STRONG</span>
            </div>

            {/* Frequency Display */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/60">Frequency: 144.39 MHz</span>
              <div className="flex items-center space-x-2">
                <span className="text-white/60">
                  Msg {currentMessageIndex + 1}/{radioMessages.length}
                </span>
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Inline Popup Card - Below Radio */}
      <motion.div
        className="fixed bottom-8 right-8 z-10"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <AnimatePresence mode="wait">
          {showPopup && popupType && (
            <motion.div
              key={popupType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-black/60 backdrop-blur-md border border-white/20 rounded-lg p-6 w-96 max-w-[calc(100vw-4rem)]"
              style={{ 
                transform: 'translateX(calc(-100% + 384px))', // Expand horizontally to the left
                right: 0
              }}
            >
              {(() => {
                const encounter = survivalEncounters.find(e => e.type === popupType)
                if (!encounter) return null

                return (
                  <>
                    <h3 className="text-white text-lg font-bold mb-3 flex items-center">
                      <span className="mr-2">{encounter.title.split(' ')[0]}</span>
                      <span className="text-sm font-normal text-white/70">
                        {encounter.title.substring(encounter.title.indexOf(' ') + 1)}
                      </span>
                    </h3>
                    <p className="text-white/80 text-sm mb-4 leading-relaxed">
                      {encounter.description}
                    </p>
                    <div className="flex gap-3">
                      {encounter.choices.map((choice, index) => (
                        <button
                          key={index}
                          onClick={() => handlePopupChoice(choice.action, choice.healthChange)}
                          className={`flex-1 px-3 py-2 border rounded-lg transition-all text-sm ${
                            choice.healthChange > 0
                              ? 'bg-green-500/20 border-green-500/30 text-white hover:bg-green-500/30'
                              : 'bg-gray-500/20 border-gray-500/30 text-white hover:bg-gray-500/30'
                          }`}
                        >
                          <div className="font-medium">{choice.text}</div>
                          {choice.healthChange > 0 && (
                            <div className="text-xs text-green-400 mt-1">
                              +{choice.healthChange} health
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-white/50 text-center">
                      Auto-change in 5 seconds
                    </div>
                  </>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Game Over Screen */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-red-900/50 backdrop-blur-md border border-red-500/50 rounded-lg p-12 max-w-lg mx-4 text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="text-6xl mb-4"
              >
                💀
              </motion.div>
              <h2 className="text-white text-3xl font-bold mb-4">GAME OVER</h2>
              <p className="text-white/80 mb-2">You didn't survive the wasteland...</p>
              <p className="text-white/60 mb-6">
                Survived {(gameTime / 60).toFixed(1)} minutes total
              </p>
              <div className="space-y-4">
                <div className="text-white/70 text-sm">
                  <div>Total Time: {gameTime.toFixed(1)}s</div>
                  <div>Final Health: 0%</div>
                  <div>Cause: Environmental exposure</div>
                </div>
                <motion.button
                  onClick={resetGame}
                  className="px-8 py-3 bg-red-500/30 border border-red-500/50 text-white font-semibold rounded-lg hover:bg-red-500/50 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  TRY AGAIN
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
