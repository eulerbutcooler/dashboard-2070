'use client'

import { motion } from 'framer-motion'
import { Package, Wrench, Pill, Zap, Droplets, Wheat, Shield, AlertCircle } from 'lucide-react'

interface InventoryItem {
  id: string
  name: string
  quantity: number
  maxQuantity: number
  category: 'medical' | 'food' | 'tools' | 'energy' | 'water' | 'defense'
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
  status: 'abundant' | 'low' | 'critical'
}

export function InventoryPanel() {
  const inventoryItems: InventoryItem[] = [
    {
      id: '1',
      name: 'Med Stims',
      quantity: 12,
      maxQuantity: 50,
      category: 'medical',
      rarity: 'uncommon',
      status: 'low'
    },
    {
      id: '2',
      name: 'Ration Packs',
      quantity: 45,
      maxQuantity: 100,
      category: 'food',
      rarity: 'common',
      status: 'abundant'
    },
    {
      id: '3',
      name: 'Power Cells',
      quantity: 8,
      maxQuantity: 20,
      category: 'energy',
      rarity: 'rare',
      status: 'low'
    },
    {
      id: '4',
      name: 'Water Filters',
      quantity: 3,
      maxQuantity: 15,
      category: 'water',
      rarity: 'uncommon',
      status: 'critical'
    },
    {
      id: '5',
      name: 'Repair Kits',
      quantity: 7,
      maxQuantity: 25,
      category: 'tools',
      rarity: 'common',
      status: 'low'
    },
    {
      id: '6',
      name: 'Armor Plates',
      quantity: 15,
      maxQuantity: 30,
      category: 'defense',
      rarity: 'rare',
      status: 'abundant'
    }
  ]

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medical': return Pill
      case 'food': return Wheat
      case 'tools': return Wrench
      case 'energy': return Zap
      case 'water': return Droplets
      case 'defense': return Shield
      default: return Package
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#00ffff'
      case 'uncommon': return '#00ff00'
      case 'rare': return '#ff6600'
      case 'legendary': return '#ff0080'
      default: return '#00ffff'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'abundant': return '#00ff00'
      case 'low': return '#ffff00'
      case 'critical': return '#ff0080'
      default: return '#00ffff'
    }
  }

  return (
    <div className="cyber-card p-6 h-80">
      <div className="flex items-center space-x-2 mb-4">
        <Package className="h-5 w-5 text-[#00ffff]" />
        <h2 className="text-xl font-bold text-[#00ffff] neon-text">
          INVENTORY
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-[#00ffff]/50 to-transparent" />
      </div>

      <div className="space-y-3 h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-[#00ffff]/30 scrollbar-track-transparent">
        {inventoryItems.map((item, index) => {
          const Icon = getCategoryIcon(item.category)
          const rarityColor = getRarityColor(item.rarity)
          const statusColor = getStatusColor(item.status)
          const percentage = (item.quantity / item.maxQuantity) * 100

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1a1a1a]/50 border border-[#00ffff]/20 rounded p-3 hover:border-[#00ffff]/40 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <Icon 
                    className="h-4 w-4 flex-shrink-0" 
                    style={{ color: rarityColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 
                        className="text-sm font-semibold truncate"
                        style={{ color: rarityColor }}
                      >
                        {item.name}
                      </h4>
                      {item.status === 'critical' && (
                        <AlertCircle className="h-3 w-3 text-[#ff0080] animate-pulse" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-[#00ffff]/70">
                        {item.quantity}/{item.maxQuantity}
                      </span>
                      <div 
                        className="text-xs px-1 rounded"
                        style={{ 
                          color: statusColor,
                          backgroundColor: `${statusColor}20`
                        }}
                      >
                        {item.status}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-2">
                <div className="w-full bg-[#0a0a0a] rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: statusColor }}
                  />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Quick stats */}
      <div className="mt-4 pt-4 border-t border-[#00ffff]/20">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-[#00ff00]">
              {inventoryItems.filter(i => i.status === 'abundant').length}
            </div>
            <div className="text-xs text-[#00ffff]/60">ABUNDANT</div>
          </div>
          <div>
            <div className="text-lg font-bold text-[#ffff00]">
              {inventoryItems.filter(i => i.status === 'low').length}
            </div>
            <div className="text-xs text-[#00ffff]/60">LOW</div>
          </div>
          <div>
            <div className="text-lg font-bold text-[#ff0080]">
              {inventoryItems.filter(i => i.status === 'critical').length}
            </div>
            <div className="text-xs text-[#00ffff]/60">CRITICAL</div>
          </div>
        </div>
      </div>
    </div>
  )
}
