import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '@clerk/backend';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

async function verifyAuth(req: VercelRequest): Promise<string | null> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const sessionToken = authHeader.replace('Bearer ', '');
    const payload = await verifyToken(sessionToken, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    return payload.sub || null;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = await verifyAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: user, error } = await supabase
      .from('users')
      .select('stripe_subscription_id, subscription_status')
      .eq('id', userId)
      .single();

    if (error || !user?.stripe_subscription_id) {
      return res.status(200).json({ subscription: null, status: null });
    }

    const subscription = await stripe.subscriptions.retrieve(user.stripe_subscription_id);
    
    return res.status(200).json({ 
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: (subscription as any).current_period_end,
      }, 
      status: user.subscription_status 
    });
  } catch (error) {
    console.error('Error getting subscription:', error);
    return res.status(500).json({ error: 'Failed to get subscription' });
  }
}
