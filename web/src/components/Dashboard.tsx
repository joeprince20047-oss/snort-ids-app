import { useState, useEffect, useMemo } from 'react'
import { fetchAlerts, fetchStats, setUseMock, getUseMock } from '../api/alerts'
import { SnortAlert, AlertStats, AlertFilter } from '../types'
import Layout from './Layout'
import StatsCards from './StatsCards'
import ChartSection from './ChartSection'
import AlertTable from './AlertTable'
import AlertDetail from './AlertDetail'

export default function Dashboard() {
  const [alerts, setAlerts] = useState<SnortAlert[]>([])
  const [stats, setStats] = useState<AlertStats | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<SnortAlert | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<AlertFilter>({
    search: '',
    protocol: '',
    priority: '',
    sortField: 'timestamp',
    sortDir: 'desc',
  })
  const [darkMode, setDarkMode] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  const [useLive, setUseLive] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  const loadData = async () => {
    try {
      setLoading(true)
      if (!getUseMock() && useLive) {
        setUseMock(false)
      } else if (!useLive) {
        setUseMock(true)
      }
      const [alertsData, statsData] = await Promise.all([
        fetchAlerts(filter),
        fetchStats(),
      ])
      setAlerts(alertsData)
      setStats(statsData)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [filter, useLive])

  useEffect(() => {
    const interval = setInterval(loadData, 15000)
    return () => clearInterval(interval)
  }, [filter, useLive])

  const handleFilterChange = (partial: Partial<AlertFilter>) => {
    setFilter(prev => ({ ...prev, ...partial }))
  }

  const filteredAlerts = useMemo(() => {
    let filtered = [...alerts]
    if (filter.search) {
      const q = filter.search.toLowerCase()
      filtered = filtered.filter(a =>
        a.msg.toLowerCase().includes(q) ||
        a.srcIp.includes(q) ||
        a.dstIp.includes(q) ||
        a.classification.toLowerCase().includes(q)
      )
    }
    if (filter.protocol) filtered = filtered.filter(a => a.protocol === filter.protocol)
    if (filter.priority) filtered = filtered.filter(a => a.priority === Number(filter.priority))
    return filtered
  }, [alerts, filter])

  return (
    <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              SNORT IDS Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Real-time Intrusion Detection Monitoring
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={useLive}
                onChange={e => setUseLive(e.target.checked)}
                className="rounded border-gray-300 text-blue-600"
              />
              Live API mode
            </label>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && <StatsCards stats={stats} />}

        {/* Charts */}
        {stats && <ChartSection stats={stats} />}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search IP, message, classification..."
            value={filter.search}
            onChange={e => handleFilterChange({ search: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-cyber-800 text-sm flex-1 min-w-[200px] max-w-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={filter.protocol}
            onChange={e => handleFilterChange({ protocol: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-cyber-800 text-sm"
          >
            <option value="">All Protocols</option>
            <option value="TCP">TCP</option>
            <option value="UDP">UDP</option>
            <option value="ICMP">ICMP</option>
          </select>
          <select
            value={filter.priority}
            onChange={e => handleFilterChange({ priority: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-cyber-800 text-sm"
          >
            <option value="">All Priorities</option>
            <option value="1">Critical</option>
            <option value="2">Warning</option>
            <option value="3">Info</option>
          </select>
        </div>

        {/* Alert table */}
        <AlertTable
          alerts={filteredAlerts}
          loading={loading}
          onSelect={setSelectedAlert}
          filter={filter}
          onFilterChange={handleFilterChange}
        />

        {/* Detail modal */}
        {selectedAlert && (
          <AlertDetail alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
        )}
      </div>
    </Layout>
  )
}
