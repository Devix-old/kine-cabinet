# 💳 Payment Integration Setup Guide

## 🚀 Overview

This guide will help you set up the complete payment integration system for KineCabinet, supporting both Morocco and international markets with Stripe.

## 📋 Prerequisites

1. **Stripe Account**: Create a Stripe account at [stripe.com](https://stripe.com)
2. **Domain**: A production domain for webhooks
3. **SSL Certificate**: Required for production payments

## 🔧 Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kine_cabinet"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# Stripe Price IDs (Create these in your Stripe dashboard)
STRIPE_STARTER_PRICE_ID="price_your_starter_price_id_here"
STRIPE_PROFESSIONAL_PRICE_ID="price_your_professional_price_id_here"
STRIPE_ENTERPRISE_PRICE_ID="price_your_enterprise_price_id_here"

# Environment
NODE_ENV="development"
```

## 🎯 Stripe Dashboard Setup

### 1. Create Products and Prices

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** → **Add Product**
3. Create three products:

#### Starter Plan
- **Name**: KineCabinet Starter
- **Price**: €29/month
- **Billing**: Recurring
- **Currency**: EUR
- **Copy the Price ID** (starts with `price_`)

#### Professional Plan
- **Name**: KineCabinet Professional
- **Price**: €59/month
- **Billing**: Recurring
- **Currency**: EUR
- **Copy the Price ID**

#### Enterprise Plan
- **Name**: KineCabinet Enterprise
- **Price**: €99/month
- **Billing**: Recurring
- **Currency**: EUR
- **Copy the Price ID**

### 2. Configure Payment Methods

1. Go to **Settings** → **Payment methods**
2. Enable the following payment methods:

#### For Morocco (MA):
- ✅ Cards (Visa, Mastercard, etc.)
- ✅ Bank transfers
- ✅ Mobile money (if available)

#### For International:
- ✅ Cards
- ✅ SEPA Direct Debit (EU)
- ✅ iDEAL (Netherlands)
- ✅ Sofort (Germany)
- ✅ Bancontact (Belgium)
- ✅ Apple Pay
- ✅ Google Pay

### 3. Set Up Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL: `https://yourdomain.com/api/payments/webhook`
4. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `setup_intent.succeeded`
5. Copy the **Webhook signing secret** (starts with `whsec_`)

## 🗄️ Database Migration

Run the database migration to add payment tables:

```bash
# Generate and apply the migration
npx prisma db push

# Or if you prefer migrations
npx prisma migrate dev --name add_payment_integration
```

## 🧪 Testing the Integration

### 1. Test Cards

Use these Stripe test cards:

#### Successful Payments:
- **Visa**: `4242424242424242`
- **Mastercard**: `5555555555554444`
- **American Express**: `378282246310005`

#### Failed Payments:
- **Declined**: `4000000000000002`
- **Insufficient Funds**: `4000000000009995`
- **Expired Card**: `4000000000000069`

### 2. Test the Flow

1. Start your development server: `npm run dev`
2. Go to `/pricing`
3. Select a plan and enter test card details
4. Complete the payment flow
5. Check the success page and dashboard

## 🌍 Regional Configuration

### Morocco (MA)
- **Currency**: MAD (Moroccan Dirham)
- **Payment Methods**: Cards, Bank Transfer, Cash, Mobile Money
- **Localization**: French/Arabic

### International
- **Currency**: EUR (default), USD, GBP based on country
- **Payment Methods**: Cards, SEPA, local methods
- **Localization**: English/French

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use different keys for development and production
- Rotate keys regularly

### 2. Webhook Security
- Always verify webhook signatures
- Use HTTPS in production
- Monitor webhook failures

### 3. PCI Compliance
- Stripe handles PCI compliance
- Never store raw card data
- Use Stripe Elements for card input

## 📊 Monitoring & Analytics

### 1. Stripe Dashboard
- Monitor payments in real-time
- Set up alerts for failed payments
- Track subscription metrics

### 2. Application Logs
- Payment events are logged to console
- Set up error monitoring (Sentry, etc.)
- Monitor webhook delivery

## 🚀 Production Deployment

### 1. Environment Setup
```env
# Production environment variables
NODE_ENV="production"
STRIPE_SECRET_KEY="sk_live_your_live_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your_live_key"
STRIPE_WEBHOOK_SECRET="whsec_your_production_webhook_secret"
```

### 2. Webhook Configuration
- Update webhook URL to production domain
- Test webhook delivery
- Set up webhook monitoring

### 3. SSL Certificate
- Ensure HTTPS is enabled
- Valid SSL certificate required
- Redirect HTTP to HTTPS

## 🛠️ Troubleshooting

### Common Issues

1. **Payment Intent Creation Fails**
   - Check Stripe secret key
   - Verify amount format (cents)
   - Check currency support

2. **Webhook Not Receiving Events**
   - Verify webhook URL is accessible
   - Check webhook secret
   - Monitor webhook delivery in Stripe dashboard

3. **Card Payment Declined**
   - Use correct test card numbers
   - Check payment method configuration
   - Verify 3D Secure setup

### Debug Mode

Enable debug logging in development:

```javascript
// In src/lib/stripe.js
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
  // Enable debug logging
  logger: {
    error: console.error,
    warn: console.warn,
    debug: console.log
  }
})
```

## 📞 Support

For issues with:
- **Stripe Integration**: Check Stripe documentation
- **Application Code**: Review error logs
- **Database Issues**: Check Prisma migrations

## 🎉 Next Steps

After setup:
1. Test all payment flows
2. Set up monitoring and alerts
3. Configure email notifications
4. Implement subscription management UI
5. Add payment analytics dashboard

---

**Note**: This setup provides a production-ready payment system. Always test thoroughly in development before going live.
