// controllers/meetingController.js
import * as meetingService from '../services/meetingService.js';

export const proposeMeeting = async (req, res) => {
  try {
    const proposal = await meetingService.createProposal(req.body);
    return res.status(201).json(proposal);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const acceptMeeting = async (req, res) => {
  try {
    const proposal = await meetingService.acceptProposal(req.params.proposalId);
    return res.status(200).json(proposal);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const rejectMeeting = async (req, res) => {
  try {
    const proposal = await meetingService.rejectProposal(req.params.proposalId);
    return res.status(200).json(proposal);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
