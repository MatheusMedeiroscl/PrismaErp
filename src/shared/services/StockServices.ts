const URL = 'http://localhost:8080/'

export const StockService = {
    async getAll(token: string){
        const response = await fetch(`${URL}/stock`, {
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
    }




};