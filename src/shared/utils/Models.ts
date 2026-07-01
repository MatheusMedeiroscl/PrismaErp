 export interface Istock {
    id: number,
    product: string,
    category: string
    quantity: number,
    costPrice: number,
    status: string,
    createAt: string

}
export interface IProduct {
    id: number;
    name: string;
    category: string;
    costPrice: number;
    salePrice: number;
}

export interface ISaleItem {
  id: number;
  product: string;
  productId: number;
  category: string;
  quantity: number;
  salePrice: number;
  createdAt: string;
}

export interface ISale {
  id: number;
  client: string;
  clientId: number;
  creatAt: string;
  paymentMethod: string;
  saleStatus: string;
  dueDate: string;
  totalQuantity: number;
  totalCash: number;
  items: ISaleItem[];
}

export interface IClient {
  id: number;
  storeName: string;
  owner: string;
  email: string;
  cnpj: string;
  address: string;
}