import { useState } from "react";
import { checkoutReservation, reserveProduct } from "../services/api";
import type {
  CheckoutResponse,
  ReservationResponse,
} from "../types/reservation";

export function useReservation() {
  const [reservation, setReservation] = useState<ReservationResponse | null>(
    null
  );
  const [order, setOrder] = useState<CheckoutResponse | null>(null);
  const [isReserving, setIsReserving] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reserve(data: {
    userId: string;
    productId: string;
    quantity: number;
  }) {
    try {
      setIsReserving(true);
      setError(null);
      setOrder(null);

      const reservationData = await reserveProduct(data);
      setReservation(reservationData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reservation failed");
    } finally {
      setIsReserving(false);
    }
  }

  async function checkout() {
    if (!reservation) return;

    try {
      setIsCheckingOut(true);
      setError(null);

      const orderData = await checkoutReservation(reservation.reservationId);

      setOrder(orderData);
      setReservation(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setIsCheckingOut(false);
    }
  }

  function clearReservation() {
    setReservation(null);
  }

  return {
    reservation,
    order,
    isReserving,
    isCheckingOut,
    error,
    reserve,
    checkout,
    clearReservation,
  };
}