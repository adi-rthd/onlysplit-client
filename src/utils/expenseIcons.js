import { Utensils, Car, ShoppingCart, CreditCard, Receipt, Plane, Beer, Hotel } from 'lucide-react';

const CATEGORIES = [
  { key: 'Food', keywords: ['food', 'lunch', 'dinner', 'breakfast', 'restaurant', 'snack', 'cafe', 'pizza', 'biryani', 'chai'], icon: Utensils },
  { key: 'Travel', keywords: ['travel', 'uber', 'cab', 'taxi', 'fuel', 'petrol', 'diesel', 'auto', 'metro', 'bus', 'train'], icon: Car },
  { key: 'Flight', keywords: ['flight', 'airport', 'airline', 'boarding'], icon: Plane },
  { key: 'Drinks', keywords: ['beer', 'vodka', 'whisky', 'alcohol', 'drink', 'bar', 'pub', 'wine'], icon: Beer },
  { key: 'Stay', keywords: ['hotel', 'room', 'resort', 'airbnb', 'hostel', 'stay'], icon: Hotel },
  { key: 'Shopping', keywords: ['shopping', 'grocery', 'clothes', 'amazon', 'flipkart', 'mall'], icon: ShoppingCart },
  { key: 'Bills', keywords: ['pay', 'recharge', 'bill', 'electricity', 'rent', 'wifi', 'subscription'], icon: CreditCard },
];

export const getExpenseIcon = (title = '', category = '') => {
  const text = (title + ' ' + category).toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.keywords.some(kw => text.includes(kw))) return cat.icon;
  }
  return Receipt;
};

export const getExpenseCategory = (title = '') => {
  const text = title.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.keywords.some(kw => text.includes(kw))) return cat.key;
  }
  return 'General';
};

export const EXPENSE_CATEGORIES = ['General', ...CATEGORIES.map(c => c.key)];
