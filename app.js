const path=require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit=require('express-rate-limit');
const helmet=require('helmet');
const mongoSanitize=require('express-mongo-sanitize');
const xss=require('xss-clean');
const hpp=require('hpp');
const cookieParser=require('cookie-parser');

const tourRouter = require('./routes/tourRouters');
const userRouter = require('./routes/userRouters');
const appError=require('./utils/appError');
const globalErrorHandler=require('./controllers/errorController');
const reviewRouter=require('./routes/reviewRouters');
const bookingRouter=require('./routes/bookingRoutes');
const viewsRouter=require('./routes/viewsRouters');
const cors = require('cors');

// start express here
const app = express();

app.use(cors());
app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));

app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());

//Security http header middleware

const scriptSrcUrls = ['https://unpkg.com/', 'https://tile.openstreetmap.org'];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/'
];
const connectSrcUrls = ['https://unpkg.com', 'https://tile.openstreetmap.org', 'https://api.razorpay.com','http://localhost:3000','http://127.0.0.1:3000','ws://localhost:63609'];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];
 
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls, "'unsafe-inline'", 'http://checkout.razorpay.com/v1/checkout.js'],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      fontSrc: ["'self'", ...fontSrcUrls],
      frameSrc: ["'self'", 'https://api.razorpay.com']
    }
  })
);
//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// rate limiting middleware
const limiter=rateLimit({
  max:100,
  windowMs:60*60*1000,
  message:'Too many request from this Ip,Please try again in an hour!'
});

app.use('/api',limiter);
//body parser
app.use(express.json());
app.use(express.urlencoded({extended:true,limit:'10kb'}));
app.use(cookieParser());
//DATA SANITIZATION AGAINST NOSQL QUERY INJECTION
app.use(mongoSanitize());
//DATA SANITIZATION AGAINST XSS
app.use(xss());
//prevent parameter pollution
app.use(hpp({
  whitelist:['duration',
'ratingsAverage',
'ratingsQuantity',
'maxGroupSize',
'difficulty',
'price'
]
})
);

app.use('/',viewsRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews',reviewRouter);
app.use('/api/v1/bookings',bookingRouter);
const PORT = 8080;

// Proxy route
app.get('/api/orders', async (req, res) => {
  try {
    const response = await axios.get('https://api.razorpay.com/v1/orders');
    res.json(response.data);
  } catch (error) {
    res.status(error.response.status).json(error.response.data);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.all('*',(req,res,next)=>{
  
  next(new appError(`Can't find ${req.originalUrl} on this Server!`,404));
});

app.use(globalErrorHandler);

module.exports = app;
