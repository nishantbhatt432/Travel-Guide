import axios from 'axios'; // Only import axios
import jwt from 'jsonwebtoken'; // Use ES6 import syntax for jwt
import { showAlert } from './alerts';
// import Razorpay from 'razorpay'; // Use ES6 import syntax for Razorpay

// Initialize Razorpay instance
// const razorpay = new Razorpay({
//     key: 'rzp_test_QK8ms3s7epOJmr',
//     key_secret: 'dvrvR2iT3OyXjb2TydQPUK1H'
// });

export const bookTour = async (tourId) => { 
    try {
        // Decode JWT token to extract user information
        // const decoded = jwt.verify(token, 'I-Have-to-secure-my-data-and-privacy');
        // const { name, email } = decoded; // Extract name and email from the decoded token
        // console.log(decoded);

        // 1) Get order details from API
        const response = await axios.get(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);
        console.log(response.data.order);

        const { orderId, amount, currency, receipt } = response.data.order;
        console.log({amount:amount});

        // 2) Redirect to Razorpay checkout
        const options = {
            key: 'rzp_test_QK8ms3s7epOJmr', // Use Razorpay key ID from environment variables
            amount: amount,
            currency: currency,
            name: 'Natours', // Replace with your company name
            description: 'Tour Booking',
            order_id: orderId,
            handler: async function (response) {
                // Handle success payment response here
                console.log(response);
                showAlert('success', 'Payment successful!');
                // You can perform additional actions here after successful payment, like redirecting to a thank you page, etc.
                await axios.post('/api/v1/bookings', {
                    tour: tourId,
                    user: '65dc67ef8279923b94261e6f', // Replace 'user_id' with actual user ID
                    price: amount // Assuming amount is the price of the tour
                });
            },
            prefill: {
                name: 'Rishi', // Include user's name
                email: 'Rishidubey@gmail.com', // Include user's email
            },
            theme: {
                color: '#3399cc' // Customize the color of Razorpay checkout form
            }
        };

        // Instead of creating a new Razorpay instance, redirect the user to Razorpay checkout page
        const rzp = new Razorpay(options);
        rzp.open();

    } catch (err) {
        console.error(err);
        showAlert('error', err.message);
    }
};
