export const expenses = [
  {
    id: '1',
    description: 'Dinner at Sushi Ko',
    amount: 45.00,
    paidBy: 'Sarah',
    type: 'owe', // 'owe' or 'owed'
    groupId: 'trip-1',
    date: new Date().toISOString()
  },
  {
    id: '2',
    description: 'Monthly Rent',
    amount: 800.00,
    paidBy: 'You',
    type: 'owed',
    groupId: null,
    date: new Date().toISOString()
  }
];
