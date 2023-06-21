import { Schema, model, Model, Document } from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

const usuarioSchema = new Schema<IUser, IUserModel>({
    nombre: {
        type: String
    },
    telefono: {
        type: Number
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    username: {
        type: String,
        unique: true
    },
    clave: {
        type: String,
        required: true
    },
    emailverified: {
        type: Boolean,
        default: false
    },
    roles: [{
        ref: "Role",
        type: Schema.Types.ObjectId
    }]
},{
    timestamps: true,
    versionKey: false,
    statics:{
        async encryptClave (clave: string){
            const salt = await bcrypt.genSalt(10);
            return await bcrypt.hash(clave, salt)
        },
        async compareClave (clave: string, claveRecibida: string){
            return await bcrypt.compare(clave, claveRecibida)
        },
        sendEmailVerification(user: IUser){
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: `${process.env.EMAIL_ADDRESS}`,
                    pass: `${process.env.EMAIL_PASSWORD}`
                }
            });

            //Generando token
            const token: string = jwt.sign({ email: user.email }, process.env.TOKEN_SECRET || 'tokentesturaraapi',
            {
                expiresIn: '1h'
            });

            const urlConfirm = `${process.env.API_URLR}/api/auth/confirm/${token}`
            
            const mailOptions = {
                from: `${process.env.EMAIL_ADDRESS}`,
                to: user.email,
                subject: 'Confirmación cuenta URARA',
                html: `<p>Confirma la creacion de tu cuenta. Tiene 1 hora para poder confirmar.
                <a href="${urlConfirm}">Confirmar</a> </p>`
            };

            return transporter.sendMail(mailOptions, (err) => {
                if(err) {
                    console.error('Ha ocurrido un error -> ', err)
                }
            })
        }
    }
})

export default model<IUser, IUserModel>("User", usuarioSchema);

export interface IUser extends Document{
    nombre: string,
    telefono: number,
    email: string,
    username: string,
    clave: string,
    emailverified: boolean,
    roles: any
}

export interface IUserModel extends Model<IUser>{
    encryptClave: ( clave: string ) => Promise<void>
    compareClave: ( clave: string, claveRecibida: string ) => Promise<boolean>
    sendEmailVerification: ( user: IUser ) => void
}