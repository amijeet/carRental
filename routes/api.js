const express = require("express");
const { findOne } = require("../models/car");
const router = express.Router();
const Car = require("../models/car");
const Booking = require("../models/booking");
const res = require("express/lib/response");

// get all the cars that are avilable with their dates booked
router.get("/getCars", function (req, res, next) {
    Car.find({}).then(function (car) {
        res.send(car);
    });
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
router.delete("/cancelReservation/:bookingID", function (req, res, next) {
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

// generateFine api generates fine and gives it to the user
router.get("/generateFine/:bookingID/:currDate", function (req, res, next) {
    var currDate,
        returnDate,
        fine,
        totalFine = 0;
    Booking.findOne({ _id: req.params.bookingID }).then(function (booking) {
        Car.findOne({ _id: booking.carID }).then(function (car) {
            currDate = Date.parse(req.params.currDate) / 1000 / 3600 / 24;
            returnDate = Date.parse(booking.bookingDates[1]) / 1000 / 3600 / 24;
            fine = car.fine;
            if (currDate > returnDate) {
                totalFine = fine * (currDate - returnDate);
            }
            console.log(totalFine);
            // res.send(totalFine);
        });
        console.log("totalFine is " + totalFine);
        // res.send(totalFine);
    });
});

module.exports = router;
