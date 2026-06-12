import { Router, Request, Response } from 'express'
import { SnortParser } from '../services/snortParser'

export function createAlertRoutes(parser: SnortParser): Router {
  const router = Router()

  router.get('/alerts', (req: Request, res: Response) => {
    let alerts = parser.getAlerts()
    const { search, protocol, priority, sortField, sortDir } = req.query

    if (search) {
      const q = (search as string).toLowerCase()
      alerts = alerts.filter(a =>
        a.msg.toLowerCase().includes(q) ||
        a.srcIp.includes(q) ||
        a.dstIp.includes(q) ||
        a.classification.toLowerCase().includes(q)
      )
    }
    if (protocol) {
      alerts = alerts.filter(a => a.protocol === protocol)
    }
    if (priority) {
      alerts = alerts.filter(a => a.priority === Number(priority))
    }

    const validSorts = ['timestamp', 'protocol', 'srcIp', 'dstIp', 'msg', 'priority']
    const field = (validSorts.includes(sortField as string) ? sortField : 'timestamp') as string
    const dir = sortDir === 'asc' ? 1 : -1

    alerts.sort((a, b) => {
      const aVal = (a as any)[field]
      const bVal = (b as any)[field]
      if (typeof aVal === 'string') return aVal.localeCompare(bVal) * dir
      return (aVal - bVal) * dir
    })

    res.json(alerts)
  })

  router.get('/alerts/stats', (_req: Request, res: Response) => {
    res.json(parser.computeStats())
  })

  router.get('/alerts/:id', (req: Request, res: Response) => {
    const alert = parser.getAlerts().find(a => a.id === req.params.id)
    if (!alert) {
      res.status(404).json({ error: 'Alert not found' })
      return
    }
    res.json(alert)
  })

  return router
}
