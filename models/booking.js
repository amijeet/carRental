const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create the bookings schema
const bookingSchema = new Schema({
    carID: {
        type: String,
        required: [true, "carID is required"],
    },
    bookingDates: {
        type: Array,
        required: [true, "booking dates are required"],
    },
});
const Booking = mongoose.model("booking", bookingSchema);
module.exports = Booking;
