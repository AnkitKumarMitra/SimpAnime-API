import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';


console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET);
