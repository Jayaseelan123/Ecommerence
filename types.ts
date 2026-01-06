

export enum TechTag {
  MAKE = 'Make.com',
  N8N = 'n8n',
  ZAPIER = 'Zapier',
  PYTHON = 'Python',
  REACT = 'React',
  NODE = 'Node.js',
  NEXTJS = 'Next.js'
}

export enum DeliveryMethod {
  FILE = 'File Download',
  LINK = 'Private Link',
  ACCESS = 'Access Instructions'
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  isVisible: boolean;
  priority: number;
}

export enum OrderStatus {
  PENDING = 'Pending',
  AWAITING_VERIFICATION = 'Awaiting Verification',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
  REFUNDED = 'Refunded'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  price: number;
  discountPrice?: number;
  categories: string[]; // Category IDs
  techTag: TechTag;
  imageUrl: string;
  features: string[];
  deliveryMethod: DeliveryMethod;
  deliveryContent: string;
  isPublished: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  avatar?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentId?: string;
  screenshotUrl?: string;
  transactionId?: string;
  userEmail?: string;
  userFullName?: string;
  createdAt: string;
}

export enum RequestStatus {
  PENDING = 'pending',
  RESPONDED = 'responded',
  ARCHIVED = 'archived'
}

export interface CustomRequest {
  id: string;
  fullName: string;
  email: string;
  projectTitle: string;
  description: string;
  status: RequestStatus;
  createdAt: string;
}
