import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const products = await stripe.products.list({ active: true });
    const prices = await stripe.prices.list({ active: true });

    const productsWithPrices = products.data.map(product => {
      const productPrices = prices.data.filter(
        price => price.product === product.id
      );
      return {
        product_id: product.id,
        product_name: product.name,
        product_description: product.description,
        prices: productPrices.map(price => ({
          price_id: price.id,
          unit_amount: price.unit_amount,
          currency: price.currency,
          recurring: price.recurring,
        })),
      };
    });

    return res.status(200).json({ data: productsWithPrices });
  } catch (error) {
    console.error('Error getting products:', error);
    return res.status(500).json({ error: 'Failed to get products' });
  }
}
