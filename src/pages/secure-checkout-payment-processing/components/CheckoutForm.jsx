import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, CreditCard } from 'lucide-react';
import Button from '../../../components/ui/Button';

export default function CheckoutForm({ clientSecret, amount, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setMessage(null);

    try {
      const { error, paymentIntent } = await stripe?.confirmPayment({
        elements,
        redirect: 'if_required'
      });

      if (error) {
        setMessage(error?.message);
        onError?.(error);
      } else if (paymentIntent && paymentIntent?.status === 'succeeded') {
        onSuccess?.(paymentIntent);
      }
    } catch (err) {
      setMessage('An unexpected error occurred.');
      onError?.(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-cyan-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Payment Information</h3>
            <p className="text-gray-400 text-sm">Secure payment powered by Stripe</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <Lock className="h-4 w-4 text-green-500" />
          <p className="text-green-500 text-sm">Your payment information is encrypted and secure</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <PaymentElement
            options={{
              layout: 'tabs',
              defaultValues: {
                billingDetails: {
                  email: ''
                }
              }
            }}
          />
        </div>

        {message && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-500 text-sm">{message}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={!stripe || processing}
          className="w-full bg-cyan-500 text-black hover:bg-cyan-400 font-bold py-3"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
              Processing Payment...
            </span>
          ) : (
            `Pay $${amount?.toFixed(2)}`
          )}
        </Button>

        <p className="text-gray-500 text-xs text-center mt-4">
          By completing this purchase, you agree to the licensing terms and conditions
        </p>
      </form>
    </div>
  );
}