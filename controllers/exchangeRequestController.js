// controllers/exchangeRequestController.js
import * as exchangeRequestService from '../services/exchangeRequestService.js';

export const createRequest = async (req, res) => {
  try {
    const request = await exchangeRequestService.createRequest({
      ...req.body,
      userId: req.body.userId || req.user.id,
    });
    return res.status(201).json(request);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const getOpenRequests = async (_req, res) => {
  try {
    const requests = await exchangeRequestService.getAllOpenRequests();
    return res.status(200).json(requests);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const requests = await exchangeRequestService.getRequestsForUser(req.user.id);
    return res.status(200).json(requests);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
