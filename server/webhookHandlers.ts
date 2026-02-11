import { getStripeClient } from './stripeClient';
import { stripeService } from './stripeService';
import Stripe from 'stripe';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    const stripe = getStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    console.log(`Received webhook ${event.id}: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId || session.client_reference_id;
        if (userId && session.subscription) {
          await stripeService.updateUserStripeInfo(userId, {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            subscriptionStatus: 'active',
          });
          console.log(`Subscription activated for user ${userId}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const { db } = await import('./db');
        const { users } = await import('@shared/schema');
        const { eq } = await import('drizzle-orm');
        const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));
        if (user) {
          await stripeService.updateUserStripeInfo(user.id, {
            subscriptionStatus: subscription.status,
          });
          console.log(`Subscription ${subscription.status} for user ${user.id}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const { db } = await import('./db');
        const { users } = await import('@shared/schema');
        const { eq } = await import('drizzle-orm');
        const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));
        if (user) {
          await stripeService.updateUserStripeInfo(user.id, {
            subscriptionStatus: 'canceled',
          });
          console.log(`Subscription canceled for user ${user.id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${event.type}`);
    }
  }
}
