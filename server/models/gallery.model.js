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
        enum: ['nature', 'group', 'city', 'adventure', 'wildlife', 'culture', 'beach', 'heritage', 'other'],
        required: true,
        lowercase: true,
        trim: true
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;