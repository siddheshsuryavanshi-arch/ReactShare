import React, { useEffect, useState } from "react";
import { Product } from "./Product";

export default function PDP() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Read product ID from DOM attribute...
  const pid = (document.getElementById("pdp-root") as HTMLElement)
      ?.dataset?.productid;

  useEffect(() => {
    if (!pid) {
      console.warn("[ReactPDP] Missing productID in DOM attribute");
      setLoading(false);
      return;
    }

    fetch(`/Category-ProductDetails?productID=${pid}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setProduct(data);
        } else {
          console.error("[ReactPDP] API returned error:", data);
        }
      })
      .catch((err) => {
        console.error("[ReactPDP] API error:", err);
      })
      .finally(() => setLoading(false));
  }, [pid]);

  if (loading) return <h2>Loading Product…</h2>;
  if (!product) return <h2>Product Not Found</h2>;

  return (
    <div style={{ padding: "28px", fontFamily: "sans-serif" }}>
      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: "320px",
            borderRadius: "12px",
            marginBottom: "12px",
          }}
        />
      )}

      <h1 style={{ fontSize: "32px", fontWeight: 600 }}>{product.name}</h1>

      <p style={{ fontSize: "22px", marginTop: "16px" }}>
        ₹ {product.price}
      </p>
    </div>
  );
}
