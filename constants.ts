
import { Product, CategoryType, TechTag, DeliveryMethod } from './types';

// Fixing Product objects to align with the Product interface and CategoryType/TechTag enums.
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Uber-Like N8N Workflow',
    description: 'Complete automation for ride-sharing dispatch logic.',
    fullDescription: 'This comprehensive n8n workflow handles driver dispatch, rider matching, and automated fare calculation using Google Maps API. Perfect for startups building on-demand services.',
    price: 49.99,
    categories: ['cat-ai'],
    rootType: CategoryType.AI_AUTOMATION,
    techTag: TechTag.N8N,
    imageUrl: 'https://picsum.photos/seed/n8n/600/400',
    features: ['Real-time matching', 'Google Maps integration', 'Webhook ready'],
    deliveryMethod: DeliveryMethod.FILE,
    deliveryContent: 'https://example.com/download/n8n-uber.json',
    isPublished: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'SaaS Landing Page Template',
    description: 'Clean, conversion-optimized React + Tailwind CSS template.',
    fullDescription: 'A production-ready landing page template featuring responsive design, dark mode, and pre-built components for testimonials, pricing, and FAQs.',
    price: 19.99,
    categories: ['cat-soft'],
    rootType: CategoryType.SOFTWARE,
    techTag: TechTag.REACT,
    imageUrl: 'https://picsum.photos/seed/saas/600/400',
    features: ['Dark Mode', 'Mobile First', 'SEO Optimized'],
    deliveryMethod: DeliveryMethod.LINK,
    deliveryContent: 'https://github.com/autoflow/saas-template',
    isPublished: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Zapier Lead Gen Engine',
    description: 'Multi-step Zapier workflow to capture and nurture leads.',
    fullDescription: 'Connects your Facebook Ads, LinkedIn, and CRM to automatically score and distribute leads to your sales team within seconds.',
    price: 29.50,
    categories: ['cat-ai'],
    rootType: CategoryType.AI_AUTOMATION,
    techTag: TechTag.ZAPIER,
    imageUrl: 'https://picsum.photos/seed/zapier/600/400',
    features: ['Lead Scoring', 'Email Nurturing', 'Slack Alerts'],
    deliveryMethod: DeliveryMethod.FILE,
    deliveryContent: 'https://example.com/download/zapier-leads.json',
    isPublished: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Stock Market API Wrapper',
    description: 'Express.js middleware for rapid financial data access.',
    fullDescription: 'A lightweight Node.js wrapper that simplifies calls to multiple financial APIs, providing a unified JSON format for stock prices and trends.',
    price: 34.00,
    categories: ['cat-soft'],
    rootType: CategoryType.SOFTWARE,
    techTag: TechTag.NODE,
    imageUrl: 'https://picsum.photos/seed/api/600/400',
    features: ['Real-time data', 'Caching layer', 'Error handling'],
    deliveryMethod: DeliveryMethod.LINK,
    deliveryContent: 'https://github.com/autoflow/stock-api',
    isPublished: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Advanced Python Web Scraper',
    description: 'Production-grade scraping script for e-commerce sites.',
    fullDescription: 'Highly resilient Python script using Playwright and BeautifulSoup to extract pricing and stock data from major retail platforms.',
    price: 15.00,
    categories: ['cat-soft'],
    rootType: CategoryType.SOFTWARE,
    techTag: TechTag.PYTHON,
    imageUrl: 'https://picsum.photos/seed/python/600/400',
    features: ['Anti-bot bypass', 'CSV/JSON Export', 'Headless mode'],
    deliveryMethod: DeliveryMethod.FILE,
    deliveryContent: 'https://example.com/download/scraper.py',
    isPublished: true,
    createdAt: new Date().toISOString()
  }
];
