import React, { useEffect, useState } from "react";
import { PDPResponse, Product } from "./types";

export default function PDP() {
  const [data, setData] = useState<PDPResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

        const res = await fetch(url);
        const json = await res.json();

        if (!json || json.error || !json.product) {
          setErrorMsg(json?.message || "Product not found");
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

  async function addToCart(pid: string) {
    try {
      const fd = new FormData();
      fd.append("pid", pid);
      fd.append("quantity", "1");

      const res = await fetch(
        "/on/demandware.store/Sites-RefArch-Site/default/Cart-AddProduct",
        {
          method: "POST",
          body: fd,
        }
      );

      const json = await res.json();
      console.log("[CART] response ↓", json);

      if (json.error) {
        alert(json.message || "Could not add to cart");
        return;
      }

      alert("Product added to cart!");
    } catch (err) {
      console.error("[CART] error:", err);
      alert("Cart request failed");
    }
  }

  if (loading) return <h2>Loading product...</h2>;
  if (errorMsg) return <h2>{errorMsg}</h2>;
  if (!data) return <h2>Product Not Found</h2>;

  const product: Product = data.product;

  const formattedPrice =
    product.price != null
      ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(product.price)
      : null;

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", gap: "40px" }}>
        {/* IMAGE */}
        <div style={{ flex: "0 0 360px" }}>
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              style={{ width: "100%", borderRadius: "12px" }}
            />
          )}
        </div>

        {/* MAIN INFO */}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "30px", fontWeight: 600 }}>{product.name}</h1>

          {formattedPrice && (
            <p style={{ fontSize: "22px", margin: "12px 0" }}>{formattedPrice}</p>
          )}

          {product.shortDescription && (
            <p style={{ fontSize: "16px" }}>{product.shortDescription}</p>
          )}

          {product.longDescription && (
            <p style={{ fontSize: "14px", opacity: 0.8, marginTop: "8px" }}>
              {product.longDescription}
            </p>
          )}

          {product.availability && (
            <p style={{ marginTop: "12px" }}>
              <b>Availability:</b> {product.availability}
            </p>
          )}

          {product.stock != null && (
            <p>
              <b>Stock:</b> {product.stock}
            </p>
          )}

          {/* ADD TO CART */}
          <button
            onClick={() => addToCart(product.id)}
            style={{
              padding: "12px 20px",
              marginTop: "18px",
              background: "black",
              color: "white",
              fontSize: "14px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            ADD TO CART
          </button>
        </div>
      </div>

      {/* SYSTEM ATTRIBUTES */}
      {data.attributes?.system && (
        <div style={{ marginTop: "40px" }}>
          <h3>Product Info</h3>
          <table style={{ borderCollapse: "collapse", width: "100%", marginTop: "12px" }}>
            {Object.entries(data.attributes.system).map(([key, value]) => (
              <tr key={key}>
                <td style={{ padding: "6px 10px", fontWeight: 600 }}>{key}</td>
                <td style={{ padding: "6px 10px" }}>{value ?? "-"}</td>
              </tr>
            ))}
          </table>
        </div>
      )}

      {/* CUSTOM ATTRIBUTES */}
      {data.attributes?.custom && (
        <div style={{ marginTop: "40px" }}>
          <h3>Attributes</h3>
          <table style={{ borderCollapse: "collapse", width: "100%", marginTop: "12px" }}>
            {Object.entries(data.attributes.custom).map(([key, value]) => (
              <tr key={key}>
                <td style={{ padding: "6px 10px", fontWeight: 600 }}>{key}</td>
                <td style={{ padding: "6px 10px" }}>{value ?? "-"}</td>
              </tr>
            ))}
          </table>
        </div>
      )}
    </div>
  );
}
