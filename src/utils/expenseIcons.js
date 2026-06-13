import {
  Utensils,
  Car,
  ShoppingCart,
  CreditCard,
  Receipt,
  Plane,
  Beer,
  Hotel,
} from 'lucide-react';

export const getExpenseIcon = (
  title = '',
  category = ''
) => {
  const text =`${title} ${category}`.toLowerCase();

  if (
    text.includes('food') ||
    text.includes('lunch') ||
    text.includes('dinner') ||
    text.includes('breakfast') ||
    text.includes('restaurant')
  ) {
    return Utensils;
  }

  if (
    text.includes('travel') ||
    text.includes('uber') ||
    text.includes('cab') ||
    text.includes('taxi') ||
    text.includes('fuel') ||
    text.includes('petrol')
  ) {
    return Car;
  }

  if (
    text.includes('flight') ||
    text.includes('airport')
  ) {
    return Plane;
  }

  if (
    text.includes('beer') ||
    text.includes('vodka') ||
    text.includes('whisky') ||
    text.includes('alcohol') ||
    text.includes('drink')
  ) {
    return Beer;
  }

  if (
    text.includes('hotel') ||
    text.includes('room') ||
    text.includes('resort')
  ) {
    return Hotel;
  }

  if (
    text.includes('shopping') ||
    text.includes('grocery')
  ) {
    return ShoppingCart;
  }

  if (
    text.includes('pay') ||
    text.includes('recharge') ||
    text.includes('bill')
  ) {
    return CreditCard;
  }

  return Receipt;
};