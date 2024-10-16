import { Restaurant } from '../models/restaurantModel.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// Task 1: CRUD Operations

// Create a new restaurant
const createRestaurant = asyncHandler(async (req, res) => {

    const { name, description, location, ratings } = req.body;

    // Validate location object
    if (!location || !location.coordinates || location.coordinates.length !== 2) 
        {
        throw new ApiError
                (400, 'Invalid location. Latitude and longitude are required.')
    }

    const existingRestaurant = await Restaurant.findOne({ 
        name, 'location.coordinates': location.coordinates });
    
    if (existingRestaurant) {
        throw new ApiError(409, 'A restaurant with the same name and location already exists.')
    }

    const newRestaurant = await Restaurant.create({
         name, 
         description, 
         location, 
         ratings 
        })

    return res.status(201).json(
        new ApiResponse(201, newRestaurant, 'Restaurant created successfully'))
});


// Get all restaurants or a specific one
const getRestaurants = asyncHandler(async (req, res, next) => {
    const restaurants = await Restaurant.find();
    
    if (!restaurants || restaurants.length === 0) {
        return res.status(404).json(
                new ApiResponse(404, [], 'No restaurants found'))
    }

    return res.status(200).json(
        new ApiResponse(200, restaurants, 'Restaurants fetched successfully'))
});

// Get a restaurant by ID
const getRestaurantById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
        throw new ApiError(404, 'Restaurant not found')
    }

    return res.status(200).json(
        new ApiResponse(200, restaurant, 'Restaurant fetched successfully'))
});


// Update a restaurant
const updateRestaurant = asyncHandler(async (req, res, next) => {

    const { id } = req.params;
    const { name, description, location, ratings } = req.body;

    // Validate location object if it's being updated
    if (location && (!location.coordinates || location.coordinates.length !== 2)) {
        throw new ApiError(400, 'Invalid location. Latitude and longitude are required.')
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
        throw new ApiError(404, 'Restaurant not found')
    }

    // If trying to update to the same name and location as another restaurant
    if (name && location) {
        const duplicateRestaurant = await Restaurant.findOne({ 
            _id: { $ne: id },
            name, 
            'location.coordinates': location.coordinates 
        });
        if (duplicateRestaurant) {
            throw new ApiError(409, 'Another restaurant with the same name and location exists.')
        }
    }

    // Update the restaurant
    restaurant.name = name || restaurant.name
    restaurant.description = description || restaurant.description
    restaurant.location = location || restaurant.location
    restaurant.ratings = ratings || restaurant.ratings

    await restaurant.save();

    return res.status(200).json(
        new ApiResponse(200, restaurant, 'Restaurant updated successfully'))
});

// Delete a restaurant
const deleteRestaurant = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const restaurant = await Restaurant.findByIdAndDelete(id);
    if (!restaurant) {
        throw new ApiError(404, 'Restaurant not found');
    }

    return res.status(200).json(
        new ApiResponse(200, restaurant, 'Restaurant deleted successfully'))
});


// Task 2: Get Restaurants Based on Proximity
const getRestaurantsByProximity = asyncHandler(async (req, res, next) => {
    const { latitude, longitude, radius } = req.body;

    if (!latitude || !longitude || !radius) {
        throw new ApiError(400, 'Latitude, longitude, and radius are required');
    }

    const restaurants = await Restaurant.aggregate([
        {
            $geoNear: {
                near: { type: "Point", coordinates: [longitude, latitude] },
                distanceField: "distance",
                maxDistance: radius,
                spherical: true
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                location: 1,
                averageRating: { $avg: "$ratings" },
                noOfRatings: { $size: "$ratings" }
            }
        },
        { $sort: { distance: 1 } }
    ]);

    return res.status(200).json(
        new ApiResponse(200, restaurants, 'Restaurants fetched by proximity'))
});

// Task 3: Get Restaurants Within a Range
const getRestaurantsWithinRange = asyncHandler(async (req, res, next) => {
    const { latitude, longitude, minimumDistance, maximumDistance } = req.body;

    if (!latitude || !longitude || !minimumDistance || !maximumDistance) {
        throw new ApiError(400, 'Latitude, longitude, minimumDistance, and maximumDistance are required')
    }

    const restaurants = await Restaurant.aggregate([
        {
            $geoNear: {
                near: { type: "Point", coordinates: [longitude, latitude] },
                distanceField: "distance",
                minDistance: minimumDistance,
                maxDistance: maximumDistance,
                spherical: true
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                location: 1,
                averageRating: { $avg: "$ratings" },
                noOfRatings: { $size: "$ratings" }
            }
        },
        { $sort: { distance: 1 } }
    ]);

    return res.status(200).json(
        new ApiResponse(200, restaurants, 'Restaurants fetched within range'))
});

export {
        createRestaurant,
        getRestaurants,
        getRestaurantById,
        updateRestaurant,
        deleteRestaurant,
        getRestaurantsByProximity,
        getRestaurantsWithinRange,

}
