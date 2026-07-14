const URL = import.meta.env.VITE_API_URL

export const UserServices = {
  async login(email: string, password: string): Promise<string> {
    const response = await fetch(`${URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

  const { token } = await response.json()   
  return token;
  },
  async getWithAuth(endpoint: string, token: string) {
    const response = await fetch(`${URL}/${endpoint}`, {
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


  async getme(token: string){

    const response = await fetch(`${URL}/auth/me`,{
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
    }

    const user = await response.json();
    return user;
  }
};