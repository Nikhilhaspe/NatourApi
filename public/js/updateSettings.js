import axios from 'axios';
import '@babel/polyfill';

// alerts
import { showAlert } from './alerts';

// type is either 'password' or 'data'
export async function updateSettings(data, type) {
  try {
    const urlFill = type == 'password' ? 'updatePassword' : 'updateMe';

    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/${urlFill}`,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `User ${type.toUpperCase()} updated successfully!`);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
}
