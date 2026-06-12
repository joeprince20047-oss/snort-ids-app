import { SnortAlert, AlertFilter } from '../types'
import { AlertTriangle, Info, Shield } from 'lucide-react'

interface Props {
  alerts: SnortAlert[]
  loading: boolean
  onSelect: (a: SnortAlert) => void
  filter: AlertFilter
  onFilterChange: (p: Partial<AlertFilter>) => void
}

const PRIORITY_BADGE: Record<number, { icon: typeof Shield; cls: string }> = {
  1: { icon: Shield, cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  2: { icon: AlertTriangle, cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  3: { icon: Info, cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
}

export default function AlertTable({ alerts, loading, onSelect, filter, onFilterChange }: Props) {
  const handleSort = (field: typeof filter.sortField) => {
    if (filter.sortField === field) {
      onFilterChange({ sortDir: filter.sortDir === 'asc' ? 'desc' : 'asc' })
    } else {
      onFilterChange({ sortField: field, sortDir: 'desc' })
    }
  }

  const SortIcon = ({ field }: { field: typeof filter.sortField }) => {
    if (filter.sortField !== field) return <span className="text-gray-300 dark:text-gray-600 ml-1">↕</span>
    return <span className="ml-1">{filter.sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-cyber-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading alerts...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-cyber-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-cyber-900">
              <th
                className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none whitespace-nowrap"
                onClick={() => handleSort('timestamp')}
              >
                Time <SortIcon field="timestamp" />
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none whitespace-nowrap"
                onClick={() => handleSort('protocol')}
              >
                Proto <SortIcon field="protocol" />
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none whitespace-nowrap"
                onClick={() => handleSort('msg')}
              >
                Message <SortIcon field="msg" />
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none whitespace-nowrap"
                onClick={() => handleSort('srcIp')}
              >
                Source <SortIcon field="srcIp" />
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none whitespace-nowrap"
                onClick={() => handleSort('dstIp')}
              >
                Dest <SortIcon field="dstIp" />
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none whitespace-nowrap"
                onClick={() => handleSort('priority')}
              >
                Priority <SortIcon field="priority" />
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                SID
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">
                  No alerts match your filters
                </td>
              </tr>
            ) : (
              alerts.map(alert => {
                const Badge = PRIORITY_BADGE[alert.priority]
                const Icon = Badge.icon
                return (
                  <tr
                    key={alert.id}
                    onClick={() => onSelect(alert)}
                    className="hover:bg-gray-50 dark:hover:bg-cyber-700 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap font-mono">
                      {alert.timestamp.slice(5, 19)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${
                        alert.protocol === 'TCP' ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' :
                        alert.protocol === 'UDP' ? 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20' :
                        'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20'
                      }`}>
                        {alert.protocol}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200 max-w-xs truncate">
                      {alert.msg}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {alert.srcIp}:{alert.srcPort}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {alert.dstIp}:{alert.dstPort}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${Badge.cls}`}>
                        <Icon className="w-3 h-3" />
                        P{alert.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {alert.sid}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400">
        Showing {alerts.length} alerts
      </div>
    </div>
  )
}
