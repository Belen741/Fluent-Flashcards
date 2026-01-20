import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { flashcardsData } from "../client/src/data/flashcards";
import { stripeService } from "./stripeService";
import { isAuthenticated } from "./replit_integrations/auth";
import { getStripePublishableKey } from "./stripeClient";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.flashcards.list.path, async (req, res) => {
    const cards = await storage.getFlashcards();
    res.json(cards);
  });

  // Stripe routes
  app.get('/api/stripe/publishable-key', async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get Stripe key' });
    }
  });

  app.get('/api/subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await stripeService.getUser(userId);
      if (!user?.stripeSubscriptionId) {
        return res.json({ subscription: null, status: null });
      }
      const subscription = await stripeService.getSubscription(user.stripeSubscriptionId);
      res.json({ subscription, status: user.subscriptionStatus });
    } catch (error) {
      console.error('Error getting subscription:', error);
      res.status(500).json({ error: 'Failed to get subscription' });
    }
  });

  app.post('/api/checkout', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userEmail = req.user.claims.email;
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

      const session = await stripeService.createCheckoutSession(
        customerId,
        priceId,
        `${req.protocol}://${req.get('host')}/checkout/success`,
        `${req.protocol}://${req.get('host')}/checkout/cancel`
      );

      res.json({ url: session.url });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  });

  app.post('/api/customer-portal', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await stripeService.getUser(userId);

      if (!user?.stripeCustomerId) {
        return res.status(400).json({ error: 'No Stripe customer found' });
      }

      const session = await stripeService.createCustomerPortalSession(
        user.stripeCustomerId,
        `${req.protocol}://${req.get('host')}/modules`
      );

      res.json({ url: session.url });
    } catch (error) {
      console.error('Error creating portal session:', error);
      res.status(500).json({ error: 'Failed to create portal session' });
    }
  });

  app.get('/api/products', async (req, res) => {
    try {
      const products = await stripeService.getProductsWithPrices();
      res.json({ data: products });
    } catch (error) {
      console.error('Error getting products:', error);
      res.status(500).json({ error: 'Failed to get products' });
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
