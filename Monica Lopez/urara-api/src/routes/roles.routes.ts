import { Router } from "express";
import { autenticacion } from "../middlewares/index"
import { rolesController } from "../controller/roles.controller";

class RolesRouter {
    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void{
        this.router.get('/', [ autenticacion.TokenValidation, autenticacion.isAdmin ], 
            rolesController.getRoles);
        
        this.router.post('/create', [ autenticacion.TokenValidation, autenticacion.isAdmin ],
            rolesController.createrRol);

        this.router.put('/update/:rolId', [ autenticacion.TokenValidation, autenticacion.isAdmin ],
            rolesController.updateRolById);
    }


}

const rolesRoutes = new RolesRouter();
export default rolesRoutes.router;