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
    dueDate: Date,
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
    
}