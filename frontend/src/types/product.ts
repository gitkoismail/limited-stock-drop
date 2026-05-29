export type Product = {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  stock: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};