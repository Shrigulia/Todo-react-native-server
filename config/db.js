import mongoose from "mongoose";

export const connectDB = () => {
    // mongoose.set('debug', true)

    mongoose.connect(process.env.MONGO_URI, {
        dbName: process.env.DB_NAME,
    }).then((c) => console.log(`DB connected : ${c.connection.host}`))
        .catch((error) => {
            console.log(error)
            process.exit(1)
        })
};