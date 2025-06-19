const Listing = require("../models/listing");
const getCoordinatesFromMapTiler = require("../utils/geocoder");

module.exports.index = async (req, res) => {
  const { category } = req.query;
  let allListings;

  if (category) {
    allListings = await Listing.find({ category });
  } else {
    allListings = await Listing.find({});
  }

  res.render("listings/index.ejs", { allListings, category });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  try {
    console.log("Request body:", req.body);

    // Dynamically import MapTiler Client
    const { config, geocoding } = await import("@maptiler/client");
    config.apiKey = process.env.MAP_API_KEY;

    const locationQuery = req.body.listing.location;
    if (!locationQuery || locationQuery.trim() === "") {
      req.flash("error", "Please provide a valid location.");
      return res.redirect("/listings/new");
    }

    // Call geocoding with the query string as the first argument
    const geocodeResponse = await geocoding.forward(locationQuery, {
      limit: 1,
    });
    console.log("Geocoding response:", geocodeResponse);

    if (!geocodeResponse.features || geocodeResponse.features.length === 0) {
      req.flash("error", "Location not found. Please enter a valid address.");
      return res.redirect("/listings/new");
    }

    const geometry = geocodeResponse.features[0].geometry;
    console.log("Extracted geometry:", geometry);

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    // Attach the geometry from geocoding
    newListing.geometry = geometry;

    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New listing created!");
    res.redirect("/listings");
  } catch (error) {
    console.error("Error creating listing:", error);
    next(error);
  }
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  const { location, country } = req.body.listing;
  const fullNewLocation = `${location}, ${country}`;
  const fullOldLocation = `${listing.location}, ${listing.country}`;

  // Only update geometry if location or country changed
  if (fullNewLocation !== fullOldLocation) {
    const newGeometry = await getCoordinatesFromMapTiler(fullNewLocation);
    if (newGeometry) {
      req.body.listing.geometry = newGeometry;
    }
  }

  // Update all fields including possibly new geometry
  let updatedListing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );

  // Handle image update if a new file is uploaded
  if (req.file) {
    updatedListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
    await updatedListing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
