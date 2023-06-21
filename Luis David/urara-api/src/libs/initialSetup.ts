import Role from '../models/Roles';
import User from '../models/Usuario';

export const createRole = async () => {
    
    try{
        const count = await Role.estimatedDocumentCount();

        if ( count > 0 ) return;
        
        const values = await Promise.all([
            new Role({nombre: 'usuario'}).save(),
            new Role({nombre: 'admin'}).save(),
            new Role({nombre: 'moderador'}).save()
        ]);

    }catch ( error ){
        console.error(error)
    }
  
}


export const createAdm = async () => {
    try{
        const count = await User.estimatedDocumentCount();

        if( count > 0 ) return;

        const roles = ["admin"];
        const foundRoles = await Role.find({nombre: {$in: roles}});
        
        const values = await Promise.all([
            new User({
                nombre: 'Admin',
                telefono: 3000000000,
                email: 'admin@gmail.com',
                username: 'admin',
                emailverified: true,
                clave: await User.encryptClave('admin1234'),
                roles: foundRoles.map((role) => role._id )
            }).save()
        ]);

    }catch( error ){
        console.error(error)
    }
}