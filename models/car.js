const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create the car schema
const carSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name field is required"],
    },
    rate: {
        type: Number,
        required: [true, "Rate field is required"],
    },
    fine: {
        type: Number,
        required: [true, "Rate field is required"],
    },
    // this is a 2d array, each element of this array has 2 dates particularly startDate and endDate
    datesBooked: {
        type: Array,
        default: [],
    },
});
const Car = mongoose.model("car", carSchema);
module.exports = Car;
