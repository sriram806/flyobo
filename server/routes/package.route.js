import express from 'express';
import {
  uploadPackage,
  EditPackage,
  getSinglePackage,
  addReview,
  deletePackage,
  getPackagebyUser,
  getAllPackages,
  bulkUploadPackages,
} from '../controllers/package.controller.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { uploadPackageImage, uploadExcelFile } from '../middleware/multerConfig.js';

const packageRouter = express.Router();

packageRouter.post('/', isAuthenticated, uploadPackageImage, uploadPackage); //✅ 1. CREATING A PACKAGE & WORKING
packageRouter.post('/bulk-upload', isAuthenticated, uploadExcelFile, bulkUploadPackages); //✅ 9. BULK UPLOAD FROM EXCEL
packageRouter.put('/edit-package/:id', isAuthenticated, uploadPackageImage, EditPackage); //✅ 2. UPDATE PACKAGE & WORKING
packageRouter.get('/get-packages', getAllPackages);
packageRouter.get('/get-package/:id', isAuthenticated, getPackagebyUser);
packageRouter.post('/:id/reviews', isAuthenticated, addReview); //✅ 5. ADDING REVIEW TO PACKAGE & WORKING
packageRouter.delete('/:id', isAuthenticated, deletePackage); //✅ 6. DELETE PACKAGE FROM DATABASE & WORKING
packageRouter.get('/:id', getSinglePackage); //✅ 3. GETTING SINGLE PACKAGE & WORKING

export default packageRouter;
