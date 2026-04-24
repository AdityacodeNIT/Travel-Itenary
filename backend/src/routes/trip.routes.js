import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  generateTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  regenerateDay,
  optimizeDay,
} from '../controllers/trip.controller.js';

const router = express.Router();

router.post('/generate', protect, generateTrip);
router.get('/', protect, getUserTrips);
router.get('/:id', protect, getTripById);
router.put('/:id', protect, updateTrip);
router.delete('/:id', protect, deleteTrip);
router.patch('/:id/regenerate-day', protect, regenerateDay);
router.patch('/:id/day/:day/optimize', protect, optimizeDay);

export default router;
