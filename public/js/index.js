// login
import { login } from './login.js';
// mapbox
import displayMap from './mapbox.js';

// DOM
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');

// DELEGATIONS
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

// event listeners
if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}
