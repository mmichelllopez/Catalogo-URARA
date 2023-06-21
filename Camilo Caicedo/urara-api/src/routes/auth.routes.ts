import { Router } from "express";
import { validacion } from "../middlewares/index"

import { authController } from "../controller/auth.controller";

class AuthRoutes {
    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void{
       this.router.post('/registro', [ validacion.verificarExisteUsernameOemail, 
         ], authController.registrar)
       this.router.post('/login', authController.login)
       this.router.post('/loginPanel', authController.loginPanel)

       this.router.post('/restablecerClave', authController.restablecerClave )
       this.router.get('/confirm/:token', authController.confirmAccount)
    }
}

const authRoutes = new AuthRoutes();
export default authRoutes.router;