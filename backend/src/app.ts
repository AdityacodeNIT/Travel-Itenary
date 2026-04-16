import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import tripRoutes from './routes/trip.routes';
import { errorHandler, notFound } from './middlewares/errorHandler';

const app: Express = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/trip', tripRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
