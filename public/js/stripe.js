const stripe = Stripe('pk_test_51LWe2YFbTeanWxDimFQ2XqoeiBxTifOfoRiFM2FLMLJH9EY3JaL9YDojljebRVZwK5P8hwHwcTcidhLl7pKntO9f00R9Ikzy79');
import {showAlert} from './alerts.js'

export const bookTour = async tourId => {
  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    //redirectToCheckout is deprecated so that booking feature is broken
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    })
  } catch (err) {
    showAlert('error', err.message);
  }
}