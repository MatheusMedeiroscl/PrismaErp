import { createServer, Factory, Model, Response } from 'miragejs'

function load(key: string) {
  const saved = localStorage.getItem(key)
  return saved ? JSON.parse(saved) : []
}

function save(key: string, schema: any, modelName: string) {
  const all = schema.all(modelName).models.map((m: any) => m.attrs)
  localStorage.setItem(key, JSON.stringify(all))
}

export function makeServer() {
  createServer({
    models: {
      user: Model,
      sale: Model,
      product: Model,
      catalogItem: Model,
    },

    factories: {
      user: Factory.extend({
        name: String,
        email: String,
        password: String,
      }),
      sale: Factory.extend({
        id: String,
        status: String,
        client: String,
        total: Number,
        payment: String,
        seller: String,
        date: String,
        product: String,
        quantity: Number,
      }),
      product: Factory.extend({
        name: String,
        category: String,
        stock: Number,
        price: Number,
        status: String,
      }),
      catalogItem: Factory.extend({
        name: String,
        category: String,
      }),
    },

    seeds(server) {
      load('mirage-users').forEach((u: any) => server.create('user', u))
      load('mirage-sales').forEach((s: any) => server.create('sale', s))
      load('mirage-products').forEach((p: any) => server.create('product', p))
      load('mirage-catalog').forEach((c: any) => server.create('catalogItem', c))

      // Garante ao menos um usuário padrão se o localStorage estiver vazio
      if (server.schema.all('user').length === 0) {
        server.create('user', { name: 'Admin', email: 'admin@prisma.com', password: '123456' } as any)
      }
    },

    routes() {
      this.namespace = 'api'
      this.timing = 300

      // Auth
      this.post('/users/login', (schema, request) => {
        const { email, password } = JSON.parse(request.requestBody)
        const user = schema.findBy('user', { email })
        if (!user) return new Response(404, {}, { error: 'Usuário não encontrado' })
        if (user.attrs.password !== password) return new Response(401, {}, { error: 'Senha inválida' })
        return { user: user.attrs }
      })

      this.post('/users', (schema, request) => {
        const user = schema.create('user', JSON.parse(request.requestBody))
        save('mirage-users', schema, 'user')
        return user
      })

      this.get('/users', (schema) => schema.all('user'))

      // Sales
      this.get('/sales', (schema) => {
        const sales = schema.all('sale').models.map((s: any) => s.attrs)
        const total = sales.reduce((acc: number, s: any) => acc + s.total, 0)
        const received = sales.filter((s: any) => s.status === 'Recebido').reduce((acc: number, s: any) => acc + s.total, 0)
        const pending = sales.filter((s: any) => s.status === 'A Receber' || s.status === 'Pendente').length
        const cancelled = sales.filter((s: any) => s.status === 'Cancelado').reduce((acc: number, s: any) => acc + s.total, 0)

        return {
          sales,
          summary: { total, received, pending, cancelled }
        }
      })

      this.post('/sales', (schema, request) => {
        const sale = schema.create('sale', JSON.parse(request.requestBody))
        save('mirage-sales', schema, 'sale')
        return sale
      })

      this.patch('/sales/:id', (schema, request) => {
        const sale = schema.find('sale', request.params.id)
        if (!sale) return new Response(404, {}, { error: 'Venda não encontrada' })
        sale.update(JSON.parse(request.requestBody))
        save('mirage-sales', schema, 'sale')
        return sale
      })

      // Products / Estoque
      this.get('/products', (schema) => {
        const products = schema.all('product').models.map((p: any) => p.attrs)
        const totalStock = products.reduce((acc: number, p: any) => acc + p.stock, 0)
        const totalValue = products.reduce((acc: number, p: any) => acc + (p.stock * p.price), 0)
        const lowStock = products.filter((p: any) => p.status === 'Em Pedido')

        const sales = schema.all('sale').models.map((s: any) => s.attrs)
        const movByWeek: Record<string, { entries: number; exits: number }> = {}
        sales.forEach((s: any) => {
          if (!s.date) return
          const d = new Date(s.date)
          const week = `S${Math.ceil(d.getDate() / 7)}`
          if (!movByWeek[week]) movByWeek[week] = { entries: 0, exits: 0 }
          if (s.status === 'Recebido') movByWeek[week].entries += s.total
          else movByWeek[week].exits += s.total
        })
        const monthlyMovement = Object.entries(movByWeek).map(([month, v]) => ({ month, ...v }))

        return {
          products,
          summary: { totalStock, totalValue, lowStockCount: lowStock.length, totalProducts: products.length },
          lowStock,
          monthlyMovement: monthlyMovement.length > 0 ? monthlyMovement : [
            { month: 'S1', entries: 0, exits: 0 },
            { month: 'S2', entries: 0, exits: 0 },
            { month: 'S3', entries: 0, exits: 0 },
            { month: 'S4', entries: 0, exits: 0 },
          ],
        }
      })

      this.post('/products', (schema, request) => {
        const product = schema.create('product', JSON.parse(request.requestBody))
        save('mirage-products', schema, 'product')
        return product
      })

      this.patch('/products/:id', (schema, request) => {
        const product = schema.find('product', request.params.id)
        if (!product) return new Response(404, {}, { error: 'Produto não encontrado' })
        product.update(JSON.parse(request.requestBody))
        save('mirage-products', schema, 'product')
        return product
      })

      // Dashboard
      this.get('/dashboard', (schema) => {
        const sales = schema.all('sale').models.map((s: any) => s.attrs)
        const products = schema.all('product').models.map((p: any) => p.attrs)

        const totalRevenue = sales
          .filter((s: any) => s.status === 'Recebido')
          .reduce((acc: number, s: any) => acc + s.total, 0)

        const monthlySales = sales.reduce((acc: number, s: any) => acc + s.total, 0)

        const activeClients = new Set(sales.map((s: any) => s.client)).size

        const totalStock = products.reduce((acc: number, p: any) => acc + p.stock, 0)

        const salesByMonth = sales.reduce((acc: Record<string, number>, s: any) => {
          if (!s.date) return acc
          const month = new Date(s.date).toLocaleString('pt-BR', { month: 'short' })
          acc[month] = (acc[month] || 0) + s.total
          return acc
        }, {})

        const salesPerformance = Object.entries(salesByMonth).map(([month, value]) => ({ month, value }))

        const stockByCategory = products.reduce((acc: Record<string, { stock: number; demand: number }>, p: any) => {
          if (!acc[p.category]) acc[p.category] = { stock: 0, demand: 0 }
          acc[p.category].stock += p.stock
          acc[p.category].demand += p.exits
          return acc
        }, {})

        const stockVsDemand = Object.entries(stockByCategory).map(([category, v]) => ({ category, ...v }))

        return {
          totalRevenue,
          monthlySales,
          activeClients,
          totalStock,
          salesPerformance,
          stockVsDemand,
          recentSales: sales.slice(-4).reverse(),
          topProducts: products.sort((a: any, b: any) => b.exits - a.exits).slice(0, 4),
        }
      })

      // Catalog
      this.get('/catalog', (schema) => {
        const catalogItems = schema.all('catalogItem').models.map((c: any) => c.attrs)
        return { catalogItems }
      })

      this.post('/catalog', (schema, request) => {
        const item = schema.create('catalogItem', JSON.parse(request.requestBody))
        save('mirage-catalog', schema, 'catalogItem')
        return item
      })

      this.del('/catalog/:id', (schema, request) => {
        const item = schema.find('catalogItem', request.params.id)
        if (!item) return new Response(404, {}, { error: 'Produto não encontrado' })
        item.destroy()
        save('mirage-catalog', schema, 'catalogItem')
        return new Response(200, {}, {})
      })
    },
  })
}