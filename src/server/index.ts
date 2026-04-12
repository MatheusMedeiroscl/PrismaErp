import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { query } from './db'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// ── Auth ─────────────────────────────────────────────────────────────────────

app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body
  const rows = await query('SELECT * FROM users WHERE email = $1', [email])
  if (rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' })
  if (rows[0].password !== password) return res.status(401).json({ error: 'Senha inválida' })
  const { password: _, ...user } = rows[0]
  res.json({ user })
})

app.post('/api/users', async (req, res) => {
  const { name, email, password } = req.body
  const rows = await query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
    [name, email, password]
  )
  res.json(rows[0])
})

// ── Sales ─────────────────────────────────────────────────────────────────────

app.get('/api/sales', async (_req, res) => {
  const sales = await query('SELECT * FROM sales ORDER BY date DESC')

  // Busca os itens de todas as vendas de uma vez
  const allItems = await query('SELECT * FROM sale_items')
  const itemsBySaleId: Record<string, any[]> = {}
  allItems.forEach(item => {
    if (!itemsBySaleId[item.sale_id]) itemsBySaleId[item.sale_id] = []
    itemsBySaleId[item.sale_id].push(item)
  })

  const salesWithItems = sales.map(s => ({ ...s, items: itemsBySaleId[s.id] ?? [] }))

  const total = sales.reduce((acc, s) => acc + Number(s.total), 0)
  const received = sales.filter(s => s.status === 'Recebido').reduce((acc, s) => acc + Number(s.total), 0)
  const pending = sales.filter(s => s.status === 'A Receber' || s.status === 'Pendente').length
  const cancelled = sales.filter(s => s.status === 'Cancelado').reduce((acc, s) => acc + Number(s.total), 0)

  res.json({ sales: salesWithItems, summary: { total, received, pending, cancelled } })
})

app.post('/api/sales', async (req, res) => {
  const { status, client, total, payment, seller, date, items } = req.body

  const saleRows = await query(
    `INSERT INTO sales (status, client, total, payment, seller, date)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [status, client, total, payment, seller, date]
  )
  const sale = saleRows[0]

  if (items && items.length > 0) {
    for (const item of items) {
      await query(
        `INSERT INTO sale_items (sale_id, product, quantity, unit_price) VALUES ($1, $2, $3, $4)`,
        [sale.id, item.product, item.quantity, item.unitPrice]
      )
    }
  }

  const saleItems = await query('SELECT * FROM sale_items WHERE sale_id = $1', [sale.id])
  res.json({ ...sale, items: saleItems })
})

app.patch('/api/sales/:id', async (req, res) => {
  const { id } = req.params
  const fields = req.body
  const keys = Object.keys(fields)
  if (keys.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' })

  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ')
  const values = keys.map(k => fields[k])
  const rows = await query(
    `UPDATE sales SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
    [...values, id]
  )
  if (rows.length === 0) return res.status(404).json({ error: 'Venda não encontrada' })
  res.json(rows[0])
})

// ── Products (Estoque) ────────────────────────────────────────────────────────

app.get('/api/products', async (_req, res) => {
  const products = await query('SELECT * FROM products ORDER BY name')

  const totalStock = products.reduce((acc, p) => acc + Number(p.stock), 0)
  const totalValue = products.reduce((acc, p) => acc + Number(p.stock) * Number(p.price), 0)
  const lowStock = products.filter(p => p.status === 'Em Pedido')

  const sales = await query(`
    SELECT date, status, total FROM sales
    WHERE date >= date_trunc('month', CURRENT_DATE)
  `)

  const movByWeek: Record<string, { entries: number; exits: number }> = {
    S1: { entries: 0, exits: 0 },
    S2: { entries: 0, exits: 0 },
    S3: { entries: 0, exits: 0 },
    S4: { entries: 0, exits: 0 },
  }
  sales.forEach(s => {
    const day = new Date(s.date).getDate()
    const week = `S${Math.min(Math.ceil(day / 7), 4)}`
    if (s.status === 'Recebido') movByWeek[week].entries += Number(s.total)
    else movByWeek[week].exits += Number(s.total)
  })
  const monthlyMovement = Object.entries(movByWeek).map(([month, v]) => ({ month, ...v }))

  res.json({
    products,
    summary: { totalStock, totalValue, lowStockCount: lowStock.length, totalProducts: products.length },
    lowStock,
    monthlyMovement,
  })
})

