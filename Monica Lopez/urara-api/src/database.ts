import mongoose from 'mongoose'

mongoose.connect(`${process.env.DATABASECONECTION}`)
    .then(db => console.log("Db is connected"))
    .catch( error => console.log( error ) )