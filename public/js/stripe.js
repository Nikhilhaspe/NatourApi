/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51QuGKNQpWrgvFjxLKwCGAUN7M6u2ln1rxTQlQ2A9rdYeds9i8H10rvxyGPejjQ4atCFgVeXTuwpgF0S3iOnJ4FdH0068lGqsPL',
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