app.post('/api/products', async (req, res) => {
  const { name, category, stock, price, status } = req.body
  const rows = await query(
    `INSERT INTO products (name, category, stock, price, status)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, category ?? null, stock, price, status ?? 'Em Estoque']
  )
  res.json(rows[0])
})

app.patch('/api/products/:id', async (req, res) => {
  const { id } = req.params
  const fields = req.body
  const keys = Object.keys(fields)
  if (keys.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' })

  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ')
  const values = keys.map(k => fields[k])
  const rows = await query(
    `UPDATE products SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
    [...values, id]
  )
  if (rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' })
  res.json(rows[0])
})

// ── Catalog ───────────────────────────────────────────────────────────────────

app.get('/api/catalog', async (_req, res) => {
  const catalogItems = await query('SELECT * FROM catalog_items ORDER BY name')
  res.json({ catalogItems })
})

app.post('/api/catalog', async (req, res) => {
  const { name, category } = req.body
  const rows = await query(
    'INSERT INTO catalog_items (name, category) VALUES ($1, $2) RETURNING *',
    [name, category ?? null]
  )
  res.json(rows[0])
})

app.delete('/api/catalog/:id', async (req, res) => {
  await query('DELETE FROM catalog_items WHERE id = $1', [req.params.id])
  res.json({})
})

// ── Clients ───────────────────────────────────────────────────────────────────

app.get('/api/clients', async (_req, res) => {
  const clients = await query('SELECT * FROM clients ORDER BY establishment')
  res.json({ clients })
})

app.post('/api/clients', async (req, res) => {
  const { establishment, responsible } = req.body
  const rows = await query(
    'INSERT INTO clients (establishment, responsible) VALUES ($1, $2) RETURNING *',
    [establishment, responsible ?? null]
  )
  res.json(rows[0])
})

app.patch('/api/clients/:id', async (req, res) => {
  const { id } = req.params
  const fields = req.body
  const keys = Object.keys(fields)
  if (keys.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' })
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ')
  const rows = await query(
    `UPDATE clients SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
    [...keys.map(k => fields[k]), id]
  )
  if (rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' })
  res.json(rows[0])
})

app.delete('/api/clients/:id', async (req, res) => {
  await query('DELETE FROM clients WHERE id = $1', [req.params.id])
  res.json({})
})

// ── Dashboard ─────────────────────────────────────────────────────────────────

app.get('/api/dashboard', async (_req, res) => {
  const sales = await query('SELECT * FROM sales ORDER BY date DESC')
  const products = await query('SELECT * FROM products ORDER BY name')

  const totalRevenue = sales
    .filter(s => s.status === 'Recebido')
    .reduce((acc, s) => acc + Number(s.total), 0)

  const monthlySales = sales.reduce((acc, s) => acc + Number(s.total), 0)
  const activeClients = new Set(sales.map(s => s.client)).size
  const totalStock = products.reduce((acc, p) => acc + Number(p.stock), 0)

  const salesByMonth: Record<string, number> = {}
  sales.forEach(s => {
    if (!s.date) return
    const month = new Date(s.date).toLocaleString('pt-BR', { month: 'short' })
    salesByMonth[month] = (salesByMonth[month] || 0) + Number(s.total)
  })
  const salesPerformance = Object.entries(salesByMonth).map(([month, value]) => ({ month, value }))

  const stockByCategory: Record<string, { stock: number; demand: number }> = {}
  products.forEach(p => {
    if (!stockByCategory[p.category]) stockByCategory[p.category] = { stock: 0, demand: 0 }
    stockByCategory[p.category].stock += Number(p.stock)
  })
  const stockVsDemand = Object.entries(stockByCategory).map(([category, v]) => ({ category, ...v }))

  res.json({
    totalRevenue,
    monthlySales,
    activeClients,
    totalStock,
    salesPerformance,
    stockVsDemand,
    recentSales: sales.slice(0, 4),
    topProducts: products.slice(0, 4),
  })
})

// ── Start ─────────────────────────────────────────────────────────────────────

// Em produção, serve o build do React
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`))