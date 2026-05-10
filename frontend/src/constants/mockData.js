export const UPCOMING_TRIPS = [
  {
    id: 1,
    title: "Summer in Santorini",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80",
    date: "June 15 - June 22",
    daysLeft: 12,
    budget: "$2,500",
    destinations: 3
  },
  {
    id: 2,
    title: "Tokyo Exploration",
    image: "https://images.unsplash.com/photo-1540959733332-e94e270b4d82?auto=format&fit=crop&q=80",
    date: "August 10 - August 18",
    daysLeft: 68,
    budget: "$4,200",
    destinations: 5
  }
];

export const POPULAR_DESTINATIONS = [
  {
    id: 1,
    name: "Paris",
    country: "France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80",
    rating: 4.8,
    price: "$$$"
  },
  {
    id: 2,
    name: "Bali",
    country: "Indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80",
    rating: 4.9,
    price: "$$"
  },
  {
    id: 3,
    name: "New York",
    country: "USA",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80",
    rating: 4.7,
    price: "$$$$"
  }
];

export const STATS = [
  { label: 'Total Trips', value: '12', icon: 'Map' },
  { label: 'Countries', value: '8', icon: 'Globe' },
  { label: 'Saved Items', value: '45', icon: 'Bookmark' },
  { label: 'Travel Points', value: '2.4k', icon: 'Award' },
];

export const ITINERARY_DAYS = [
  {
    id: 'day-1',
    title: 'Day 1: Arrival & Sunset',
    date: 'Jun 15',
    activities: [
      { id: 'act-1', time: '14:00', title: 'Check-in at Grace Hotel', type: 'Lodging', cost: '$450' },
      { id: 'act-2', time: '17:00', title: 'Oia Sunset Walk', type: 'Sightseeing', cost: 'Free' },
      { id: 'act-3', time: '19:30', title: 'Dinner at Ambrosia', type: 'Dining', cost: '$120' },
    ]
  },
  {
    id: 'day-2',
    title: 'Day 2: Boat Tour & Volcanos',
    date: 'Jun 16',
    activities: [
      { id: 'act-4', time: '09:00', title: 'Catamaran Cruise', type: 'Activity', cost: '$200' },
      { id: 'act-5', time: '13:00', title: 'Lunch on Boat', type: 'Dining', cost: 'Included' },
      { id: 'act-6', time: '16:00', title: 'Swim at Red Beach', type: 'Relaxation', cost: 'Free' },
    ]
  },
  {
    id: 'day-3',
    title: 'Day 3: Wine Tasting',
    date: 'Jun 17',
    activities: [
      { id: 'act-7', time: '11:00', title: 'Santo Wines Tour', type: 'Activity', cost: '$80' },
      { id: 'act-8', time: '15:00', title: 'Visit Pyrgos Village', type: 'Sightseeing', cost: 'Free' },
    ]
  }
];
