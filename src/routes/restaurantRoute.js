
import { Router } from "express"
import {

        createRestaurant,
        getRestaurants,
        getRestaurantById,
        updateRestaurant,
        deleteRestaurant,
        getRestaurantsByProximity,
        getRestaurantsWithinRange,

} from "../controllers/restaurantController.js"

const router = Router()

router.route("/create").post(createRestaurant)
router.route("/all").get(getRestaurants)

router.route("/:id")
    .get(getRestaurantById)
    .put(updateRestaurant)
    .delete(deleteRestaurant)

router.route("/proximity").post(getRestaurantsByProximity)
router.route("/range").post(getRestaurantsWithinRange)


export default router