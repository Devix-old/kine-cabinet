import React from 'react'

const VARIANT_CLASSES = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  outline: 'border border-gray-300 text-gray-800 hover:bg-gray-50',
  ghost: 'text-blue-600 hover:bg-blue-50',
}

const SIZE_CLASSES = {
  sm: 'px-3 py-2 text-sm rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-5 py-3 text-base rounded-lg',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  as = 'button',
  children,
  ...props
}) {
  const Component = as
  const variantClasses = VARIANT_CLASSES[variant] || ''
  const sizeClasses = SIZE_CLASSES[size] || ''

  return (
    <Component
      className={`${variantClasses} ${sizeClasses} inline-flex items-center justify-center font-semibold transition-colors ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}
