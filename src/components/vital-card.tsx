'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VitalCardProps {
  title: string
  value: string
  percentage: number
  icon: LucideIcon
  status: 'stable' | 'growing' | 'low' | 'optimal' | 'excellent' | 'safe'
  color: string
}

export function VitalCard({ title, value, percentage, icon: Icon, status, color }: VitalCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'safe':
      case 'growing':
        return '#00ff00'
      case 'optimal':
      case 'stable':
        return '#00ffff'
      case 'low':
        return '#ff6600'
      default:
        return '#00ffff'
    }
  }

  const statusColor = getStatusColor(status)

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="cyber-card p-4 relative overflow-hidden group"
    >
      {/* Background glow effect */}
      <div 
        className="absolute inset-0 opacity-10 blur-xl"
        style={{ backgroundColor: color }}
      />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Icon 
              className="h-5 w-5" 
              style={{ color: color }}
            />
            <h3 className="text-sm font-semibold text-[#00ffff]/90 uppercase tracking-wide">
              {title}
            </h3>
          </div>
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: statusColor }}
          />
        </div>

        {/* Value */}
        <div className="mb-3">
          <div 
            className="text-2xl font-bold neon-text"
            style={{ color: color }}
          >
            {value}
          </div>
          <div className="text-xs text-[#00ffff]/60 uppercase tracking-wide">
            {status}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#00ffff]/70">Level</span>
            <span className="text-xs text-[#00ffff]/70">{percentage}%</span>
          </div>
          <div className="w-full bg-[#1a1a1a] rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="h-full rounded-full relative"
              style={{ backgroundColor: color }}
            >
              <div 
                className="absolute inset-0 bg-white/20 animate-pulse"
                style={{ 
                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
                  animation: 'shimmer 2s infinite'
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-2 right-2 w-1 h-1 bg-[#00ffff] rounded-full opacity-50" />
        <div className="absolute bottom-2 left-2 w-1 h-1 bg-[#00ffff] rounded-full opacity-30" />
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </motion.div>
  )
}
