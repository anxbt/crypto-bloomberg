require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 4000

app.use(cors({ origin: true }))
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    sosovalue: Boolean(process.env.SOSOVALUE_API_KEY),
    openrouter: Boolean(process.env.OPENROUTER_API_KEY),
  })
})

app.use('/api', require('./routes/api'))

app.listen(port, () => {
  const sosoKey = process.env.SOSOVALUE_API_KEY ? 'live' : 'mock fallback'
  const orKey = process.env.OPENROUTER_API_KEY ? 'live' : 'mock fallback'
  console.log(`Backend listening on http://localhost:${port}`)
  console.log(`  SoSoValue: ${sosoKey} | OpenRouter: ${orKey}`)
})
