import { AlertStats } from '../types'
import { Shield, AlertTriangle, Info, Activity, Clock } from 'lucide-react'

interface Props {
  stats: AlertStats
}

export default function StatsCards({ stats }: Props) {
  const cards = [
    {
      label: 'Total Alerts',
      value: stats.total,
      icon: Activity,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Critical',
      value: stats.critical,
      icon: Shield,
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'Warning',
      value: stats.warning,
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      label: 'Info',
      value: stats.info,
      icon: Info,
      color: 'text-gray-500',
      bg: 'bg-gray-50 dark:bg-gray-800',
    },
    {
      label: 'Unique Rules',
      value: stats.uniqueSids,
      icon: Activity,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Last Hour',
      value: stats.lastHour,
      icon: Clock,
      color: 'text-cyan-500',
      bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map(card => (
        <div
          key={card.label}
          className={`${card.bg} rounded-xl p-4 border border-gray-200 dark:border-gray-700`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {card.label}
            </span>
            <card.icon className={`w-4 h-4 ${card.color}`} />
          </div>
          <span className={`text-2xl font-bold ${card.color}`}>
            {card.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}
