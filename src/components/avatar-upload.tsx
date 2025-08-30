'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, User, Camera, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AvatarUploadProps {
  onAvatarUpload: () => void
  userImage?: File | null
}

export function AvatarUpload({ onAvatarUpload, userImage }: AvatarUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize with user image if provided
  useEffect(() => {
    if (userImage) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(userImage)
      onAvatarUpload()
    }
  }, [userImage, onAvatarUpload])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    setUploading(true)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Simulate API call to Gemini
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setUploading(false)
    onAvatarUpload()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const generateAvatar = async () => {
    setUploading(true)
    // Simulate avatar generation
    await new Promise(resolve => setTimeout(resolve, 3000))
    setAvatarPreview('/api/placeholder/200/200') // Placeholder for generated avatar
    setUploading(false)
    onAvatarUpload()
  }

  return (
    <div className="cyber-card p-6 h-fit">
      <h2 className="text-xl font-bold text-[#00ffff] mb-4 neon-text">
        SURVIVOR AVATAR
      </h2>
      
      {!avatarPreview ? (
        <div
          className={cn(
            "border-2 border-dashed border-[#00ffff]/50 rounded-lg p-8 text-center transition-all duration-300",
            dragActive && "border-[#00ffff] bg-[#00ffff]/10",
            "hover:border-[#00ffff] hover:bg-[#00ffff]/5"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            {uploading ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center"
              >
                <RefreshCw className="h-12 w-12 text-[#00ffff] animate-spin" />
                <p className="text-[#00ffff]/70 mt-2">
                  Generating Avatar...
                </p>
              </motion.div>
            ) : (
              <>
                <Upload className="h-12 w-12 text-[#00ffff] mx-auto" />
                <div>
                  <p className="text-[#00ffff] font-semibold">
                    Upload Your Photo
                  </p>
                  <p className="text-[#00ffff]/70 text-sm mt-1">
                    Drag & drop or click to browse
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="cyber-button w-full"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Select Image
                </button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#00ffff]/30"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#1a1a1a] text-[#00ffff]/70">or</span>
                  </div>
                </div>
                <button
                  onClick={generateAvatar}
                  className="cyber-button w-full bg-gradient-to-r from-[#ff0080]/20 to-[#ff6600]/20 border-[#ff0080]"
                >
                  <User className="h-4 w-4 mr-2" />
                  Generate AI Avatar
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="relative mx-auto w-32 h-32 rounded-lg overflow-hidden border-2 border-[#00ffff] hologram-effect">
            <img
              src={avatarPreview}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-[#00ffff] font-semibold">SURVIVOR-001</h3>
            <p className="text-[#00ffff]/70 text-sm">Status: Active</p>
          </div>
          <button
            onClick={() => {
              setAvatarPreview(null)
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
            className="cyber-button w-full text-sm"
          >
            Upload New Image
          </button>
        </motion.div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
