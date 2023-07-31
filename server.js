import { app } from "./app.js";
import { config } from "dotenv";
import { connectDB } from "./config/db.js";
import cloudinary from 'cloudinary';


config({
    path: "./config/config.env",
})

connectDB();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

app.listen(process.env.PORT, () => {
    console.log("Server started -" + `http://localhost:` + process.env.PORT)
});