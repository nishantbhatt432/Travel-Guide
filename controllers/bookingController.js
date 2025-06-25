const Razorpay = require('razorpay');
const Tour = require('../models/tourModels');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory=require('./handleFactory');

// Initialize Razorpay with your key and secret
const razorpay = new Razorpay({
  key_id: 'rzp_test_QK8ms3s7epOJmr',
  key_secret: 'dvrvR2iT3OyXjb2TydQPUK1H'
});

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  // console.log(req.headers);
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create Razorpay order
  const amountInPaise = tour.price * 100; // Razorpay requires amount in paise
  const options = {
    amount: amountInPaise,
    currency: 'INR', // Update currency based on your requirements
    receipt: `tour_${tour._id}`, // Unique receipt ID
    payment_capture: 1 // Auto capture payment
  };
  
  // Create Razorpay order
  const order = await razorpay.orders.create(options);

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    order // Return the order details to client
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour || !user || !price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing parameters: tour, user, or price'
    });
  }

  try {
    await Booking.create({ tour, user, price });

    res.status(200).json({
      status: 'success',
      message: 'Booking created successfully'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

