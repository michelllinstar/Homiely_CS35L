export function getBalanceSummaries(expenses) {
  const balances = {};

  expenses.forEach((expense) => {
    expense.splits.forEach((split) => {
      if (split.is_paid || split.owed_by === expense.paid_by) return;

      const payer = expense.paid_by;
      const debtor = split.owed_by;
      const pairKey = [Math.min(payer, debtor), Math.max(payer, debtor)].join("-");
      const signedAmount = payer < debtor ? split.amount : -split.amount;

      balances[pairKey] = (balances[pairKey] || 0) + signedAmount;
    });
  });

  return Object.entries(balances).flatMap(([pairKey, netAmount]) => {
    if (Math.abs(netAmount) <= 0.01) return [];

    const [lowId, highId] = pairKey.split("-").map(Number);
    if (netAmount > 0) {
      return [{ owerId: lowId, owedId: highId, amount: netAmount }];
    }

    return [{ owerId: highId, owedId: lowId, amount: -netAmount }];
  });
}

export function getAmountOwedToUser(expenses, userId) {
  return getBalanceSummaries(expenses).reduce((total, balance) => {
    return balance.owedId === userId ? total + balance.amount : total;
  }, 0);
}
