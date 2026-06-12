import express from 'express'
import cors from 'cors'
import { createAlertRoutes } from './routes/alerts'
import { SnortParser } from './services/snortParser'

const app = express()
const PORT = process.env.PORT || 3001
const SNORT_LOG = process.env.SNORT_LOG || '/var/log/snort/alert'

app.use(cors())
app.use(express.json())

const parser = new SnortParser()

// Try to watch SNORT log file (non-fatal if doesn't exist)
try {
  parser.watchLogFile(SNORT_LOG)
  console.log(`Watching SNORT log: ${SNORT_LOG}`)
} catch (err) {
  console.warn(`Could not watch ${SNORT_LOG}, starting with empty alert store`)
}

app.use('/api', createAlertRoutes(parser))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', alertsCount: parser.getAlerts().length })
})

app.listen(PORT, () => {
  console.log(`SNORT IDS Backend running on http://localhost:${PORT}`)
})
