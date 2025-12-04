import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { UserReport } from '../controllers/report.controller.js';

const ReportRoute = express.Router();

ReportRoute.get('/', isAuthenticated, UserReport);

export default ReportRoute;