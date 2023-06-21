import { Request, Response } from 'express'
import Roles, { IRol } from '../models/Roles'


class RolesController{

    public async getRoles( req: Request, res: Response ){
        const roles = await Roles.find();
        res.status(200).json(roles);
    }

    public async createrRol( req: Request, res: Response ){
        const { nombre } = req.body;

        if( nombre === undefined || !nombre ) return res.status(400).json({
            message: "Se requiere el nombre"
        })

        const newRol: IRol = new Roles({ nombre })

        const saveRol = await newRol.save();
        
        res.status(201).json(saveRol)
    }

    public async updateRolById( req: Request, res: Response ){
        const { nombre } = req.body;

        if( !nombre ) return res.status(400).json({ 
            message: "Se requiere el nombre"
         })

        const updateRol = await Roles.findByIdAndUpdate(
            req.params.rolId,
            req.body,
            {
                nre: true
            }
        );
        
        res.status(200).json(updateRol)
    }

    public async deleteRolById( req: Request, res: Response ){

    }

}

export const rolesController = new RolesController();