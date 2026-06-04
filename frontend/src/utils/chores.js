export function getWeekStartDate() {
  const today = new Date();
  const sunday = new Date(today);

  // getDay(): Sunday is 0, Monday is 1, etc.
  // Subtracting it moves the date back to this week's Sunday.
  sunday.setDate(today.getDate() - today.getDay());

  // Backend dates use YYYY-MM-DD.
  return sunday.toISOString().split("T")[0];
}

export function getOpenChoresCount(chores, userId) {
  return chores.filter((chore) => {
    return chore.assigned_to === userId && !chore.is_completed;
  }).length;
}
