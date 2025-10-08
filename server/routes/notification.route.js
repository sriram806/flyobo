import express from 'express';
import { getNotification, UpdateNotification } from '../controllers/notification.controller.js';
import isAuthenticated from '../middleware/isAuthenticated.js';

const notificationRoute = express.Router();

notificationRoute.get('/',isAuthenticated, getNotification);
notificationRoute.put('/:id',isAuthenticated, UpdateNotification);

export default notificationRoute;
