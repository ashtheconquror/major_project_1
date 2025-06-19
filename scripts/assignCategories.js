require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/listing");

const MONGO_URL =
  process.env.MONGO_URL || "mongodb://localhost:27017/wanderlust";

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.log("Mongo error", err));

// Category rules: map category to keywords
const categoryKeywords = {
  Mountains: ["mountain", "aspen", "alps", "banff", "ski", "rockies"],
  Rooms: ["room", "loft", "apartment", "studio", "penthouse"],
  Castles: ["castle", "fort", "historic", "medieval", "heritage"],
  "Iconic Cities": [
    "tokyo",
    "new york",
    "los angeles",
    "boston",
    "amsterdam",
    "florence",
    "dubai",
  ],
  "Amazing Pools": ["pool", "swimming", "infinity pool"],
  Camping: ["camp", "tent", "treehouse", "Alaska"],
  Farms: ["farm", "barn", "ranch", "countryside"],
  Arctic: ["alaska", "arctic", "snow", "ice", "northern lights"],
  Domes: ["dome", "igloo", "geodome"],
  "House Boats": ["boat", "houseboat", "floating"],
};

const assignCategory = (listing) => {
  const searchableText =
    `${listing.title} ${listing.description} ${listing.location}`.toLowerCase();

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => searchableText.includes(keyword))) {
      return category;
    }
  }
  return "Trending"; // Default fallback
};

const assignCategories = async () => {
  const listings = await Listing.find({});

  for (let listing of listings) {
    const newCategory = assignCategory(listing);
    if (listing.category !== newCategory) {
      listing.category = newCategory;
      await listing.save();
      console.log(`✔ Updated ${listing.title} -> ${newCategory}`);
    }
  }

  console.log("✅ Done assigning categories!");
  mongoose.connection.close();
};

assignCategories();
