import React, { createContext, useContext, useState } from 'react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 4000)
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-2xl glass-card border border-white/10 min-w-[300px] ${
              toast.type === 'error' ? 'border-red-500/30' : 'border-green-500/30'
            }`}
          >
            <div className={toast.type === 'error' ? 'text-red-400' : 'text-green-400'}>
              {toast.type === 'error' ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
            </div>
            
            <div className="flex-1">
              <p className="text-sm font-medium m-0">{toast.message}</p>
            </div>

            <button 
              onClick={() => removeToast(toast.id)}
              className="text-secondary hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
