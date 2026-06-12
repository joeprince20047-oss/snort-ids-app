export interface SnortAlert {
  id: string
  timestamp: string
  sid: number
  rev: number
  msg: string
  classification: string
  priority: 1 | 2 | 3
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'IP'
  srcIp: string
  srcPort: number
  dstIp: string
  dstPort: number
  payload?: string
  raw?: string
}

export interface AlertStats {
  total: number
  critical: number
  warning: number
  info: number
  uniqueSids: number
  topAttackers: { ip: string; count: number }[]
  topRules: { sid: number; msg: string; count: number }[]
  protocolBreakdown: { protocol: string; count: number }[]
  timeline: { date: string; count: number }[]
  lastHour: number
}
