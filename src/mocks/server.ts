import {createServer, Model} from 'miragejs';

createServer({
    models: {
        users: Model
    },
    routes(){
        this.namespace = 'api';

        this.get('/users', () => {
            return 'test'
        })
    }
})