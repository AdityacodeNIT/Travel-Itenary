import app from '../src/app';
import { connectDB } from '../src/config/db';

let isConnected = false;

// Serverless function wrapper for Vercel
export default async function handler(req, res) {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
}
