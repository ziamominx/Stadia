export const AIRTEL_AMOUNT = 149;

// Mock: hotel referral pays the partner commission on a 2-night stay.
export function hotelReferralAmount(hotel) {
  return Math.round((hotel.partner_commission_pct / 100) * hotel.nightly_rate * 2);
}