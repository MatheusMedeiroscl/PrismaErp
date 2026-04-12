import { pool } from './db'

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sales (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      status TEXT NOT NULL DEFAULT 'A Receber',
      client TEXT NOT NULL,
      total NUMERIC NOT NULL,
      payment TEXT NOT NULL,
      seller TEXT,
      date DATE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
      product TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price NUMERIC NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      category TEXT,
      stock INTEGER NOT NULL DEFAULT 0,
      price NUMERIC NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Em Estoque'
    );

    CREATE TABLE IF NOT EXISTS catalog_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      category TEXT
    );

    CREATE TABLE IF NOT EXISTS clients (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      establishment TEXT NOT NULL,
      responsible TEXT
    );

    INSERT INTO users (name, email, password)
    VALUES ('Admin', 'admin@prisma.com', '123456')
    ON CONFLICT (email) DO NOTHING;
  `)

  console.log('Tabelas criadas com sucesso!')
  await pool.end()
}

migrate().catch(err => {
  console.error('Erro ao criar tabelas:', err)
  process.exit(1)
})