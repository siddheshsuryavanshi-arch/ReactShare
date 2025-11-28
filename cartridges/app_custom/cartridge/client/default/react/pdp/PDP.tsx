import React, { useEffect, useState } from "react";
import { Product } from "./Product";

export default function PDP() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const productID = new URLSearchParams(window.location.search).get("productID");

  useEffect(() => {
    if (!productID) return;

    fetch(`/Category-ProductDetails?productID=${productID}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [productID]);

  if (loading) return <h2>Loading Product…</h2>;
  if (!product) return <h2>Product Not Found</h2>;

  return (
    <div style={{ padding: "32px", fontFamily: "sans-serif" }}>
      <img
        src={product.image}
        style={{
          width: "300px",
          marginBottom: "16px",
          borderRadius: "8px",
        }}
      />

      <h1 style={{ fontSize: "32px", fontWeight: "600" }}>
        {product.name}
      </h1>

      <p style={{ fontSize: "22px", marginTop: "16px" }}>
        ₹ {product.price}
      </p>
    </div>
  );
}
