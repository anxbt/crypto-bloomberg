const express = require('express')
const router = express.Router()

// Simple in-memory mock data for Wave 1 demo
router.get('/search', (req, res) => {
  const q = (req.query.query || '').toLowerCase()
  if (!q) return res.json({ type: 'currency', id: 'btc' })
  if (['cpi', 'fomc', 'nfp'].includes(q)) return res.json({ type: 'macro', id: q })
  if (['mstr', 'coin', 'mara'].includes(q)) return res.json({ type: 'stock', id: q.toUpperCase() })
  if (['mag7', 'layer1'].includes(q)) return res.json({ type: 'index', id: q.toUpperCase() })
  return res.json({ type: 'currency', id: q })
})

router.get('/news', (req, res) => {
  const currency = req.query.currency_id || 'btc'
  res.json({
    items: [
      { id: 1, title: `News about ${currency.toUpperCase()}`, source: 'SoSoValue' },
      { id: 2, title: `Another update on ${currency.toUpperCase()}`, source: 'CoinDesk' },
    ],
  })
})

router.get('/currency/:id', (req, res) => {
  const { id } = req.params
  res.json({
    id,
    snapshot: { price: 60000, change_24h: 2.3 },
    klines: [],
  })
})

module.exports = router
