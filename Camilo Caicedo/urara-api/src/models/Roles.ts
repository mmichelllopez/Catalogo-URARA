import { Schema, model, Document } from 'mongoose'

export const ROLES = ["admin", "moderador", "usuario"]

const rolesSchema = new Schema({
    nombre: String
},{
    versionKey: false
})

export default model<IRol>("Role", rolesSchema)

export interface IRol extends Document {
    nombre: string
}