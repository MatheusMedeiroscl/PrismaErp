import {createServer, Factory, Model} from 'miragejs';
import { useEffect } from 'react';

function load(key: string){
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
}

function save(key: string, schema: any, modelName: string){
    const all = schema.all(modelName).models.map((m: any) => m.attrs);
    localStorage.setItem(key, JSON.stringify(all));
}




createServer({
    models: {
        user: Model
    }, 
    factories: {
        user: Factory.extend({
            name: String,
            email: String,
            password: String

        })
    }, 
    seeds(server) {
        load('mirage-users').forEach((u: any) => server.create('user', u));
    },
    routes(){
        this.namespace = 'api';

        this.get('/users', (schema) => {
            return schema.all('user')
        }),
        this.post('/users', (schema, request) =>{
            const user = schema.create('user', JSON.parse(request.requestBody));
            save('mirage-users', schema, 'user');

            return user;
        }),
          this.post('/users/login', (schema, request) => {
      const { email, password } = JSON.parse(request.requestBody)

      const user = schema.findBy('user', { email })

      if (!user) {
        return 'Usuário não encontrado)'
      }

      if (user.attrs.password !== password) {
        return 'senha inválida'
      }

      return { user: user.attrs }
    })
    }
})