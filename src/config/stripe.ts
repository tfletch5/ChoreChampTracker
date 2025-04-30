import { initStripe } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';

const stripePublishableKey = Constants.expoConfig?.extra?.stripePublishableKey || process.env.STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn("Missing Stripe publishable key. Payment functionality will be disabled.");
}

// Initialize Stripe
export const initializeStripe = async () => {
  if (stripePublishableKey) {
    await initStripe({
      publishableKey: stripePublishableKey,
      merchantIdentifier: 'merchant.com.chorechamp',
      urlScheme: 'chorechamp://',
    });
  }
};

export default {
  publishableKey: stripePublishableKey,
};
