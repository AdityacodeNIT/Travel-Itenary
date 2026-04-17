import app from '../src/app';
import { connectDB } from '../src/config/db';

let isConnected = false;

// Serverless function wrapper for Vercel
export default async function handler(req: any, res: any) {
  try {
    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }
    return app(req, res);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
  }
}
