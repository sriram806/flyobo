import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { DestinationReport, PackageReport, UserReport } from '../controllers/report.controller.js';

const ReportRoute = express.Router();

ReportRoute.get('/users', isAuthenticated, UserReport);
ReportRoute.get('/destinations', isAuthenticated, DestinationReport);
ReportRoute.get('/packages', isAuthenticated, PackageReport);

export default ReportRoute;