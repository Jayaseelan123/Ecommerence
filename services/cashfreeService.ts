
import { Order, OrderStatus } from '../types';
import { supabaseService } from './supabase';

export const initiatePayment = async (order: Order) => {
  console.log('Initiating Cashfree Payment for Order:', order.id);

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  const isSuccess = Math.random() > 0.1;

  try {
    if (isSuccess) {
      await supabaseService.updateOrderStatus(order.id, OrderStatus.COMPLETED);
      return { success: true, message: 'Payment successful' };
    } else {
      await supabaseService.updateOrderStatus(order.id, OrderStatus.FAILED);
      return { success: false, message: 'Payment failed' };
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, message: 'Payment failed to record' };
  }
};
