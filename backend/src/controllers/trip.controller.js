import { TripService } from '../services/TripService.js';

export const generateTrip = async (req, res) => {
  try {
    const newTrip = await TripService.generateTrip(req.user.id, req.body);
    res.status(201).json(newTrip);
  } catch (error) {
    console.error('Generate trip error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserTrips = async (req, res) => {
  try {
    const trips = await TripService.getUserTrips(req.user.id);
    res.json(trips);
  } catch (error) {
    console.error('Get user trips error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getTripById = async (req, res) => {
  try {
    const tripId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const trip = await TripService.getTripByIdAndUser(tripId, req.user.id);

    if (!trip) {
      res.status(404).json({ message: 'Trip not found' });
      return;
    }

    res.json(trip);
  } catch (error) {
    console.error('Get trip by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateTrip = async (req, res) => {
  try {
    const tripId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const trip = await TripService.getTripByIdAndUser(tripId, req.user.id);

    if (!trip) {
      res.status(404).json({ message: 'Trip not found' });
      return;
    }

    res.json(trip);
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const tripId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await TripService.deleteTrip(tripId, req.user.id);
    res.json({ message: 'Trip removed' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const regenerateDay = async (req, res) => {
  try {
    const { day } = req.body;

    if (!day) {
      res.status(400).json({ message: 'Day number is required' });
      return;
    }

    const tripId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updatedTrip = await TripService.regenerateDay(tripId, req.user.id, day);
    res.json(updatedTrip);
  } catch (error) {
    console.error('Regenerate day error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const optimizeDay = async (req, res) => {
  try {
    const tripId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const dayParam = Array.isArray(req.params.day) ? req.params.day[0] : req.params.day;
    const dayNumber = parseInt(dayParam, 10);
    const { targetReduction } = req.body;

    if (Number.isNaN(dayNumber)) {
      res.status(400).json({ message: 'Valid day number is required in URL' });
      return;
    }

    const updatedTrip = await TripService.optimizeDayBudget(tripId, req.user.id, dayNumber, targetReduction);
    res.json(updatedTrip);
  } catch (error) {
    console.error('Optimize day error:', error);
    res.status(500).json({ message: error.message });
  }
};
