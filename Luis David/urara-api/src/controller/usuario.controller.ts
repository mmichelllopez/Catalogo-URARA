import { Request, Response } from "express";

import User, { IUser } from "../models/Usuario"
import Role from "../models/Roles"


class UsuarioController{

    public async createUser( req: Request, res: Response ){
        const { nombre, telefono, email, username, clave, roles } = req.body;

        if( roles === undefined || roles.length == 0 || !roles ){
            return res.status(400).json({
                success: false,
                message: "Se requiere el rol"
            });
        }

        const newUser = new User({
            nombre,
            telefono,
            email,
            username,   //Se encripta la clave
            clave: await User.encryptClave(clave)
        });
        // agregar rol
        if ( roles ) {
            const foundRoles = await Role.find({nombre: {$in: roles}});
            newUser.roles = foundRoles.map( (role) => role._id);
        }else{
            const role = await Role.findOne({nombre: "usuario"});
            newUser.roles = [role!._id];
        }

        //Se guarda un nuevo usuario
        const savedUser = await newUser.save();

        await User.sendEmailVerification(savedUser);

        res.status(200).json({ success: true,
            message: "Usuario registrado, requiere confirmación"})
    }

    public async getUsers( req: Request, res: Response ){
        const users = await User.find({},{ clave: 0 }).populate("roles")
        res.status(200).json({
            success: true,
            data: users
        })
    }

    public async perfil( req: Request, res: Response ){
        const user = await User.findById( req.userId ).populate('roles');
        res.status(200).json({
            success: true,
            message: 'Informacion usuario',
            data: user
        })
    }

    public async updatePerfil( req: Request, res: Response ){

        let updateUser = req.body

        const user = await User.findById( req.userId );
        if( !user ) return res.status(400).json( { message: "El usuario no existe" } );

        if( updateUser.claveAntigua && updateUser.claveNueva ){
            const validarClaveAntigua = await User.compareClave( updateUser.claveAntigua, user.clave );
            if( !validarClaveAntigua ) return res.status(401).json( {
                success: false,
                message: "La contraseña antigua no es correcta"
            } );
            
            updateUser.clave = await User.encryptClave(updateUser.claveNueva) 

            delete updateUser.claveAntigua
            delete updateUser.claveNueva
            
        }

        if( updateUser.email ){
            updateUser.emailverified = false;
            await User.sendEmailVerification(updateUser);
        }

        const updatePerfil = await User.findByIdAndUpdate(
            req.userId,
            updateUser,
            {
                new: true
            }
        );
        
        res.status(200).json({ 
            success: true,
            message: 'Se requiere verificación del email',
            data: updatePerfil            
         })
    }

    public async deleteUser( req: Request, res: Response ){
        await User.findByIdAndDelete( req.userId );
        
        res.status(204).json()
    }

    public async deleteUserAdmin( req: Request, res: Response ){
        await User.findByIdAndDelete( req.params.userId );
        
        res.status(204).json()
    }

}

export const usuarioController = new UsuarioController();