const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Listing = require("../models/listing");

async function getGeocodedGeometry(location) {
  const { config, geocoding } = await import("@maptiler/client");
  config.apiKey = process.env.MAP_API_KEY;

  try {
    const response = await geocoding.forward(location, { limit: 1 });
    if (response.features && response.features.length > 0) {
      return response.features[0].geometry;
    }
  } catch (err) {
    console.error(`Geocoding error for "${location}":`, err.message);
  }
  return null;
}

async function migrateListings() {
  dotenv.config();
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const listings = await Listing.find({
    $or: [
      { geometry: { $exists: false } },
      { "geometry.coordinates": { $exists: false } },
    ],
  });

  console.log(`Found ${listings.length} listings without geometry.`);

  for (const listing of listings) {
    const geometry = await getGeocodedGeometry(listing.location);
    if (geometry) {
      listing.geometry = geometry;
      await listing.save();
      console.log(`✅ Updated "${listing.title}" with geometry`);
    } else {
      console.log(`⚠️ Could not geocode: "${listing.title}"`);
    }
  }

  mongoose.connection.close();
}

migrateListings();
