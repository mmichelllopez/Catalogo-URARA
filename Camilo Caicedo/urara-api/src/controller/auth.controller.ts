import { Request, Response } from "express";
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

import { encryptAndDecryptData } from "../util/encryptAndDecryptData";
import User, { IUser } from "../models/Usuario"
import Role from "../models/Roles"

class AuthController {
    public async registrar(req: Request, res: Response) {
        const { credencialesEncrypt } = req.body;
        let credenciales!: CredencialesRegistro;        
        try{
            credenciales = encryptAndDecryptData.decrypt( credencialesEncrypt );
        }catch(error){
            
            return res.status(400).json({
                success: false,
                message: "A ocurrido un error"
            })
        }
        const { nombre, telefono, email, username, clave } = credenciales;

        const newUser = new User({
            nombre,
            telefono,
            email,
            username,   //Se encripta la clave
            clave: await User.encryptClave(clave)
        });
        // agregar rol
        const role = await Role.findOne({ nombre: "usuario" });
        newUser.roles = [role!._id];
 
        //Se guarda un nuevo usuario
        const savedUser = await newUser.save();

        await User.sendEmailVerification(savedUser);

        res.status(200).json({ 
            success: true, 
            message: "Usuario registrado, verifica el email" 
        })
    }

    public async login(req: Request, res: Response) {
        const { credencialesEncrypt } = req.body;
        let credenciales!: Credenciales;        
        try{
            credenciales = encryptAndDecryptData.decrypt( credencialesEncrypt );
        }catch(error){
            
            return res.status(400).json({
                success: false,
                message: "A ocurrido un error"
            })
        }
        const user = await User.findOne({ username: credenciales.username }).populate('roles')
        //.populate("roles");

        if (!user) {
            
            return res.status(400).json({ 
                success: false, 
                message: "El usuario no existe" });
        }

        if(user.emailverified == false){
            
            return res.status(401).json({
                success: false,
                message: 'No se a verificado el email'
            });
        } 

        const validarClave = await User.compareClave(credenciales.clave, user.clave);

        if (!validarClave) {
            
            return res.status(401).json({ 
                success: false, 
                message: "Contraseña incorrecta" 
            });
        }

        //Generando token
        const token: string = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET || 'tokentest',
            {
                expiresIn: 60 * 60 * 48 //duracion de token 1 dia
            });

        //Verificar rol de usuario
        const foundRoles = await Role.find({ _id: { $in: user.roles } });
        const userRoles = foundRoles.map((roles) => roles.nombre);

        if (userRoles.includes("admin") || userRoles.includes("moderador")) {
            
            return res.status(401).json({
                success: false,
                message: "Acceso no permitido"
            })
        }
        
        
        res.header('token', token).json({ 
            success: true,
            message: "Inicio sesion",
            data: user,
            token: token 
        });
    }

    public async loginPanel(req: Request, res: Response) {
        const { credencialesEncrypt } = req.body;
        let credenciales!: Credenciales;        
        try{
            credenciales = encryptAndDecryptData.decrypt( credencialesEncrypt );
        }catch(error){
           
            return res.status(400).json({
                success: false,
                message: "A ocurrido un error"
            })
        }
        const user = await User.findOne({ username: credenciales.username }).populate('roles')
        //.populate({ path: "roles", select: "nombre"});

        if (!user) {
            
            return res.status(400).json({ success: false, message: "El usuario no existe" });
        }

        if(user.emailverified == false){
            
            return res.status(401).json({
                success: false,
                message: 'No se a verificado el email'
            });
        } 

        const validarClave = await User.compareClave(credenciales.clave, user.clave);

        if (!validarClave) {
            
            return res.status(401).json({ success: false, message: "Contraseña incorrecta" });
        }

        //Generando token
        const token: string = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET || 'tokentest',
            {
                expiresIn: 60 * 60 * 48 //duracion de token 1 dia
            });

        //Verificar rol de usuario
        const foundRoles = await Role.find({ _id: { $in: user.roles } });
        const userRoles = foundRoles.map((roles) => roles.nombre);

        if (userRoles.includes("usuario")) {
            
            return res.status(401).json({
                success: false,
                message: "Acceso no permitido"
            })
        }
        
        
        res.header('token', token).json({ 
            success: true, 
            message: "Inicio sesion",
            data: user,
            token: token 
        });
    }

    public async restablecerClave(req: Request, res: Response) {
        const { email } = req.body;

        if (!email) return res.status(400).json({
            success: false,
            message: 'Se requiere el email'
        })

        try {

            //Consultar si se encuentra el email 
            const user = await User.findOne({ email: email });
            if (!user) return res.status(403).json({
                success: false,
                message: 'No se encontro el email'
            });

            if(user.emailverified == false) return res.status(401).json({
                success: false,
                message: 'No se a verificado el email'
            });

            let newPass = user;

            //Generar contraseña
            const generarClave = (num: number) => {
                let clave = Math.random().toString(36).substring(0, num);
                return clave
            }
            const claveGenerada = generarClave(7);
            const clave: any = await User.encryptClave(claveGenerada)
            newPass.clave = clave;

            //Guardar clave generada en la base de datos
            const updateClave = await User.findByIdAndUpdate(
                user._id,
                newPass, {
                new: true
            }
            );

            //Enviar correo con contraseña
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: `${process.env.EMAIL_ADDRESS}`,
                    pass: `${process.env.EMAIL_PASSWORD}`
                }
            });

            const mailOptions = {
                from: `${process.env.EMAIL_ADDRESS}`,
                to: `${user.email}`,
                subject: "Restablecer Clave - URARA",
                html: `<p>Se a generado una nueva clave</p>
                <p>Clave: ${claveGenerada}</p>
                <p>Se recomienda actualizar la clave cuando ingrese</p>`
            };

            transporter.sendMail(mailOptions, (err, response) => {
                if (err) {
                    
                    console.error('Ha ocurrido un error ->', err);
                } else {
                    res.status(200).json({
                        success: true,
                        message: 'Solicitud enviada, revice su email.'
                    })
                }
            });

        } catch (error) {
            console.error(error);
        
            res.status(500).json({
                success: false,
                message: 'Ha ocurrido un error',
                error: error
            })
        }
    }

    public async confirmAccount(req: Request, res: Response) {

        const confirmAccount = async (token: string) => {
            let email = null;
            try {
                const payload = jwt.verify(token, process.env.TOKEN_SECRET || 'tokentesturaraapi') as IPayload;
                email = payload.email
            } catch (err) {
                
                throw new Error('Token invalido')
            }

            return await User.findOne({ email: email })
                .then(async user => {
                    if (!user) throw new Error('No se a encontrado el usuario')

                    if (user.emailverified == true) throw new Error('El usuario ya esta verificado')

                    user.emailverified = true;
                    return await user.save();
                })


        }

        try {
            confirmAccount(req.params.token)
                .then(() => {
                    res.status(200).json({
                        success: true,
                        message: "Confirmado el usuario exitosamente"
                    })
                }).catch(err => {
                    res.status(500).json({
                        success: false,
                        error: err.message
                    })
                })
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err
            })
        }



    }

}

export const authController = new AuthController();

interface IPayload {
    email: string;
    iat: number;
    exp: number;
}

interface Credenciales{
    username: string;
    clave: string;
}

interface CredencialesRegistro{
    nombre: string;
    telefono: number;
    email: string;
    username: string;
    clave: string;
}