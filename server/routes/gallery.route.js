import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { getGalleryItems, uploadGalleryItem, deleteGalleryItem, updateGalleryItem } from "../controllers/gallery.controller.js";

const Galleryrouter = express.Router();

Galleryrouter.get("/", getGalleryItems);
Galleryrouter.post("/", isAuthenticated, uploadGalleryItem);
Galleryrouter.delete("/:id", isAuthenticated, deleteGalleryItem);
Galleryrouter.put("/:id", isAuthenticated, updateGalleryItem);


export default Galleryrouter;
