// alerts
import { showAlert } from './alerts.js';

import axios from 'axios';
import '@babel/polyfill';

// login api call
export const login = async (email, password) => {
  try {
    console.log(email, password);

    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login/',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');

      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
