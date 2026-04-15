import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-lg overflow-hidden border border-white/10 shadow-2xl"
              style={{ position: 'relative' }}
            >
              <div className="flex items-center justify-between p-6 border-bottom border-white/5">
                <h3 className="m-0 text-xl font-bold">{title}</h3>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-secondary"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                {children}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
