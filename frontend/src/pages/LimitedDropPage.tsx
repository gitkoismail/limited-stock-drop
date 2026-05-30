import { useCountdown } from "../hooks/useCountdown";
import { useProduct } from "../hooks/useProduct";
import { useReservation } from "../hooks/useReservation";

const PRODUCT_ID = "ebc36e9d-a9de-4009-a8f6-91fa36be726f";
const USER_ID = "5384e208-c8be-48f8-95dc-5b0330016294";

function formatPrice(priceInCents: number) {
  return (priceInCents / 100).toFixed(2);
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function LimitedDropPage() {
  const { product, isLoading, error, refetchProduct } = useProduct(PRODUCT_ID);

  const {
    reservation,
    order,
    isReserving,
    isCheckingOut,
    error: reservationError,
    reserve,
    checkout,
  } = useReservation();

  const remainingSeconds = useCountdown(reservation?.expiresAt ?? null);

  const isSoldOut = product ? product.stock <= 0 : true;
  const hasActiveReservation = Boolean(reservation) && remainingSeconds > 0;

  async function handleReserve() {
    await reserve({
      userId: USER_ID,
      productId: PRODUCT_ID,
      quantity: 1,
    });

    await refetchProduct();
  }

  async function handleCheckout() {
    await checkout();
    await refetchProduct();
  }

  if (isLoading) {
    return <main>Loading product...</main>;
  }

  if (error) {
    return <main>{error}</main>;
  }

  if (!product) {
    return <main>Product not found</main>;
  }

  return (
    <main className="page">
      <section className="card">
        {product.imageUrl && (
          <img src={product.imageUrl} alt={product.name} className="product-image" />
        )}

        <div className="content">
          <p className="eyebrow">Limited Drop</p>

          <h1>{product.name}</h1>

          <p className="description">{product.description}</p>

          <p className="price">${formatPrice(product.priceInCents)}</p>

          <div className="stock-box">
            <span>Remaining stock</span>
            <strong>{product.stock}</strong>
          </div>

          {reservationError && <p className="error">{reservationError}</p>}

          {hasActiveReservation && (
            <div className="timer-box">
              <span>Reservation expires in</span>
              <strong>{formatTime(remainingSeconds)}</strong>
            </div>
          )}

          {reservation && remainingSeconds === 0 && !order && (
            <p className="error">Your reservation has expired.</p>
          )}

          {order && (
            <div className="status-card success-card">
              <strong>Order confirmed!</strong>
              <span>Your checkout was completed successfully.</span>
              <small>Order #{order.id.slice(0, 8).toUpperCase()}</small>
            </div>
          )}

          <div className="actions">
            <button
              onClick={handleReserve}
              disabled={isSoldOut || isReserving || hasActiveReservation}
            >
              {isReserving
                ? "Reserving..."
                : isSoldOut
                  ? "Sold Out"
                  : hasActiveReservation
                    ? "Reserved"
                    : "Reserve"}
            </button>

            {hasActiveReservation && (
              <button onClick={handleCheckout} disabled={isCheckingOut}>
                {isCheckingOut ? "Checking out..." : "Checkout"}
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}