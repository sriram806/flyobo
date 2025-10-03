import express from 'express';
import { createLayout, deleteLayout, editLayout, getLayout } from '../controllers/layout.controller.js';
import isAuthenticated from '../middleware/isAuthenticated.js';

const layoutRoute = express.Router();

layoutRoute.get('/', getLayout);
layoutRoute.post('/', isAuthenticated, createLayout);
layoutRoute.put('/', isAuthenticated, editLayout);
layoutRoute.delete('/', isAuthenticated, deleteLayout);

export default layoutRoute;
