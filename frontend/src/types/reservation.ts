export type ReservationResponse = {
  reservationId: string;
  productId: string;
  userId: string;
  quantity: number;
  status: "ACTIVE" | "COMPLETED" | "EXPIRED" | "CANCELLED";
  expiresAt: string;
  remainingSeconds: number;
};

export type CheckoutResponse = {
  id: string;
  userId: string;
  productId: string;
  reservationId: string;
  quantity: number;
  totalInCents: number;
  createdAt: string;
};