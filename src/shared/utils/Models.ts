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