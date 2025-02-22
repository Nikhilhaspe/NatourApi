/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const signup = async (data) => {
  try {
    const res = await axios.post('/api/v1/users/signup', data);

    if (res.data.status === 'success') {
      showAlert(
        'success',
        'Account created successfully!, please wait redirecting...',
      );
      window.setTimeout(() => {
        location.assign('/');
      }, 2000);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
