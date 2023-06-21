import dotenv from 'dotenv'
dotenv.config()

import express, {Application, json} from 'express';
import morgan from 'morgan';
import cors from 'cors';
import './database'
import { createRole, createAdm } from './libs/initialSetup'

import indexRoutes from './routes/index.routes';
import authRoutes from './routes/auth.routes';
import rolesRoutes from './routes/roles.routes'


createRole();
createAdm();

class Server {
    public app: Application;
    
    constructor(){
        this.app = express();
        this.config();
        this.router();
    }

    config(): void{
        this.app.set('port', process.env.PORT || 3000);
        this.app.use(morgan('dev'));
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: false}));
    }

    router(): void{
        this.app.use( indexRoutes )
        this.app.use('/api/auth', authRoutes);
        this.app.use('/api/roles', rolesRoutes);

    }

    start(): void {
        this.app.listen( this.app.get('port'), () => {
            console.log('Server on port ', this.app.get('port'))
            
        })
    }
}

const server = new Server();
server.start();