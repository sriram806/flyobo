import express from 'express';
import { getNotification, UpdateNotification, getUnreadCount, markAllAsRead } from '../controllers/notification.controller.js';
import isAuthenticated from '../middleware/isAuthenticated.js';

const notificationRoute = express.Router();

notificationRoute.get('/', isAuthenticated, getNotification);
notificationRoute.put('/:id', isAuthenticated, UpdateNotification);
notificationRoute.get('/unread-count', isAuthenticated, getUnreadCount);
notificationRoute.post('/mark-all-read', isAuthenticated, markAllAsRead);

export default notificationRoute;