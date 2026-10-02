import React from 'react'
import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ text, fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      {text && <p className="text-gray-600 dark:text-gray-400 font-medium">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-950/50 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return content
}
