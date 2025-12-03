import React, { useEffect, useState } from "react";
import { PDPResponse } from "./types";

export default function PDP() {
  const [data, setData] = useState<PDPResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // read product id from DOM
  const pid = document.getElementById("pdp-root")?.dataset?.productid;

  useEffect(() => {
    async function loadProduct() {
      if (!pid) {
        setErrorMsg("Missing product ID");
        setLoading(false);
        return;
      }

      try {
        const url = `${window.location.origin}/on/demandware.store/Sites-RefArch-Site/default/Category-ProductDetails?pid=${pid}`;

        console.log("[PDP] Fetch →", url);

        const res = await fetch(url);
        const json = await res.json();

        console.log("[PDP] response ↓", json);

        if (!json || json.error || !json.product) {
          setErrorMsg(json?.message || "Product not found");
          setData(null);
        } else {
          setData(json as PDPResponse);
        }
      } catch (e) {
        console.error("[PDP] API exception:", e);
        setErrorMsg("Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [pid]);

  if (loading) return <h2>Loading product...</h2>;
  if (errorMsg) return <h2>{errorMsg}</h2>;
  if (!data) return <h2>Product Not Found</h2>;

  const product = data.product;

  // 👉 PRICE FORMATTER IN USD
  const formattedPrice =
    product.price != null
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(product.price)
      : null;

  return (
    <div
      style={{
        padding: "32px",
        fontFamily: "sans-serif",
        display: "flex",
        gap: "40px",
        alignItems: "flex-start",
      }}
    >
      {/* LEFT: IMAGE */}
      <div style={{ flex: "0 0 360px" }}>
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            style={{ width: "100%", borderRadius: "12px" }}
          />
        )}
      </div>

      {/* RIGHT: DETAILS */}
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: "28px", fontWeight: 600, marginBottom: "12px" }}>
          {product.name}
        </h1>

        {formattedPrice && (
          <p style={{ fontSize: "22px", marginBottom: "12px" }}>
            {formattedPrice}
          </p>
        )}

        {product.shortDescription && (
          <p style={{ marginTop: "8px" }}>{product.shortDescription}</p>
        )}

        {product.availability && (
          <p style={{ marginTop: "12px", fontSize: "14px" }}>
            Availability: {product.availability}
          </p>
        )}

        {product.stock != null && (
          <p style={{ marginTop: "4px", fontSize: "14px" }}>
            Stock: {product.stock}
          </p>
        )}
      </div>
    </div>
  );
}
