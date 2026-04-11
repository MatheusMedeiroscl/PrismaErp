// src/shared/services/Service.ts

interface LoginCredentials {
  email: string
  password: string
}

interface User {
  id: string
  name: string
  email: string
}

interface Sale {
  id: string
  status: string
  client: string
  total: number
  payment: string
  seller: string
  date: string
}

interface Product {
  name: string
  stock: number
  minStock: number
  category: string
  price: number
  entries: number
  exits: number
}

const BASE_URL = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro na requisição')
  }

  return response.json()
}

export const Service = {
  // Auth
  Login: ({ email, password }: LoginCredentials) =>
    request<{ user: User }>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Dashboard
  GetDashboard: () =>
    request<{
      totalRevenue: number
      monthlySales: number
      activeClients: number
      totalStock: number
      salesPerformance: { month: string; value: number }[]
      stockVsDemand: { category: string; stock: number; demand: number }[]
      recentSales: Sale[]
      topProducts: Product[]
    }>('/dashboard'),

  // Sales
  GetSales: () =>
    request<{
      sales: Sale[]
      summary: { total: number; received: number; pending: number; cancelled: number }
    }>('/sales'),

  CreateSale: (sale: Omit<Sale, 'id'>) =>
    request<Sale>('/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    }),

  // Products
  GetProducts: () =>
    request<{
      products: Product[]
      summary: { totalStock: number; totalValue: number; avgDays: number; lowStockCount: number; totalProducts: number }
      lowStock: Product[]
      monthlyMovement: { month: string; entries: number; exits: number }[]
    }>('/products'),

  CreateProduct: (product: Omit<Product, 'id'>) =>
    request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),
}