import { getUncachableStripeClient } from '../server/stripeClient';

async function createProducts() {
  const stripe = await getUncachableStripeClient();

  // Check if product already exists
  const existingProducts = await stripe.products.search({ 
    query: "name:'Spanish for Nurses Premium'" 
  });

  if (existingProducts.data.length > 0) {
    console.log('Product already exists:', existingProducts.data[0].id);
    const prices = await stripe.prices.list({ product: existingProducts.data[0].id });
    console.log('Existing prices:', prices.data.map(p => ({ id: p.id, amount: p.unit_amount })));
    return;
  }

  // Create the subscription product
  const product = await stripe.products.create({
    name: 'Spanish for Nurses Premium',
    description: 'Full access to all 15 medical Spanish vocabulary modules with spaced repetition learning',
    metadata: {
      type: 'subscription',
      modules: '15',
    }
  });

  console.log('Created product:', product.id);

  // Create monthly price - $5/month
  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 500, // $5.00 in cents
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: {
      plan: 'monthly',
    }
  });

  console.log('Created monthly price:', monthlyPrice.id, '- $5.00/month');

  console.log('\n✅ Stripe products created successfully!');
  console.log('Product ID:', product.id);
  console.log('Monthly Price ID:', monthlyPrice.id);
}

createProducts().catch(console.error);
