 export interface Istock {
    id: number,
    name: string,
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