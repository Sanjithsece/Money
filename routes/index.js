// routes/index.js
// Central router — mirrors Spring's @RequestMapping annotations.

import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

// Controllers
import * as userController from '../controllers/userController.js';
import * as adminController from '../controllers/adminController.js';
import * as exchangeRequestController from '../controllers/exchangeRequestController.js';
import * as meetingController from '../controllers/meetingController.js';
import * as notificationController from '../controllers/notificationController.js';
import * as fileUploadController from '../controllers/fileUploadController.js';
import authRoutes from './authRoutes.js';
import * as authController from '../controllers/authController.js';

const router = Router();

// Mongoose-backed email verification auth routes:
// /api/auth/register, /api/auth/verify-email/:token, /api/auth/login
router.use('/auth', authRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC routes  →  /api/users/register, /api/users/login
// Mirrors: .requestMatchers("/api/users/register/**", "/api/users/login").permitAll()
// ─────────────────────────────────────────────────────────────────────────────
router.post('/users/register', authController.register);
router.post('/users/login', authController.login);

// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTICATED user routes
// ─────────────────────────────────────────────────────────────────────────────
router.get('/users/me', authenticate, userController.getCurrentUser);
router.post('/users/upload-picture', authenticate, upload.single('file'), fileUploadController.uploadProfilePicture);

// Exchange requests
router.post('/requests', authenticate, exchangeRequestController.createRequest);
router.get('/requests/open', authenticate, exchangeRequestController.getOpenRequests);
router.get('/requests/my-requests', authenticate, exchangeRequestController.getMyRequests);

// Meetings
router.post('/meetings/propose', authenticate, meetingController.proposeMeeting);
router.put('/meetings/:proposalId/accept', authenticate, meetingController.acceptMeeting);
router.put('/meetings/:proposalId/reject', authenticate, meetingController.rejectMeeting);

// Notifications
router.get('/notifications', authenticate, notificationController.getNotifications);
router.get('/notifications/unread-count', authenticate, notificationController.getUnreadCount);
router.post('/notifications/mark-as-read', authenticate, notificationController.markAllAsRead);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN routes  →  /api/admin/**
// Mirrors: .requestMatchers("/api/admin/**").hasRole("ADMIN")
// ─────────────────────────────────────────────────────────────────────────────
router.get('/admin/users', authenticate, requireAdmin, adminController.getAllUsers);
router.get('/admin/transactions', authenticate, requireAdmin, adminController.getAllTransactions);
router.get('/admin/stats', authenticate, requireAdmin, adminController.getStats);
router.get('/admin/users/:id', authenticate, requireAdmin, adminController.getUserDetails);
router.delete('/admin/users/:id', authenticate, requireAdmin, adminController.deleteUser);

export default router;
