'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export function AnimatedCharacter() {
  return (
    <motion.div
      className="fixed bottom-8 left-8 z-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0
      }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        animate={{ 
          y: [0, -15, 0]
        }}
        transition={{ 
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        <Image
          src="/char.png"
          alt="Character"
          width={300}
          height={300}
          className="drop-shadow-lg"
        />
      </motion.div>
    </motion.div>
  )
}
