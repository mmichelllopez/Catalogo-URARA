import { Router } from "express";
import { autenticacion, validacion } from "../middlewares/index";
import { usuarioController } from '../controller/usuario.controller'

class UsuarioRoutes {
    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void{
       this.router.post('/create', 
       [ autenticacion.TokenValidation, autenticacion.isAdmin, validacion.verificarExisteRol,
         validacion.verificarExisteUsernameOemail, validacion.verificarCamposObligatoriosRegistroUsuario],
        usuarioController.createUser)

        this.router.get('/users', [ autenticacion.TokenValidation, autenticacion.isAdmin ], 
            usuarioController.getUsers )
        
        this.router.get('/perfil', [ autenticacion.TokenValidation ], usuarioController.perfil)

        this.router.put('/update', [ autenticacion.TokenValidation, 
            validacion.verificarExisteUsernameOemail ],
            usuarioController.updatePerfil)

        this.router.delete('/deleteUser', [ autenticacion.TokenValidation ], 
            usuarioController.deleteUser)
        
        this.router.delete('/deleteUserAdmi/:userId', [ autenticacion.TokenValidation, 
            autenticacion.isAdmin ], usuarioController.deleteUserAdmin)
    }
}

const usuarioRoutes = new UsuarioRoutes();
export default usuarioRoutes.router;