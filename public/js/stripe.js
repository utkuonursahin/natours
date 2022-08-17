const stripe = Stripe('pk_test_51LWe2YFbTeanWxDimFQ2XqoeiBxTifOfoRiFM2FLMLJH9EY3JaL9YDojljebRVZwK5P8hwHwcTcidhLl7pKntO9f00R9Ikzy79');
import {showAlert} from './alerts.js'

export const bookTour = async tourId => {
  try {
    const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    })
  } catch (err) {
    showAlert('error', err.message);
  }
}