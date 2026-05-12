const URL = 'http://localhost:8080'

 interface IProduct {
    name: string;
    category: string;
    costPrice: number;
    salePrice: number;
}


export const ProductService = {
    async getAll(token: string | null){
        const response = await fetch(`${URL}/products`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    },
    async getById(id: number, token: string | null){
        const response = await fetch(`${URL}/products/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();

    },
   async create( token: string | null, product: IProduct){
        console.log('Produto:', product)
        const response = await fetch(`${URL}/products`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(product)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }, 
    async update(id: number, product: IProduct, token: string | null){
              const response = await fetch(`${URL}/products/${id}`, {
            
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(product)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    },
    async delete(id: number, token: string | null){
       await fetch(`${URL}/products/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
        });

    }




};