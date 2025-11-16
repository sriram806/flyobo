import mongoose from 'mongoose';
import Package from '../models/package.model.js';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

async function run() {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/flyobo';
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB');

  const packages = await Package.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] });
  console.log(`Found ${packages.length} packages without slug`);
  for (const pkg of packages) {
    const newSlug = slugify(pkg.title || pkg._id.toString());
    pkg.slug = newSlug;
    try {
      await pkg.save();
      console.log('Updated', pkg._id.toString(), '->', newSlug);
    } catch (err) {
      console.error('Failed to update', pkg._id.toString(), err.message);
    }
  }

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((e) => { console.error(e); process.exit(1); });
