import axios from 'axios';
import { showAlert } from './alerts';

export const signup = async (name, email, password,passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm
      }
    });
    // Log the full response object
    console.log('Full response:', res);
    // Log the response data specifically
    console.log('Response data:', res.data);

    // Check the status and log it
    console.log('Response status:', res.data.status);
    if (res.data.status === 'success') {
      showAlert('success', 'Signed up successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
