export function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return 'Dates TBD';
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  })}`;
}

export function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

export function getDaysUntil(dateValue) {
  const now = new Date();
  const date = new Date(dateValue);
  return Math.max(Math.ceil((date.getTime() - now.getTime()) / 86400000), 0);
}

export function groupTripsByStatus(trips) {
  const now = new Date();

  return {
    ongoing: trips.filter((trip) => new Date(trip.startDate) <= now && new Date(trip.endDate) >= now),
    upcoming: trips.filter((trip) => new Date(trip.startDate) > now),
    completed: trips.filter((trip) => new Date(trip.endDate) < now)
  };
}
