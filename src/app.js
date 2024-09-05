import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';


import animeRoutes from './routes/animeRoutes.js';

dotenv.config();
const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use((err, req, res, next) => {
    console.error('Unexpected error:', err);
    res.status(500).send('An unexpected error occurred');
});
app.use(cookieParser());

app.use('/simpanime', animeRoutes);

mongoose.connect(process.env.MONGO_URI)
    .catch(error => console.log(error));

export default app;