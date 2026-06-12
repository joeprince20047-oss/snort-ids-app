import { SnortAlert } from '../types'
import { X, Shield, AlertTriangle, Info, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface Props {
  alert: SnortAlert
  onClose: () => void
}

const PRIORITY_CONFIG = {
  1: { label: 'Critical', cls: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400', icon: Shield },
  2: { label: 'Warning', cls: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400', icon: AlertTriangle },
  3: { label: 'Info', cls: 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400', icon: Info },
}

export default function AlertDetail({ alert, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const cfg = PRIORITY_CONFIG[alert.priority]
  const Icon = cfg.icon

  const copyPayload = () => {
    navigator.clipboard.writeText(alert.payload || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-cyber-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${cfg.cls}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Alert Detail
              </h2>
              <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
                {cfg.label} · Priority {alert.priority}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-cyber-700 text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Message</h3>
            <p className="text-base font-medium text-gray-900 dark:text-white">{alert.msg}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Classification</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{alert.classification}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Rule SID</h3>
              <p className="text-sm font-mono text-gray-700 dark:text-gray-300">{alert.sid} (rev {alert.rev})</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3 border border-red-100 dark:border-red-900/30">
              <h3 className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">Source</h3>
              <p className="text-sm font-mono text-red-700 dark:text-red-400">{alert.srcIp}:{alert.srcPort}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3 border border-blue-100 dark:border-blue-900/30">
              <h3 className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">Destination</h3>
              <p className="text-sm font-mono text-blue-700 dark:text-blue-400">{alert.dstIp}:{alert.dstPort}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Timestamp</h3>
            <p className="text-sm font-mono text-gray-600 dark:text-gray-400">{alert.timestamp}</p>
          </div>

          {alert.payload && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payload (Hex)</h3>
                <button
                  onClick={copyPayload}
                  className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-gray-50 dark:bg-cyber-900 rounded-lg p-3 text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto leading-relaxed border border-gray-200 dark:border-gray-700">
                {alert.payload}
              </pre>
            </div>
          )}

          {alert.raw && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Raw Log</h3>
              <pre className="bg-gray-50 dark:bg-cyber-900 rounded-lg p-3 text-xs font-mono text-gray-600 dark:text-gray-400 overflow-x-auto break-all border border-gray-200 dark:border-gray-700">
                {alert.raw}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
