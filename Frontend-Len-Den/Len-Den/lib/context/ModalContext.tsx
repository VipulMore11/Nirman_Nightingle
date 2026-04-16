'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface Modal {
  id: string
  title: string
  content: ReactNode
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'danger'
  }>
}

interface ModalContextType {
  modals: Modal[]
  openModal: (modal: Modal) => void
  closeModal: (id: string) => void
  closeAllModals: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<Modal[]>([])

  const openModal = (modal: Modal) => {
    setModals(prev => [...prev, modal])
  }

  const closeModal = (id: string) => {
    setModals(prev => prev.filter(m => m.id !== id))
  }

  const closeAllModals = () => {
    setModals([])
  }

  return (
    <ModalContext.Provider value={{ modals, openModal, closeModal, closeAllModals }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within ModalProvider')
  }
  return context
}
