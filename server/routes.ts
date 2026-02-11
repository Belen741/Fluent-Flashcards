import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { flashcardsData } from "../client/src/data/flashcards";
import { stripeService } from "./stripeService";
import { clerkAuth } from "./clerkAuth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.flashcards.list.path, async (req, res) => {
    const cards = await storage.getFlashcards();
    res.json(cards);
  });

  // Stripe routes
  app.get('/api/subscription', clerkAuth, async (req: any, res) => {
    try {
      const userId = req.clerkUser?.userId;
      const user = await stripeService.getUser(userId);
      if (!user?.stripeSubscriptionId) {
        return res.json({ subscription: null, status: null });
      }
      const subscription = await stripeService.getSubscriptionFromStripe(user.stripeSubscriptionId);
      res.json({ subscription, status: user.subscriptionStatus });
    } catch (error) {
      console.error('Error getting subscription:', error);
      res.status(500).json({ error: 'Failed to get subscription' });
    }
  });

  app.post('/api/checkout', clerkAuth, async (req: any, res) => {
    try {
      const userId = req.clerkUser?.userId;
      const userEmail = req.clerkUser?.email;
      const { priceId } = req.body;

      if (!priceId) {
        return res.status(400).json({ error: 'Price ID is required' });
      }

      let user = await stripeService.getUser(userId);
      let customerId = user?.stripeCustomerId;

      if (!customerId) {
        const customer = await stripeService.createCustomer(userEmail || '', userId);
        await stripeService.updateUserStripeInfo(userId, { stripeCustomerId: customer.id });
        customerId = customer.id;
      }

      const frontendUrl = req.headers.origin || 'https://www.spanish4nurses.com';

      const session = await stripeService.createCheckoutSession(
        customerId,
        priceId,
        `${frontendUrl}/checkout/success`,
        `${frontendUrl}/checkout/cancel`,
        userId
      );

      res.json({ url: session.url });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  });

  app.post('/api/customer-portal', clerkAuth, async (req: any, res) => {
    try {
      const userId = req.clerkUser?.userId;
      const user = await stripeService.getUser(userId);

      if (!user?.stripeCustomerId) {
        return res.status(400).json({ error: 'No Stripe customer found' });
      }

      const frontendUrl = req.headers.origin || 'https://www.spanish4nurses.com';
      const session = await stripeService.createCustomerPortalSession(
        user.stripeCustomerId,
        `${frontendUrl}/modules`
      );

      res.json({ url: session.url });
    } catch (error) {
      console.error('Error creating portal session:', error);
      res.status(500).json({ error: 'Failed to create portal session' });
    }
  });

  const cards = await storage.getFlashcards();
  if (cards.length === 0) {
    console.log(`Seeding flashcards with ${flashcardsData.length} cards from imported data...`);
    
    for (const card of flashcardsData) {
      const cardData = card as Record<string, unknown>;
      await storage.createFlashcard({
        text: card.text,
        englishText: card.englishText,
        imageUrl: card.imageUrl || "",
        audioUrl: card.audioUrl || "",
        conceptId: card.conceptId,
        variantType: card.variantType,
        category: card.category,
        deckId: card.deckId,
        tags: [...card.tags],
        imageKey: card.imageKey,
        audioKey: card.audioKey,
        clozeOptions: cardData.clozeOptions as string[] | undefined,
        clozeCorrect: cardData.clozeCorrect as string | undefined,
        mcqQuestionEs: cardData.mcqQuestionEs as string | undefined,
        mcqOptionsEn: cardData.mcqOptionsEn as string[] | undefined,
        mcqCorrectEn: cardData.mcqCorrectEn as string | undefined,
      });
    }

    console.log(`Seeding complete with ${flashcardsData.length} flashcards!`);
  }

  return httpServer;
}
