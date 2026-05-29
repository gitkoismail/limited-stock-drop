import { useEffect, useState } from "react";
import type { Product } from "../types/product";
import { getProduct } from "../services/api";

export function useProduct(productId: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchProduct() {
    try {
      const data = await getProduct(productId);
      setProduct(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch product");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void fetchProduct();

    const intervalId = window.setInterval(() => {
      void fetchProduct();
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [productId]);

  return {
    product,
    isLoading,
    error,
    refetchProduct: fetchProduct,
  };
}