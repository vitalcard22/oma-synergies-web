export interface Tour {
  slug: string;
  name: string;
  /** Every tour currently on offer is a group trip, but each one is also
   * bookable as a couple or family - shown under every filter tab on the
   * /tours page rather than being locked to a single category. */
  categories: ('Group Tours' | 'Honeymoon' | 'Solo' | 'Family')[];
  nights: number;
  fromPrice: number;
}

export const TOURS: Tour[] = [
  { slug: 'qatar', name: 'Qatar', categories: ['Group Tours', 'Honeymoon', 'Solo', 'Family'], nights: 6, fromPrice: 1_500_000 },
  { slug: 'zanzibar', name: 'Zanzibar', categories: ['Group Tours', 'Honeymoon', 'Solo', 'Family'], nights: 6, fromPrice: 1_400_000 },
  { slug: 'seychelles', name: 'Seychelles', categories: ['Group Tours', 'Honeymoon', 'Solo', 'Family'], nights: 5, fromPrice: 1_500_000 },
  { slug: 'nairobi', name: 'Nairobi', categories: ['Group Tours', 'Honeymoon', 'Solo', 'Family'], nights: 5, fromPrice: 1_000_000 },
  { slug: 'rwanda', name: 'Rwanda', categories: ['Group Tours', 'Honeymoon', 'Solo', 'Family'], nights: 5, fromPrice: 1_200_000 },
];

// Standard group-booking discount: 10% off per person for parties of 4+.
// Applied uniformly rather than a different fabricated number per category,
// since it's an incentive note, not a literal per-category price - final
// pricing always depends on the actual group size and is confirmed on
// contact, not computed client-side.
export const GROUP_DISCOUNT_PERCENT = 10;
export const GROUP_DISCOUNT_MIN_SIZE = 4;

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export function getDiscountedFromPrice(fromPrice: number): number {
  return Math.round((fromPrice * (1 - GROUP_DISCOUNT_PERCENT / 100)) / 1000) * 1000;
}
