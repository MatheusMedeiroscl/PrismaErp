const URL = 'http://localhost:8080'

interface saleItem {
    productId: number,
    quantity: number,
    salePrice: number
}

interface sale {
    clientID: number,
    status: string,
    method: string,
    dueDate: string,
    items: Array<saleItem>
}

export const SaleService = {
    async getAll(token: string | null){
        const response = await fetch(`${URL}/sale`, {
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
    async create (token: string | null, sale: sale){
        const response = await fetch(`${URL}/sale`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(sale)
        });

        if (!response.ok) {
            const errorBody = await response.text();

            console.error(errorBody);

            throw new Error(
                `HTTP error! status: ${response.status}`
            );
        }

        return response.json();
    }
    
}