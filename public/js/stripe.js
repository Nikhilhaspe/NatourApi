import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51QuGKNQpWrgvFjxLKwCGAUN7M6u2ln1rxTQlQ2A9rdYeds9i8H10rvxyGPejjQ4atCFgVeXTuwpgF0S3iOnJ4FdH0068lGqsPL',
);

export const bookTour = async (tourId) => {
  try {
    // 1. get the session
    const session = await axios.get(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`,
    );

    // 2. create checkout form + charge credit card
    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
