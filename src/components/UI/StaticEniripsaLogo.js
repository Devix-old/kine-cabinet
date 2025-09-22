'use client'

import React from 'react'

const StaticEniripsaLogo = ({ className = "w-12 h-12", showText = true }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Static Logo Icon */}
      <div className="relative">
        {/* Main Circle */}
        <div className="w-12 h-12 bg-gradient-to-br from-[#4CB5B5] to-[#3DA4A4] rounded-full flex items-center justify-center relative overflow-hidden shadow-lg">
          {/* Inner Circle */}
          <div className="absolute inset-2 bg-gradient-to-br from-[#7BC6B5] to-[#4CB5B5] rounded-full" />
          
          {/* Medical Cross */}
          <div className="relative z-10">
            <div className="flex items-center justify-center">
              <div className="w-1 h-4 bg-white rounded-full" />
              <div className="w-4 h-1 bg-white rounded-full absolute" />
            </div>
          </div>
          
          {/* Floating Particles */}
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#DCEEF5] rounded-full" />
          <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-[#7BC6B5] rounded-full" />
        </div>
        
        {/* Outer Ring */}
        <div className="absolute inset-0 border-2 border-[#4CB5B5]/30 rounded-full" />
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-2xl font-bold bg-gradient-to-r from-[#2F4A5C] to-[#4CB5B5] bg-clip-text text-transparent">
            Eniripsa
          </span>
          <span className="text-xs text-[#3A5166] font-medium">
            Kinésithérapie
          </span>
        </div>
      )}
    </div>
  )
}

export default StaticEniripsaLogo
