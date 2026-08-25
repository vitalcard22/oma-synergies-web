export interface Tour {
  slug: string;
  name: string;
  /** Every tour currently on offer is a group trip, but each one is also
   * bookable as a couple or family - shown under every filter tab on the
   * /tours page rather than being locked to a single category. */
  categories: ('Group Tours' | 'Honeymoon' | 'Solo' | 'Family')[];
  nights: number;
  fromPrice: number;
  /** Almost every package prices "per person sharing" (i.e. two people
   * splitting a room) - Mauritius is the one exception, priced flat "per
   * person" with no sharing assumption, so this has to be per-tour rather
   * than a sitewide constant. */
  perPersonSharing: boolean;
}

export const TOURS: Tour[] = [
  { slug: 'mauritius', name: 'Mauritius', categories: ['Group Tours', 'Honeymoon', 'Solo', 'Family'], nights: 3, fromPrice: 1_500_000, perPersonSharing: false },
  { slug: 'singapore', name: 'Singapore', categories: ['Group Tours', 'Honeymoon', 'Solo', 'Family'], nights: 3, fromPrice: 1_600_900, perPersonSharing: true },
  { slug: 'maldives', name: 'Maldives', categories: ['Group Tours', 'Honeymoon', 'Solo', 'Family'], nights: 3, fromPrice: 950_000, perPersonSharing: true },
  { slug: 'kigali-rwanda', name: 'Kigali, Rwanda', categories: ['Group Tours', 'Honeymoon', 'Solo', 'Family'], nights: 3, fromPrice: 800_000, perPersonSharing: true },
  { slug: 'egypt', name: 'Egypt', categories: ['Group Tours', 'Honeymoon', 'Solo', 'Family'], nights: 3, fromPrice: 985_900, perPersonSharing: true },
  { slug: 'qatar', name: 'Qatar', categories: ['Group Tours', 'Honeymoon', 'Solo', 'Family'], nights: 4, fromPrice: 1_500_000, perPersonSharing: true },
  { slug: 'zanzibar', name: 'Zanzibar', categories: ['Group Tours', 'Honeymoon', 'Solo', 'Family'], nights: 4, fromPrice: 1_400_000, perPersonSharing: true },
  { slug: 'seychelles', name: 'Seychelles', categories: ['Group Tours', 'Honeymoon', 'Solo', 'Family'], nights: 4, fromPrice: 1_500_000, perPersonSharing: true },
  { slug: 'nairobi', name: 'Nairobi', categories: ['Group Tours', 'Honeymoon', 'Solo', 'Family'], nights: 4, fromPrice: 1_000_000, perPersonSharing: true },
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

export function formatDuration(nights: number): string {
  return `${nights + 1} Days / ${nights} Nights`;
}

export function getDiscountedFromPrice(fromPrice: number): number {
  return Math.round((fromPrice * (1 - GROUP_DISCOUNT_PERCENT / 100)) / 1000) * 1000;
}
