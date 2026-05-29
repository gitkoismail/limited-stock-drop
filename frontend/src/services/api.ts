import type { Product } from "../types/product";
import type {
  CheckoutResponse,
  ReservationResponse,
} from "../types/reservation";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
};

export async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !body.success) {
    throw new Error(body.message || "Something went wrong");
  }

  if (!body.data) {
    throw new Error("API response does not include data");
  }

  return body.data;
}

export async function getProduct(productId: string) {
  return request<Product>(`/products/${productId}`);
}

export async function reserveProduct(data: {
  userId: string;
  productId: string;
  quantity: number;
}) {
  return request<ReservationResponse>("/reservations/reserve", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function checkoutReservation(reservationId: string) {
  return request<CheckoutResponse>("/checkout", {
    method: "POST",
    body: JSON.stringify({
      reservationId,
    }),
  });
}