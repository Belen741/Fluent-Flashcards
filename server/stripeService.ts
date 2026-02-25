import { getStripeClient } from './stripeClient';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export class StripeService {
  async createCustomer(email: string, userId: string) {
    const stripe = getStripeClient();
    return await stripe.customers.create({
      email,
      metadata: { userId },
    });
  }

  async createCheckoutSession(customerId: string, priceId: string, successUrl: string, cancelUrl: string, userId?: string) {
    const stripe = getStripeClient();
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: userId ? { userId } : undefined,
      client_reference_id: userId,
    });
  }

  async createCustomerPortalSession(customerId: string, returnUrl: string) {
    const stripe = getStripeClient();
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  async getUser(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user;
  }

  async getOrCreateUser(userId: string, email?: string) {
    let [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      [user] = await db.insert(users).values({
        id: userId,
        email: email || null,
      }).returning();
    }
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeInfo: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStatus?: string;
  }) {
    let [user] = await db
      .update(users)
      .set({ ...stripeInfo, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      [user] = await db.insert(users).values({
        id: userId,
        ...stripeInfo,
      }).returning();
    }
    return user;
  }

  async getSubscriptionFromStripe(subscriptionId: string) {
    const stripe = getStripeClient();
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error retrieving subscription from Stripe:', error);
      return null;
    }
  }

  async getActiveSubscriptionByCustomer(customerId: string) {
    const stripe = getStripeClient();
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });
      return subscriptions.data[0] || null;
    } catch (error) {
      console.error('Error fetching subscriptions from Stripe:', error);
      return null;
    }
  }
}

export const stripeService = new StripeService();
