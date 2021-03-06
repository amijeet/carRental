const express = require("express");
const { findOne } = require("../models/car");
const router = express.Router();
const Car = require("../models/car");
const Booking = require("../models/booking");
const res = require("express/lib/response");
const mongoose = require("mongoose");

// get all the cars that are avilable with their dates booked
router.get("/getCars", function (req, res, next) {
    Car.find({})
        .then(function (car) {
            res.send(car);
        })
        .catch(next);
});

// add a car to the database
router.post("/addCar", function (req, res, next) {
    Car.create(req.body)
        .then(function (car) {
            res.send(car);
        })
        .catch(next);
});

// delete a car from the database using the id
router.delete("/deleteCar/:id", function (req, res, next) {
    Car.findByIdAndDelete(req.params.id, {}).then(function (car) {
        res.send(car);
    });
});

// ALL THE APIs THAT ARE REQUIRED

// book a car from the database using the name. It would return just one available car in the date requested
router.get("/bookCar/:carName/:startDate/:endDate", function (req, res, next) {
    Car.find({ name: req.params.carName })
        .then(function (cars) {
            let send = false;
            cars.forEach((car) => {
                let flag = true;
                for (i = 0; i < car.datesBooked.length; i += 2) {
                    let from = Date.parse(car.datesBooked[i]);
                    let till = Date.parse(car.datesBooked[i + 1]);
                    let startDate = Date.parse(req.params.startDate);
                    let endDate = Date.parse(req.params.endDate);
                    if ((startDate >= from && startDate <= till) || (endDate >= from && endDate <= till)) {
                        flag = false;
                        break;
                    }
                }
                if (flag) {
                    send = true;
                    res.send(car);
                }
            });
            if (send == false) {
                res.send("No cars available on the required dates.");
            }
        })
        .catch(next);
});

// *correct* add newly booked dates in the array for datesBooked in the car db and add booking to the bookings db
router.put("/reserveCar/:id/:startDate/:endDate", function (req, res, next) {
    Car.updateOne({ _id: req.params.id }, { $push: { datesBooked: { from: req.params.startDate, to: req.params.endDate } } }).then(function (car) {
        var newbooking = {
            carID: req.params.id,
            bookingDates: [req.params.startDate, req.params.endDate],
        };
        Booking.create(newbooking).then(function (booking) {
            res.send("Booking comfirmed!" + "\n" + "Your car has been booked from " + booking.bookingDates[0] + " to " + booking.bookingDates[1] + ", and your booking ID is " + booking._id);
        });
    });
});

// cancel a reservation
router.delete("/returnCar/:bookingID", function (req, res, next) {
    Booking.findOneAndRemove({ _id: req.params.bookingID }).then(function (booking) {
        var varBooking = booking.bookingDates;
        Car.updateOne(
            { _id: booking.carID },
            {
                $pull: {
                    datesBooked: { from: varBooking[0], to: varBooking[1] },
                },
            }
        ).then(function (car) {
            res.send(car);
        });
    });
});

router.get("/generateFine/:bookingID/:currDate", async function (req, res, next) {
    const currDate = new Date(req.params.currDate);
    const [{ totalFine }] = await Booking.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(req.params.bookingID) } },
        {
            $lookup: {
                from: "cars", // or from: Car.collection.name
                let: { carId: { $toObjectId: "$carID" } }, // convert the carID string field to ObjectId for the match to work correctly
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$_id", "$$carId"] },
                        },
                    },
                ],
                as: "car",
            },
        },
        {
            $addFields: {
                car: { $arrayElemAt: ["$car", 0] }, // get the car document from the array returned above
                returnDate: {
                    $toDate: { $arrayElemAt: ["$bookingDates", 1] },
                },
            },
        },
        // compute the overdue days
        {
            $addFields: {
                overdueDays: {
                    $trunc: {
                        $ceil: {
                            $abs: {
                                $sum: {
                                    $divide: [{ $subtract: [currDate, "$returnDate"] }, 60 * 1000 * 60 * 24],
                                },
                            },
                        },
                    },
                },
            },
        },
        {
            $project: {
                // project a new field
                totalFine: {
                    $cond: [
                        { $gt: [currDate, "$returnDate"] }, // IF current date is greater than return date
                        { $multiply: ["$car.fine", "$overdueDays"] }, // THEN multiply car fine with the overdue days
                        0, // ELSE total fine is 0
                    ],
                },
            },
        },
    ]).exec();

    res.send({ totalFine: totalFine });
});

module.exports = router;
