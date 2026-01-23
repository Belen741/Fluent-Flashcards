import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { createClient } from '@supabase/supabase-js';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const sessionToken = authHeader.replace('Bearer ', '');
    
    const payload = await verifyToken(sessionToken, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    
    const userId = payload.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const clerkUser = await clerk.users.getUser(userId);

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: dbUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError);
    }

    if (!dbUser) {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          first_name: clerkUser.firstName,
          last_name: clerkUser.lastName,
          profile_image_url: clerkUser.imageUrl,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user:', insertError);
        return res.status(500).json({ error: 'Failed to create user' });
      }

      return res.status(200).json({
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        profileImageUrl: newUser.profile_image_url,
        stripeCustomerId: newUser.stripe_customer_id,
        stripeSubscriptionId: newUser.stripe_subscription_id,
        subscriptionStatus: newUser.subscription_status,
      });
    }

    return res.status(200).json({
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      profileImageUrl: dbUser.profile_image_url,
      stripeCustomerId: dbUser.stripe_customer_id,
      stripeSubscriptionId: dbUser.stripe_subscription_id,
      subscriptionStatus: dbUser.subscription_status,
    });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
