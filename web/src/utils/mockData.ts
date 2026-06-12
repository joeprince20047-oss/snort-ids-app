import { SnortAlert, AlertStats } from '../types'

const SAMPLE_PAYLOADS = [
  '50 4B 03 04 0A 00 00 00 00 00 72 68 4B 58 00 00 00 00 00 00 00 00 00 00 00 00 0A 00 1C 00 6D 65 74 61 2E 69 6E 66 20 55 54 0D 00 07',
  '48 54 54 50 2F 31 2E 31 20 32 30 30 20 4F 4B 0D 0A 43 6F 6E 74 65 6E 74 2D 54 79 70 65 3A 20 74 65 78 74 2F 68 74 6D 6C',
  '47 45 54 20 2F 69 6E 64 65 78 2E 70 68 70 3F 69 64 3D 31 27 20 55 4E 49 4F 4E 20 53 45 4C 45 43 54 20 31 2C 32 2C 33 2D 2D 20 48 54 54 50 2F 31 2E 31',
]

const SRC_IPS = [
  '10.0.0.15', '10.0.0.23', '10.0.0.47', '10.0.0.88',
  '192.168.1.100', '192.168.1.105', '192.168.1.110',
  '172.16.0.50', '172.16.0.55', '172.16.0.60',
  '45.33.32.156', '103.235.46.19', '185.220.101.42',
  '91.121.87.34', '51.75.144.203',
]

const DST_IPS = [
  '192.168.1.1', '192.168.1.2', '10.0.0.1',
  '172.16.0.1', '192.168.1.10', '10.0.0.100',
]

const RULES: { sid: number; msg: string; classification: string; priority: 1 | 2 | 3 }[] = [
  { sid: 1000001, msg: 'NMAP - SYN Scan Detected', classification: 'Attempted Information Leak', priority: 2 },
  { sid: 1000002, msg: 'SSH Brute-Force Attempt', classification: 'Attempted Administrator Privilege Gain', priority: 1 },
  { sid: 1000003, msg: 'SQL Injection - UNION Select', classification: 'Web Application Attack', priority: 1 },
  { sid: 1000004, msg: 'ICMP Flood Detected', classification: 'DoS Attempt', priority: 1 },
  { sid: 1000005, msg: 'HTTP Directory Bruteforce', classification: 'Reconnaissance', priority: 2 },
  { sid: 1000006, msg: 'Suspicious User-Agent - sqlmap', classification: 'Web Application Attack', priority: 2 },
  { sid: 1000007, msg: 'Port Scan - Multiple Ports', classification: 'Reconnaissance', priority: 2 },
  { sid: 1000008, msg: 'Malicious File Download Attempt', classification: 'Malware', priority: 1 },
  { sid: 1000009, msg: 'DNS Tunneling Detection', classification: 'C2 Communication', priority: 1 },
  { sid: 1000010, msg: 'XSS Attack Detected', classification: 'Web Application Attack', priority: 1 },
]

const PROTOCOLS: ('TCP' | 'UDP' | 'ICMP')[] = ['TCP', 'TCP', 'TCP', 'UDP', 'ICMP', 'TCP', 'TCP', 'UDP', 'TCP', 'TCP']

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

export function generateMockAlerts(count: number): SnortAlert[] {
  const now = Date.now()
  const alerts: SnortAlert[] = []

  for (let i = 0; i < count; i++) {
    const rule = randomItem(RULES)
    const date = new Date(now - randomInt(0, 86400000 * 7))
    const proto = randomItem(PROTOCOLS) as 'TCP' | 'UDP' | 'ICMP'
    const srcIp = randomItem(SRC_IPS)
    const dstIp = randomItem(DST_IPS)

    alerts.push({
      id: `alert-${now}-${i}`,
      timestamp: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${randomInt(100, 999)}Z`,
      sid: rule.sid,
      rev: 1,
      msg: rule.msg,
      classification: rule.classification,
      priority: rule.priority,
      protocol: proto,
      srcIp,
      srcPort: proto === 'ICMP' ? 0 : randomInt(1024, 65535),
      dstIp,
      dstPort: proto === 'ICMP' ? 0 : rule.sid === 1000002 ? 22 : rule.sid === 1000003 || rule.sid === 1000005 || rule.sid === 1000006 || rule.sid === 1000010 ? 80 : randomInt(1, 65535),
      payload: randomItem(SAMPLE_PAYLOADS),
      raw: `${date.toISOString()}  [**] [1:${rule.sid}:1] "${rule.msg}" [**] [Classification: ${rule.classification}] [Priority: ${rule.priority}] {${proto}} ${srcIp}:${randomInt(1024, 65535)} -> ${dstIp}:${randomInt(1, 65535)}`,
    })
  }

  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function computeStats(alerts: SnortAlert[]): AlertStats {
  const critical = alerts.filter(a => a.priority === 1).length
  const warning = alerts.filter(a => a.priority === 2).length
  const info = alerts.filter(a => a.priority === 3).length

  const attackerMap = new Map<string, number>()
  alerts.forEach(a => attackerMap.set(a.srcIp, (attackerMap.get(a.srcIp) || 0) + 1))
  const topAttackers = [...attackerMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([ip, count]) => ({ ip, count }))

  const ruleMap = new Map<number, { msg: string; count: number }>()
  alerts.forEach(a => {
    const existing = ruleMap.get(a.sid)
    if (existing) existing.count++
    else ruleMap.set(a.sid, { msg: a.msg, count: 1 })
  })
  const topRules = [...ruleMap.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([sid, val]) => ({ sid, ...val }))

  const protoMap = new Map<string, number>()
  alerts.forEach(a => protoMap.set(a.protocol, (protoMap.get(a.protocol) || 0) + 1))
  const protocolBreakdown = [...protoMap.entries()].map(([protocol, count]) => ({ protocol, count }))

  const dayMap = new Map<string, number>()
  const sevenDaysAgo = Date.now() - 86400000 * 7
  for (let d = 0; d < 7; d++) {
    const key = new Date(sevenDaysAgo + d * 86400000).toISOString().slice(0, 10)
    dayMap.set(key, 0)
  }
  alerts.forEach(a => {
    const key = a.timestamp.slice(0, 10)
    if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) || 0) + 1)
  })
  const timeline = [...dayMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }))

  const lastHour = alerts.filter(a => {
    const diff = Date.now() - new Date(a.timestamp).getTime()
    return diff < 3600000
  }).length

  return {
    total: alerts.length,
    critical,
    warning,
    info,
    uniqueSids: new Set(alerts.map(a => a.sid)).size,
    topAttackers,
    topRules,
    protocolBreakdown,
    timeline,
    lastHour,
  }
}

export const DEMO_ALERTS = generateMockAlerts(250)
