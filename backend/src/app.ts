import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import Mainrouter from './routes/index.js';

dotenv.config();

const app = express();

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Added PATCH since you use it
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Add your main router
app.use('/api', Mainrouter);

// Test route
app.use('/test', (req, res) => {
    res.json({ message: "Welcome to the API" });
});

export { app };