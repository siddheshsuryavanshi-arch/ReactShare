import React, { useEffect, useState } from "react";
import { PDPResponse, Product } from "./types";

export default function PDP() {
  const [data, setData] = useState<PDPResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected image MUST be independent state
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const root = document.getElementById("pdp-root");
  const pid = root?.dataset?.productid;

  // ---------------- LOAD PRODUCT ----------------
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

  // ---------------- SET DEFAULT HERO IMAGE ----------------
  useEffect(() => {
    if (!data?.product) return;

    const p = data.product;
    const initial =
      p.featuredImage ||
      p.image ||
      (p.images?.length ? p.images[0] : null);

    setSelectedImg(initial);
  }, [data]);

  // ---------------- ADD TO CART ----------------
  async function addToCart(pid: string) {
    try {
      const fd = new FormData();
      fd.append("pid", pid);
      fd.append("quantity", "1");

      const res = await fetch(
        "/on/demandware.store/Sites-RefArch-Site/default/Cart-AddProduct",
        { method: "POST", body: fd }
      );

      const json = await res.json();
      console.log("[CART]", json);

      if (json.error) {
        alert(json.message || "Could not add to cart");
        return;
      }
      alert("Product added to cart!");
    } catch (err) {
      console.error("[CART ERROR]", err);
      alert("Cart request failed");
    }
  }

  // ---------------- LOADING STATES ----------------
  if (loading) return <h2>Loading product...</h2>;
  if (errorMsg) return <h2>{errorMsg}</h2>;
  if (!data) return <h2>Product Not Found</h2>;

  const product: Product = data.product;
  const gallery = product.images || [];

  // ---------------- PRICE FORMAT ----------------
  const formattedPrice =
    product.price != null
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(product.price)
      : null;

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", gap: "40px" }}>

        {/* -------- LEFT: GALLERY -------- */}
        <div style={{ flex: "0 0 360px" }}>
          {selectedImg && (
            <img
              src={selectedImg}
              alt={product.name}
              style={{
                width: "100%",
                borderRadius: "12px",
                marginBottom: "10px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            />
          )}

          {gallery.length > 0 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {gallery.map((img) => (
                <img
                  key={img}
                  src={img}
                  onClick={() => setSelectedImg(img)}
                  style={{
                    width: "60px",
                    height: "60px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    cursor: "pointer",
                    border:
                      selectedImg === img
                        ? "2px solid #000"
                        : "1px solid #ccc",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* -------- RIGHT: PRODUCT INFO -------- */}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "30px", fontWeight: 600 }}>
            {product.name}
          </h1>

          {formattedPrice && (
            <p style={{ fontSize: "22px", margin: "12px 0" }}>
              {formattedPrice}
            </p>
          )}

          {product.shortDescription && (
            <p style={{ fontSize: "16px" }}>{product.shortDescription}</p>
          )}

          {product.longDescription && (
            <p
              style={{
                fontSize: "14px",
                opacity: 0.8,
                marginTop: "8px",
                lineHeight: "22px",
              }}
            >
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

          <button
            onClick={() => addToCart(product.id)}
            style={{
              padding: "12px 20px",
              marginTop: "18px",
              background: "#111",
              color: "#fff",
              fontSize: "14px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            ADD TO CART
          </button>
        </div>
      </div>

      {/* -------- SYSTEM ATTRIBUTES -------- */}
      {data.attributes?.system && (
        <div style={{ marginTop: "40px" }}>
          <h3>Product Info</h3>
          <table
            style={{ borderCollapse: "collapse", width: "100%", marginTop: "12px" }}
          >
            {Object.entries(data.attributes.system).map(([key, value]) => (
              <tr key={key}>
                <td style={{ padding: "6px 10px", fontWeight: 600 }}>{key}</td>
                <td style={{ padding: "6px 10px" }}>{value ?? "-"}</td>
              </tr>
            ))}
          </table>
        </div>
      )}

      {/* -------- CUSTOM ATTRIBUTES -------- */}
      {data.attributes?.custom && (
        <div style={{ marginTop: "40px" }}>
          <h3>Attributes</h3>
          <table
            style={{ borderCollapse: "collapse", width: "100%", marginTop: "12px" }}
          >
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
