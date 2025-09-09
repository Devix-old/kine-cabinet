'use client'

import React from 'react'
import { motion } from 'framer-motion'

const EniripsaLogo = ({ className = "w-12 h-12", showText = true }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Animated Logo Icon */}
      <motion.div
        className="relative"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Main Circle */}
        <motion.div
          className="w-12 h-12 bg-gradient-to-br from-[#4CB5B5] to-[#3DA4A4] rounded-full flex items-center justify-center relative overflow-hidden"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(76, 181, 181, 0.4)",
              "0 0 0 8px rgba(76, 181, 181, 0)",
              "0 0 0 0 rgba(76, 181, 181, 0.4)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {/* Inner Pulse Circle */}
          <motion.div
            className="absolute inset-2 bg-gradient-to-br from-[#7BC6B5] to-[#4CB5B5] rounded-full"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Medical Cross */}
          <motion.div
            className="relative z-10"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <div className="flex items-center justify-center">
              <motion.div
                className="w-1 h-4 bg-white rounded-full"
                animate={{ scaleY: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="w-4 h-1 bg-white rounded-full absolute"
                animate={{ scaleX: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              />
            </div>
          </motion.div>
          
          {/* Floating Particles */}
          <motion.div
            className="absolute -top-1 -right-1 w-2 h-2 bg-[#DCEEF5] rounded-full"
            animate={{
              y: [0, -8, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-[#7BC6B5] rounded-full"
            animate={{
              y: [0, 6, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </motion.div>
        
        {/* Outer Ring */}
        <motion.div
          className="absolute inset-0 border-2 border-[#4CB5B5]/30 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* Logo Text */}
      {showText && (
        <motion.div
          className="flex flex-col"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <motion.span
            className="text-2xl font-bold bg-gradient-to-r from-[#2F4A5C] to-[#4CB5B5] bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ backgroundSize: "200% 200%" }}
          >
            Eniripsa
          </motion.span>
          <motion.span
            className="text-xs text-[#3A5166] font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            Kinésithérapie
          </motion.span>
        </motion.div>
      )}
    </div>
  )
}

export default EniripsaLogo

