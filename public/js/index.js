/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './leaflet';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './razorpay';
import { signup } from './signup';
import { createReview } from '../js/review';


// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const reviewBtn = document.querySelector('.btn--review');
const reviewSave = document.getElementById('review-save');
const closeReview = document.querySelector('.close');
const reviewtour = document.getElementById('review-tour');

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
} 

if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

  if (signupForm) {
    signupForm.addEventListener('submit', async e => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('passwordConfirm').value; // Extract the value from passwordConfirm field
      await signup(name, email, password, passwordConfirm); // Await the signup function since it's asynchronous
    });
  }
   

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form= new FormData();
    form.append('name' , document.getElementById('name').value);
    form.append('email' ,document.getElementById('email').value);
    form.append('photo',document.getElementById('photo').files[0]);
    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

  if (bookBtn) {
    bookBtn.addEventListener('click', e => {
        const tourId = e.target.getAttribute('data-tour-id'); // Get the tour ID from data-tour-id attribute
        e.target.textContent = 'Processing...'; // Change button text to indicate processing
        // Call the bookTour function with the extracted tour ID
        
        bookTour(tourId);
    });
}

// if (reviewtour) {
//   reviewtour.addEventListener('click', openForm);
// }

// if (reviewBtn) {
//   reviewBtn.addEventListener('click', () => {
//       document.querySelector('.bg-modal').style.display = "flex";
//   });
// }

document.addEventListener("DOMContentLoaded", function() {
  const reviewtour = document.getElementById("review-tour");
  const modal = document.querySelector(".bg-modal");

  if (reviewtour && modal) {
      reviewtour.addEventListener("click", function() {
          modal.style.display = "flex";
      });

      const closeModalButton = document.querySelector(".close");
      if (closeModalButton) {
          closeModalButton.addEventListener("click", function() {
              modal.style.display = "none";
          });
      }
  }
});


if (closeReview) {
  closeReview.addEventListener("click", () => {
      document.querySelector('.bg-modal').style.display = "none";
  });
}

if (reviewSave) {
  reviewSave.addEventListener("click", async e => {
      const review = document.getElementById('review').value;
      const rating = document.getElementById('ratings').value;
      const { tourId } = e.target.dataset;
      await createReview(tourId, review, rating);
      document.querySelector('.bg-modal').style.display = "none";
  });
}