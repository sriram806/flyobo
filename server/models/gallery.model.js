import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['nature', 'group', 'city', 'adventure', 'wildlife', 'culture', 'beach', 'heritage', 'nature', 'other'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;