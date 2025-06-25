const Tour = require('../models/tourModels');
const User = require('../models/userModels');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('../models/bookingModel');


exports.getOverview = catchAsync(async (req, res, next) => {
    // 1) Get tour data from collection
    const tours = await Tour.find();
  
    // 2) Build template
    // 3) Render that template using tour data from 1)
    res.status(200).render('overview', {
      title: 'All Tours',
      tours
    });
  });
  
  exports.getTour = catchAsync(async (req, res, next) => {
    // Retrieve the tour using the slug parameter
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });
    
    // Check if the user is authenticated and if the tour is booked for the user
    let isBooked = 0;
    let tourDate = null;
    // console.log({re:req.user.id})
    if (req.user) {
        // If the user is authenticated, attempt to find the booking
        const booking = await Booking.findOne({ user: req.user.id, tour: tour.id });
        // console.log(booking)
        if (booking) {
            // If the booking exists, set isBooked to 1 and retrieve the tour date
            isBooked = 1;
            tourDate = booking.date;
        }
    }

    console.log(isBooked);

    // If the tour doesn't exist, return an error
    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
    }

    // Render the tour page with the retrieved data
    res.status(200).render('tour', {
        status: 'success',
        title: tour.name,
        isBooked,
        tourDate,
        tour
    });
});


  exports.getLogin=(req,res)=>{
        res.status(200).render('login',{
            title: 'Log into your account'
        });
  }

  exports.getSignup=(req,res)=>{
    res.status(200).render('signup',{
        title: 'Create your account'
    });
}

  exports.getAccount=(req,res)=>{
    res.status(200).render('account',{
      title: 'Your account'
  });
  }

  exports.getMyTours = catchAsync(async (req, res, next) => {
    // 1) Find all bookings
    const bookings = await Booking.find({ user: req.user.id });
  
    // 2) Find tours with the returned IDs
    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });
  
    res.status(200).render('overview', {
      title: 'My Tours',
      tours
    });
  });

  exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email
      },
      {
        new: true,
        runValidators: true
      }
    );
  
    res.status(200).render('account', {
      title: 'Your account',
      user: updatedUser
    });
  });