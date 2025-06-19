// utils/assignCategory.js

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
  Camping: ["camp", "tent", "treehouse", "alaska"],
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
  return "Trending";
};

module.exports = assignCategory;
