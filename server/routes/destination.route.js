import { Router } from 'express';
import { createDestination, deleteDestination, getDestination, getDestinations, updateDestination } from '../controllers/destination.controller.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
import isAdmin from '../middleware/isAdmin.js';
import { uploadDestinationImage } from '../middleware/multerConfig.js';

const DestinationRouter = Router();

DestinationRouter.get('/', getDestinations);
DestinationRouter.get('/:id', getDestination);
DestinationRouter.post('/', isAuthenticated, isAdmin, uploadDestinationImage, createDestination);
DestinationRouter.put('/:id', isAuthenticated, uploadDestinationImage, updateDestination);
DestinationRouter.delete('/:id', isAuthenticated, isAdmin, deleteDestination);

export default DestinationRouter;