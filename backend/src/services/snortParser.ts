import { SnortAlert, AlertStats } from '../types'
import { spawn } from 'child_process'
import { createInterface } from 'readline'
import { EventEmitter } from 'events'

const LOG_PATTERN = /^(\d{2}\/\d{2}\/\d{4}-\d{2}:\d{2}:\d{2}\.\d+)\s+\[\*\*\]\s+\[(\d+):(\d+):(\d+)\]\s+"(.+?)"\s+\[\*\*\].*\[Classification:\s+(.+?)\]\s+\[Priority:\s+(\d+)\]\s+\{(\w+)\}\s+(\d+\.\d+\.\d+\.\d+):(\d+)\s+->\s+(\d+\.\d+\.\d+\.\d+):(\d+)/

export class SnortParser extends EventEmitter {
  private alerts: SnortAlert[] = []
  private maxAlerts = 10000
  private watching = false

  getAlerts(): SnortAlert[] {
    return this.alerts
  }

  addAlert(alert: SnortAlert) {
    this.alerts.unshift(alert)
    if (this.alerts.length > this.maxAlerts) {
      this.alerts.pop()
    }
    this.emit('alert', alert)
  }

  parseLine(line: string): SnortAlert | null {
    const match = line.match(LOG_PATTERN)
    if (!match) return null

    const [
      ,
      timestamp,
      genId,
      sid,
      rev,
      msg,
      classification,
      priority,
      protocol,
      srcIp,
      srcPort,
      dstIp,
      dstPort,
    ] = match

    return {
      id: `snort-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: this.formatTimestamp(timestamp),
      sid: parseInt(sid),
      rev: parseInt(rev),
      msg,
      classification,
      priority: parseInt(priority) as 1 | 2 | 3,
      protocol: protocol as SnortAlert['protocol'],
      srcIp,
      srcPort: parseInt(srcPort),
      dstIp,
      dstPort: parseInt(dstPort),
      raw: line,
    }
  }

  private formatTimestamp(ts: string): string {
    const [datePart, timePart] = ts.split('-')
    const [mon, day, year] = datePart.split('/')
    return `${year}-${mon}-${day}T${timePart}Z`
  }

  watchLogFile(filePath: string) {
    if (this.watching) return
    this.watching = true

    const tail = spawn('tail', ['-F', '-n', '0', filePath])
    const rl = createInterface({ input: tail.stdout })

    rl.on('line', (line: string) => {
      const alert = this.parseLine(line)
      if (alert) {
        this.addAlert(alert)
      }
    })

    tail.stderr.on('data', (data: Buffer) => {
      console.error('tail error:', data.toString())
    })

    tail.on('exit', (code) => {
      console.log(`tail exited with code ${code}`)
      this.watching = false
    })
  }

  computeStats(): AlertStats {
    const alerts = this.alerts
    const critical = alerts.filter(a => a.priority === 1).length
    const warning = alerts.filter(a => a.priority === 2).length
    const info = alerts.filter(a => a.priority === 3).length

    const attackerMap = new Map<string, number>()
    alerts.forEach(a => attackerMap.set(a.srcIp, (attackerMap.get(a.srcIp) || 0) + 1))
    const topAttackers = [...attackerMap.entries()]
      .sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([ip, count]) => ({ ip, count }))

    const ruleMap = new Map<number, { msg: string; count: number }>()
    alerts.forEach(a => {
      const e = ruleMap.get(a.sid)
      if (e) e.count++
      else ruleMap.set(a.sid, { msg: a.msg, count: 1 })
    })
    const topRules = [...ruleMap.entries()]
      .sort((a, b) => b[1].count - a[1].count).slice(0, 10)
      .map(([sid, v]) => ({ sid, ...v }))

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
      return Date.now() - new Date(a.timestamp).getTime() < 3600000
    }).length

    return {
      total: alerts.length,
      critical, warning, info,
      uniqueSids: new Set(alerts.map(a => a.sid)).size,
      topAttackers, topRules, protocolBreakdown, timeline, lastHour,
    }
  }
}
