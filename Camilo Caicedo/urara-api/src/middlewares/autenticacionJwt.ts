import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken';
import User from '../models/Usuario'
import Roles from '../models/Roles'

interface IPayload {
    _id: number;
    iat: number;
    exp: number;
}

export const TokenValidation = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('token');
        if( !token ) return res.status(401).json({
            success: false,
            message: 'Acceso denegado'
        })

        const payload = jwt.verify(token, process.env.TOKEN_SECRET || 'tokentest') as IPayload;
        req.userId = payload._id;

        const user = User.findById( req.userId);
        if( !user ) return res.status(404).json({ 
            success: false,
            messaje: "No existe el usuario" 
        });
    
        next();
    } catch (error) {
        res.status(401).json({ 
            success: false,
            message: "Sin autorización" 
        })
    }
}
