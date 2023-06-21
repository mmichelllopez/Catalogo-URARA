import { Request, Response, NextFunction } from 'express'

import { ROLES } from '../models/Roles'
import User from "../models/Usuario"


export const verificarExisteUsernameOemail = async ( req: Request, res: Response, next: NextFunction ) => {
    const user = await User.findOne({ username: req.body.username });
    if( user ) return res.status(400).json({ 
        success: false,
        message: 'El usuario ya existe' 
    })

    const email = await User.findOne({ email: req.body.email })
    if( email ) return res.status(400).json({
         success: false,
         message: 'El email ya existe' 
        })

    next()
}

export const verificarExisteRol = ( req: Request, res: Response, next: NextFunction ) => {
    if( req.body.roles ){
        for( let i = 0; i < req.body.roles.length; i++ ){
            if( !ROLES.includes(req.body.roles[i]) ){
                return res.status(400).json( {
                    success: false,
                    message: `El rol ${req.body.roles[i]} no existe`
                } )
            }
        }   
    }

    next();
}
