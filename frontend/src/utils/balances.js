export function getBalanceSummaries(expenses) {
  const balances = {};

  expenses.forEach((expense) => {
    expense.splits.forEach((split) => {
      if (split.is_paid || split.owed_by === expense.paid_by) return;

      const key = `${split.owed_by}-${expense.paid_by}`;
      const reverseKey = `${expense.paid_by}-${split.owed_by}`;

      if (balances[reverseKey]) {
        balances[reverseKey] -= split.amount;
      } else {
        balances[key] = (balances[key] || 0) + split.amount;
      }
    });
  });

  return Object.entries(balances)
    .filter(([, amount]) => amount > 0.01)
    .map(([key, amount]) => {
      const [owerId, owedId] = key.split("-").map(Number);
      return { owerId, owedId, amount };
    });
}

export function getAmountOwedToUser(expenses, userId) {
  return getBalanceSummaries(expenses).reduce((total, balance) => {
    return balance.owedId === userId ? total + balance.amount : total;
  }, 0);
}
