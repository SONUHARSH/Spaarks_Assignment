
import mongoose, {Schema} from "mongoose";


const restaurantSchema = new Schema(
        {
                name: {
                        type: String,
                        required: [true, 'Restaurant name is required'],
                        trim: true,
                        maxlength: [100, 'Restaurant name must not exceed 100 characters']
                    },
                    description: {
                        type: String,
                        required: [true, 'Description is required'],
                        trim: true
                    },
                    location: {
                        type: {
                            type: String,
                            enum: ['Point'],
                            required: true
                        },
                        coordinates: {
                            type: [Number],
                            required: true
                        }
                    },
                    ratings: {
                        type: [Number],
                        default: []
                    }

        },
        {
                timestamps: true
        }

)

restaurantSchema.index({ location: '2dsphere' });


export const Restaurant = mongoose.model("Restaurant", restaurantSchema);


