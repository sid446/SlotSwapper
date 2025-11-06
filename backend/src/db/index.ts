import mongoose from "mongoose";

/**
 * @description Connects the application to the MongoDB database using Mongoose.
 * It uses environment variables MONGODB_URI and DB_NAME.
 */
const connectDB = async (): Promise<void> => {
    try {
        // Ensure environment variables are set before attempting connection
        if (!process.env.MONGODB_URI || !process.env.DB_NAME) {
            throw new Error("MONGODB_URI or DB_NAME environment variable is not set.");
        }

        // Construct the full connection string
        const connectionString = `${process.env.MONGODB_URI}/${process.env.DB_NAME}`;

        // Attempt to connect to the database
        const connectionInstance = await mongoose.connect(connectionString);

        // Log successful connection details
        console.log(`✅ MongoDB connected! DB Host: ${connectionInstance.connection.host}`);
        
    } catch (error: unknown) {
        // Catch block explicitly handles the error type
        const errorMessage = (error instanceof Error) ? error.message : "An unknown connection error occurred.";
        
        console.error(`❌ MongoDB Connection Error: ${errorMessage}`);
        
        // Exit the process with failure code (1)
        process.exit(1);
    }
};

export default connectDB;