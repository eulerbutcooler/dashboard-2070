'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Radio, AlertTriangle, Shield, Zap, Users } from 'lucide-react'

interface NewsItem {
  id: string
  title: string
  content: string
  timestamp: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  type: 'alert' | 'info' | 'warning' | 'update'
}

export function NewsPanel() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Mock news data
  const mockNews: NewsItem[] = [
    {
      id: '1',
      title: 'SECTOR 7 WATER PURIFICATION ONLINE',
      content: 'Water purification systems in Sector 7 are now operational. Expected output: 150L/day.',
      timestamp: '2070.08.30 14:23',
      priority: 'medium',
      type: 'update'
    },
    {
      id: '2',
      title: 'RADIATION STORM APPROACHING',
      content: 'High radiation levels detected 15km northeast. Seek shelter within 4 hours.',
      timestamp: '2070.08.30 13:45',
      priority: 'critical',
      type: 'alert'
    },
    {
      id: '3',
      title: 'TRADE ROUTE ESTABLISHED',
      content: 'New trade route with Settlement Alpha-7 confirmed. Resource exchange scheduled.',
      timestamp: '2070.08.30 12:10',
      priority: 'low',
      type: 'info'
    },
    {
      id: '4',
      title: 'POWER GRID MAINTENANCE',
      content: 'Scheduled maintenance on power grid. Expect 2-hour outage starting 16:00.',
      timestamp: '2070.08.30 11:30',
      priority: 'medium',
      type: 'warning'
    },
    {
      id: '5',
      title: 'NEW SURVIVORS DETECTED',
      content: 'Long-range scanners detected 3 survivors 8km south. Rescue team dispatched.',
      timestamp: '2070.08.30 10:15',
      priority: 'medium',
      type: 'info'
    }
  ]

  useEffect(() => {
    setNewsItems(mockNews)
  }, [])

  useEffect(() => {
    if (newsItems.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % newsItems.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [newsItems.length])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#ff0080'
      case 'high': return '#ff6600'
      case 'medium': return '#ffff00'
      case 'low': return '#00ffff'
      default: return '#00ffff'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert': return AlertTriangle
      case 'warning': return Zap
      case 'info': return Users
      case 'update': return Shield
      default: return Radio
    }
  }

  if (newsItems.length === 0) return null

  const currentNews = newsItems[currentIndex]
  const TypeIcon = getTypeIcon(currentNews.type)

  return (
    <div className="cyber-card p-6 h-80">
      <div className="flex items-center space-x-2 mb-4">
        <Radio className="h-5 w-5 text-[#00ffff] animate-pulse" />
        <h2 className="text-xl font-bold text-[#00ffff] neon-text">
          P2P NETWORK
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-[#00ffff]/50 to-transparent" />
      </div>

      <div className="relative h-48 overflow-hidden">
        <motion.div
          key={currentNews.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="absolute inset-0"
        >
          <div className="space-y-4">
            {/* Priority indicator */}
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: getPriorityColor(currentNews.priority) }}
              />
              <span 
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: getPriorityColor(currentNews.priority) }}
              >
                {currentNews.priority}
              </span>
              <TypeIcon 
                className="h-4 w-4"
                style={{ color: getPriorityColor(currentNews.priority) }}
              />
            </div>

            {/* Title */}
            <h3 
              className="text-lg font-bold neon-text"
              style={{ color: getPriorityColor(currentNews.priority) }}
            >
              {currentNews.title}
            </h3>

            {/* Content */}
            <p className="text-[#00ffff]/80 text-sm leading-relaxed">
              {currentNews.content}
            </p>

            {/* Timestamp */}
            <div className="text-xs text-[#00ffff]/60 font-mono">
              {currentNews.timestamp}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center space-x-2 mt-4">
        {newsItems.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-[#00ffff] shadow-[0_0_8px_rgba(0,255,255,0.6)]' 
                : 'bg-[#00ffff]/30 hover:bg-[#00ffff]/60'
            }`}
          />
        ))}
      </div>

      {/* Scanning animation */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ffff] to-transparent opacity-30">
        <motion.div
          className="h-full w-8 bg-[#00ffff]"
          animate={{ x: ['-100%', '400%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  )
}
