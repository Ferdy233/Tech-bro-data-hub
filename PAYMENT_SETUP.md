# Payment Integration Setup Guide

This guide will help you set up the Paystack payment integration for Tech Bro Hub.

## Prerequisites

1. **Paystack Account**: Sign up at [paystack.com](https://paystack.com)
2. **Node.js and npm**: Ensure you have Node.js installed
3. **MongoDB**: Set up MongoDB database

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/tech-bro-hub

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key

# Email Configuration (for nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Getting Paystack Keys

1. **Login to Paystack Dashboard**
   - Go to [dashboard.paystack.com](https://dashboard.paystack.com)
   - Login with your account

2. **Get Test Keys**
   - Navigate to Settings > API Keys & Webhooks
   - Copy your Test Secret Key (starts with `sk_test_`)
   - Copy your Test Public Key (starts with `pk_test_`)

3. **Get Live Keys** (for production)
   - Switch to Live mode in the dashboard
   - Copy your Live Secret Key (starts with `sk_live_`)
   - Copy your Live Public Key (starts with `pk_live_`)

## Webhook Configuration

1. **Set up Webhook URL**
   - In Paystack Dashboard, go to Settings > Webhooks
   - Add webhook URL: `https://yourdomain.com/api/webhooks/paystack`
   - Select events: `charge.success`, `charge.failed`, `transfer.success`, `transfer.failed`

2. **For Development**
   - Use ngrok or similar tool to expose your local server
   - Webhook URL: `https://your-ngrok-url.ngrok.io/api/webhooks/paystack`

## Features Implemented

### API Endpoints

1. **Payment Initialization** - `/api/payments/initialize`
   - Initializes payment with Paystack
   - Returns authorization URL for payment

2. **Payment Verification** - `/api/payments/verify`
   - Verifies payment status with Paystack
   - Updates user wallet balance

3. **Webhook Handler** - `/api/webhooks/paystack`
   - Handles Paystack webhook events
   - Automatically processes successful/failed payments

4. **Wallet Balance** - `/api/wallet/balance`
   - Returns user's wallet balance and transaction history

5. **Wallet Load** - `/api/wallet/load` (Admin only)
   - Allows admins to manually add funds to user wallets

### Frontend Pages

1. **Dashboard Integration** - `/dashboard`
   - Wallet balance display
   - Add funds functionality
   - Payment status notifications
   - Transaction history
   - Automatic payment verification

### User Model Updates

- Added `walletBalance` field
- Added `transactions` array for payment history
- Support for transaction metadata

## Testing the Integration

1. **Start the Development Server**
   ```bash
   npm run dev
   ```

2. **Navigate to Dashboard**
   - Go to `http://localhost:3000/dashboard`
   - Click the "+" button on the wallet balance card
   - Enter an amount (minimum 1 GHS)
   - Click "Pay Now"

3. **Test Payment Flow**
   - You'll be redirected to Paystack test payment page
   - Use test card numbers (provided by Paystack)
   - Complete the payment
   - You'll be redirected back to dashboard with updated balance

## Test Card Numbers

Paystack provides test card numbers for testing:

- **Successful Payment**: 4084084084084081
- **Failed Payment**: 4084084084084085
- **Insufficient Funds**: 4084084084084082

Use any future expiry date and any 3-digit CVV.

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Webhook Verification**: Always verify webhook signatures
3. **HTTPS**: Use HTTPS in production
4. **Secret Keys**: Keep your secret keys secure and never expose them

## Production Deployment

1. **Update Environment Variables**
   - Use live Paystack keys
   - Update webhook URLs to production domain
   - Set secure `NEXTAUTH_SECRET`

2. **Database**
   - Use production MongoDB instance
   - Ensure proper backup and security

3. **Monitoring**
   - Set up logging for payment events
   - Monitor webhook delivery
   - Track failed payments

## Troubleshooting

### Common Issues

1. **Webhook Not Working**
   - Check webhook URL is accessible
   - Verify webhook signature validation
   - Check server logs for errors

2. **Payment Initialization Fails**
   - Verify Paystack secret key
   - Check user email exists in database
   - Ensure minimum amount requirements

3. **Payment Verification Fails**
   - Check reference parameter
   - Verify Paystack API connectivity
   - Check database connection

### Debug Mode

Enable debug logging by adding to your environment:
```env
DEBUG=paystack:*
```

## Support

For issues with:
- **Paystack Integration**: Check [Paystack Documentation](https://paystack.com/docs)
- **Tech Bro Hub**: Check the project repository or contact support

## Next Steps

1. **Add More Payment Methods**: Integrate additional payment providers
2. **Subscription Payments**: Add recurring payment support
3. **Payout System**: Add ability to withdraw funds
4. **Analytics**: Add payment analytics and reporting
5. **Mobile Money**: Add specific mobile money integrations
