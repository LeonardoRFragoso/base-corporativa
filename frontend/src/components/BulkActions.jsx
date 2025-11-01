import { useState } from 'react'
import { Check, X, Trash2, Archive, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BulkActions({ selectedItems, onAction, actions }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  if (selectedItems.length === 0) return null

  const handleAction = async (actionType) => {
    if (isProcessing) return

    const confirmMessage = `Tem certeza que deseja ${actionType} ${selectedItems.length} item(ns)?`
    if (!window.confirm(confirmMessage)) return

    setIsProcessing(true)
    try {
      await onAction(actionType, selectedItems)
      toast.success(`${selectedItems.length} item(ns) processado(s) com sucesso!`)
      setIsOpen(false)
    } catch (error) {
      toast.error('Erro ao processar ação em massa')
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const defaultActions = [
    { type: 'delete', label: 'Excluir', icon: Trash2, color: 'red' },
    { type: 'archive', label: 'Arquivar', icon: Archive, color: 'gray' },
  ]

  const availableActions = actions || defaultActions

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border-2 border-primary-200 p-4 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <Check className="w-5 h-5 text-primary-700" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-neutral-100">
              {selectedItems.length} {selectedItems.length === 1 ? 'item selecionado' : 'itens selecionados'}
            </p>
            <p className="text-sm text-gray-500 dark:text-neutral-500">Escolha uma ação</p>
          </div>
        </div>

        <div className="h-10 w-px bg-gray-300" />

        <div className="flex items-center gap-2">
          {availableActions.map((action) => {
            const Icon = action.icon
            const colorClasses = {
              red: 'bg-red-100 text-red-700 hover:bg-red-200',
              blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
              green: 'bg-green-100 text-green-700 hover:bg-green-200',
              gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              amber: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
            }

            return (
              <button
                key={action.type}
                onClick={() => handleAction(action.type)}
                disabled={isProcessing}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  colorClasses[action.color] || colorClasses.gray
                }`}
                title={action.label}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{action.label}</span>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => onAction('clear', [])}
          className="ml-2 p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 dark:bg-neutral-800 rounded-lg transition-colors"
          title="Limpar seleção"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-neutral-500" />
        </button>
      </div>
    </div>
  )
}
