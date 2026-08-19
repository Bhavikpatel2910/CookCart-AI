// Local-only constants for the simulated (live) delivery experience. The
// dataset does not include delivery telemetry, so this small set of UI values
// is kept here. No remote assets: partner avatars render as initials.
export const DELIVERY = {
  etaMinutes: 8,
  etaLabel: 'Arriving shortly',
  partner: {
    name: 'Rahul',
    rating: 4.9,
    deliveries: '1,240+ deliveries',
    vehicle: 'Electric scooty · CC 1234',
  },
  timeline: [
    { id: 'accepted', title: 'Order Accepted', time: 'Just now', status: 'done' },
    { id: 'packing', title: 'Packing Ingredients', time: 'In progress', status: 'active' },
    { id: 'on-the-way', title: 'On the Way', time: 'Arriving shortly', status: 'pending' },
    { id: 'delivered', title: 'Delivered', time: 'Expected in ~8 minutes', status: 'pending' },
  ],
  storeName: 'CookCart Express · Sector 62',
  route: '2.4 km away',
}
