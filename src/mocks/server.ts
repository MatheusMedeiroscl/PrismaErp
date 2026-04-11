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
      }),
      product: Factory.extend({
        name: String,
        stock: Number,
        minStock: Number,
        category: String,
        price: Number,
        entries: Number,
        exits: Number,
      }),
    },

    seeds(server) {
      // Users
      load('mirage-users').forEach((u: any) => server.create('user', u))
      if (server.schema.all('user').length === 0) {
        server.create('user', { name: 'Raquel', email: 'raquel@prisma.com', password: '123456' } as any)
      }

      // Sales
      load('mirage-sales').forEach((s: any) => server.create('sale', s))
      if (server.schema.all('sale').length === 0) {
        const sales = [
          { id: '#32', status: 'A Receber', client: 'Mercado Dela limão', total: 245.92, payment: 'Boleto', seller: 'Renato Luis', date: '2024-01-10' },
          { id: '#33', status: 'A Receber', client: 'Bachareira Rogério', total: 245.92, payment: 'Boleto', seller: 'Renato Luis', date: '2024-01-11' },
          { id: '#01', status: 'Pendente', client: 'Irmão Neto pro Deus', total: 245.92, payment: 'Boleto', seller: 'Renata Luis', date: '2024-01-12' },
          { id: '#32', status: 'Recebido', client: 'Quema Final', total: 13.90, payment: 'Pix', seller: 'Renata Luis', date: '2024-01-13' },
          { id: '#12', status: 'Cancelado', client: 'Mercado Dela', total: 89.00, payment: 'Dinheiro', seller: 'Renato Luis', date: '2024-01-14' },
        ]
        sales.forEach(s => server.create('sale', s as any))
      }

      // Products
      load('mirage-products').forEach((p: any) => server.create('product', p))
      if (server.schema.all('product').length === 0) {
        const products = [
          { name: 'Fruta Nutridelta', stock: 5, minStock: 10, category: 'Frutas', price: 1305.45, entries: 40, exits: 35 },
          { name: 'Rastos de Viteiro', stock: 30, minStock: 20, category: 'Verduras', price: 760.85, entries: 50, exits: 20 },
          { name: 'Mercado Kairo', stock: 25, minStock: 15, category: 'Cereais', price: 760.85, entries: 45, exits: 20 },
          { name: '#totalRoc', stock: 18, minStock: 10, category: 'Geral', price: 929.08, entries: 30, exits: 12 },
          { name: 'Allister Dem', stock: 2, minStock: 8, category: 'Frutas', price: 540.53, entries: 20, exits: 18 },
          { name: 'Coco Negresco', stock: 3, minStock: 10, category: 'Doces', price: 450.00, entries: 15, exits: 12 },
          { name: 'Fruta de Ouro', stock: 4, minStock: 12, category: 'Frutas', price: 380.00, entries: 25, exits: 21 },
          { name: 'Palmito Tradicional', stock: 60, minStock: 20, category: 'Conservas', price: 825.60, entries: 80, exits: 20 },
        ]
        products.forEach(p => server.create('product', p as any))
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

      // Products / Estoque
      this.get('/products', (schema) => {
        const products = schema.all('product').models.map((p: any) => p.attrs)
        const totalStock = products.reduce((acc: number, p: any) => acc + p.stock, 0)
        const totalValue = products.reduce((acc: number, p: any) => acc + p.price, 0)
        const avgDays = 65
        const lowStock = products.filter((p: any) => p.stock < p.minStock)

        return {
          products,
          summary: { totalStock, totalValue, avgDays, lowStockCount: lowStock.length, totalProducts: products.length },
          lowStock,
          monthlyMovement: [
            { month: 'S1', entries: 120, exits: 80 },
            { month: 'S2', entries: 90, exits: 110 },
            { month: 'S3', entries: 150, exits: 95 },
            { month: 'S4', entries: 80, exits: 130 },
          ]
        }
      })

      this.post('/products', (schema, request) => {
        const product = schema.create('product', JSON.parse(request.requestBody))
        save('mirage-products', schema, 'product')
        return product
      })

      // Dashboard
      this.get('/dashboard', (schema) => {
        const sales = schema.all('sale').models.map((s: any) => s.attrs)
        const products = schema.all('product').models.map((p: any) => p.attrs)

        return {
          totalRevenue: 50024,
          monthlySales: 7450,
          activeClients: 25,
          totalStock: 75,
          salesPerformance: [
            { month: 'Jan', value: 4200 },
            { month: 'Fev', value: 5800 },
            { month: 'Mar', value: 3900 },
            { month: 'Abr', value: 7200 },
            { month: 'Mai', value: 6100 },
            { month: 'Jun', value: 8900 },
          ],
          stockVsDemand: [
            { category: 'Frutas', stock: 45, demand: 60 },
            { category: 'Verduras', stock: 70, demand: 55 },
            { category: 'Cereais', stock: 30, demand: 40 },
            { category: 'Doces', stock: 20, demand: 35 },
          ],
          recentSales: sales.slice(0, 4),
          topProducts: products.sort((a: any, b: any) => b.exits - a.exits).slice(0, 4),
        }
      })
    },
  })
}