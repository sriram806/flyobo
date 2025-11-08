import "dotenv/config"; // Load dotenv configuration first
import mongoose from "mongoose";

const connecttoDatabase = async ()=>{
    try{
        const MONGO_URI = process.env.MONGO_URI;
        const NODE_ENV = process.env.NODE_ENV;
        
        console.log("Attempting to connect to MongoDB with URI:", MONGO_URI);
        console.log("NODE_ENV:", NODE_ENV);
        
        if (!MONGO_URI) {
            throw new Error("MONGO_URI is not defined. Please set it in your .env file.");
        }

        // Recommended Mongoose settings
        mongoose.set('strictQuery', true);

        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 10000, // 10s to find a server
            socketTimeoutMS: 20000,    
        });
        console.log(`MONGODB connection is Successful and in ${NODE_ENV || 'unknown'} mode`);
    }catch(error){
        console.error('Error connecting to database: ',error);
        console.error('Please check your MongoDB URI and ensure the database server is running.');
        console.error('Exiting the application...');
        process.exit(1);
    }
}

export default connecttoDatabase;