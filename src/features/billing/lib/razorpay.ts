// lib/razorpay.ts
import Razorpay from 'razorpay';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error(
    'Missing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET environment variables.'
  );
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Public key is safe to expose to the browser; key_secret never leaves the server.
export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
