import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { TripService } from '../services/TripService';

export const generateTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const newTrip = await TripService.generateTrip(req.user!.id, req.body);
    res.status(201).json(newTrip);
  } catch (error) {
    console.error('Generate trip error:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getUserTrips = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trips = await TripService.getUserTrips(req.user!.id);
    res.json(trips);
  } catch (error) {
    console.error('Get user trips error:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getTripById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tripId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const trip = await TripService.getTripByIdAndUser(tripId, req.user!.id);
    
    if (!trip) {
      res.status(404).json({ message: 'Trip not found' });
      return;
    }
    
    res.json(trip);
  } catch (error) {
    console.error('Get trip by ID error:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tripId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const trip = await TripService.getTripByIdAndUser(tripId, req.user!.id);
    
    if (!trip) {
      res.status(404).json({ message: 'Trip not found' });
      return;
    }
    
    // Update logic would go here - for now just return the trip
    res.json(trip);
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tripId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await TripService.deleteTrip(tripId, req.user!.id);
    res.json({ message: 'Trip removed' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

export const regenerateDay = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { day } = req.body;
    
    if (!day) {
      res.status(400).json({ message: 'Day number is required' });
      return;
    }
    
    const tripId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updatedTrip = await TripService.regenerateDay(tripId, req.user!.id, day);
    res.json(updatedTrip);
  } catch (error) {
    console.error('Regenerate day error:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

export const optimizeDay = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tripId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const dayParam = Array.isArray(req.params.day) ? req.params.day[0] : req.params.day;
    const dayNumber = parseInt(dayParam, 10);
    const { targetReduction } = req.body;
    
    if (isNaN(dayNumber)) {
      res.status(400).json({ message: 'Valid day number is required in URL' });
      return;
    }
    
    const updatedTrip = await TripService.optimizeDayBudget(tripId, req.user!.id, dayNumber, targetReduction);
    res.json(updatedTrip);
  } catch (error) {
    console.error('Optimize day error:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};
