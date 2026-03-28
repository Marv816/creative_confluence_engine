# Stripe Integration Setup

## Environment Variables Required

Add your Stripe publishable key to `.env`:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

## Stripe Account Setup

1. **Create Stripe Account**: Sign up at https://stripe.com
2. **Get API Keys**: Navigate to Developers → API keys
3. **Copy Publishable Key**: Use the test mode publishable key (starts with `pk_test_`)
4. **Add to .env**: Replace the placeholder value in your `.env` file

## Payment Processing

The application uses Stripe Elements for secure payment processing:
- **Checkout Flow**: Multi-step checkout with license selection
- **Payment Methods**: Credit cards, digital wallets (Apple Pay, Google Pay)
- **Security**: PCI-compliant payment processing
- **Escrow System**: 7-day fund holding for transaction security

## Producer Payouts

For production use, you'll need to:
1. **Set up Stripe Connect**: Enable producer payouts
2. **Configure Webhooks**: Handle payment events
3. **Create Edge Function**: Server-side payment intent creation

## Testing

Use Stripe test cards:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

Any future expiry date and any 3-digit CVC will work.

## Production Checklist

- [ ] Replace test keys with live keys
- [ ] Enable Stripe Connect for payouts
- [ ] Set up webhook endpoints
- [ ] Implement server-side payment processing
- [ ] Configure payout schedules
- [ ] Test complete payment flow

## Support

For Stripe integration help:
- Documentation: https://stripe.com/docs
- Support: https://support.stripe.com