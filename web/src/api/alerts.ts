import { SnortAlert, AlertStats, AlertFilter } from '../types'
import { DEMO_ALERTS, computeStats } from '../utils/mockData'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

let useMock = true
let mockAlerts = [...DEMO_ALERTS]

export function setUseMock(val: boolean) {
  useMock = val
}

export function getUseMock() {
  return useMock
}

export async function fetchAlerts(filter?: AlertFilter): Promise<SnortAlert[]> {
  if (useMock) {
    let filtered = [...mockAlerts]
    if (filter) {
      if (filter.search) {
        const q = filter.search.toLowerCase()
        filtered = filtered.filter(a =>
          a.msg.toLowerCase().includes(q) ||
          a.srcIp.includes(q) ||
          a.dstIp.includes(q) ||
          a.classification.toLowerCase().includes(q)
        )
      }
      if (filter.protocol) {
        filtered = filtered.filter(a => a.protocol === filter.protocol)
      }
      if (filter.priority) {
        filtered = filtered.filter(a => a.priority === Number(filter.priority))
      }
      filtered.sort((a, b) => {
        const dir = filter.sortDir === 'asc' ? 1 : -1
        const aVal = a[filter.sortField]
        const bVal = b[filter.sortField]
        if (typeof aVal === 'string') return aVal.localeCompare(bVal as string) * dir
        return ((aVal as number) - (bVal as number)) * dir
      })
    }
    return filtered
  }

  const params = new URLSearchParams()
  if (filter?.search) params.set('search', filter.search)
  if (filter?.protocol) params.set('protocol', filter.protocol)
  if (filter?.priority) params.set('priority', filter.priority)
  if (filter?.sortField) params.set('sortField', filter.sortField)
  if (filter?.sortDir) params.set('sortDir', filter.sortDir)

  const res = await fetch(`${API_BASE}/alerts?${params}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function fetchAlertById(id: string): Promise<SnortAlert | null> {
  if (useMock) {
    return mockAlerts.find(a => a.id === id) || null
  }
  const res = await fetch(`${API_BASE}/alerts/${id}`)
  if (!res.ok) return null
  return res.json()
}

export async function fetchStats(): Promise<AlertStats> {
  if (useMock) {
    return computeStats(mockAlerts)
  }
  const res = await fetch(`${API_BASE}/alerts/stats`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
