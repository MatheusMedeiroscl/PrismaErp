
const URL = 'http://localhost:8080'

interface Iupdate {
    status: string | undefined;
    quantity: number | null;
}

interface ICreate {
    idProduct: number | null;
    type: string;
    quantity: number| null;
}
export const StockService = {

    async getAll(token: string | null){
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
    },

    async updateStock(token: string | null,id: number, updateStock: Iupdate){
        const response = await fetch(`${URL}/stock/${id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updateStock)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    },

    async create(token: string | null, createStock: ICreate){
        console.log(createStock.idProduct, createStock.quantity, createStock.type);
        
        const response = await fetch(`${URL}/movement`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(createStock)
        });

        if (!response.ok) {
            const errorBody = await response.text();

            console.error(errorBody);

            throw new Error(
                `HTTP error! status: ${response.status}`
            );
        }

        return response.json();
    },
    async delete(token: string | null, id: number){
        const response = await fetch(`${URL}/stock/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return console.log("success");
    }    





};