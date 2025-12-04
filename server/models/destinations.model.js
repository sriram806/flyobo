import mongoose from 'mongoose';
import slugify from 'slugify';

const destinationSchema = new mongoose.Schema({
    place: {
        type: String,
        required: [true, 'Destination Place is required'],
        trim: true,
        minlength: [2, 'Place must be at least 2 characters'],
        maxlength: [100, 'Place cannot exceed 100 characters']
    },
    slug: {
        type: String,
        unique: true,
        index: true
    },
    state: {
        type: String,
        trim: true,
        default: null
    },
    country: {
        type: String,
        trim: true,
        default: null
    },
    shortDescription: {
        type: String,
        default: null,
        maxlength: [250, 'Short description cannot exceed 250 characters']
    },
    description: {
        type: String,
        default: null
    },
    coverImage: {
        public_id: { type: String, default: null },
        url: { type: String, default: null }
    },
    tags: {
        type: [String],
        default: []
    },
    popular: {
        type: Boolean,
        default: false
    },
    stats: {
        bookings: { type: Number, default: 0 }
    },
    relatedPackages: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Package'
            }
        ],
        default: []
    }
}, { timestamps: true });

destinationSchema.index({ place: 'text', shortDescription: 'text', description: 'text', tags: 'text', country: 'text' });

destinationSchema.pre('save', async function (next) {
    if (this.isModified('place') || !this.slug) {
        let base = slugify(this.place || '', { lower: true, strict: true });
        let slug = base || `destination-${Date.now()}`;

        let exists = await this.constructor.findOne({ slug });
        if (exists && exists._id.toString() !== this._id?.toString()) {
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }
        this.slug = slug;
    }
    next();
});


const Destination = mongoose.model('Destination', destinationSchema);
export default Destination;
