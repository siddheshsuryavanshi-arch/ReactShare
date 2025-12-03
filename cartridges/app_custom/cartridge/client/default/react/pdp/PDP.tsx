import React, { useEffect, useState } from "react";
import { PDPResponse, Product } from "./types";

/** Accordion component */
function Accordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        marginBottom: "10px",
      }}
    >
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: "14px 16px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          fontWeight: 600,
          userSelect: "none",
          background: "#f8f8f8",
        }}
      >
        <span>{title}</span>
        <span>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ padding: "12px 16px", background: "#fff" }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function PDP() {
  const [data, setData] = useState<PDPResponse | null>(null);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pid = document.getElementById("pdp-root")?.dataset?.productid;

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
      } catch (err) {
        console.error("[PDP error]", err);
        setErrorMsg("Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [pid]);

  // ---------------- SET DEFAULT IMAGE ----------------
  useEffect(() => {
    if (!data?.product) return;
    const p = data.product;
    const img =
      p.featuredImage ||
      p.image ||
      (p.images?.length ? p.images[0] : null);

    setSelectedImg(img);
  }, [data]);

  // ---------------- ADD TO CART ----------------
  async function addToCart(pid: string) {
    try {
      const fd = new FormData();
      fd.append("pid", pid);
      fd.append("quantity", qty.toString());

      const res = await fetch(
        "/on/demandware.store/Sites-RefArch-Site/default/Cart-AddProduct",
        { method: "POST", body: fd }
      );
      const json = await res.json();

      if (json.error) {
        alert(json.message || "Could not add to cart");
        return;
      }

      alert("Product added to cart!");
    } catch (e) {
      console.error("[CART ERROR]", e);
      alert("Cart failed");
    }
  }

  // ---------------- UI GUARD ----------------
  if (loading) return <h2>Loading Product...</h2>;
  if (errorMsg) return <h2>{errorMsg}</h2>;
  if (!data) return <h2>Product Not Found</h2>;

  const product: Product = data.product;
  const gallery = product.images || [];

  const formattedPrice =
    product.price != null
      ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(product.price)
      : null;

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      
      {/* ---------------- PRODUCT MAIN ---------------- */}
      <div style={{ display: "flex", gap: "40px" }}>
        
        {/* ---------- LEFT: IMAGES ---------- */}
        <div style={{ flex: "0 0 350px" }}>
          {selectedImg && (
            <img
              src={selectedImg}
              alt={product.name}
              style={{ width: "100%", borderRadius: "12px", marginBottom: "10px" }}
            />
          )}

          {gallery.length > 0 && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {gallery.map((img) => (
                <img
                  key={img}
                  src={img}
                  onClick={() => setSelectedImg(img)}
                  style={{
                    width: "60px",
                    height: "60px",
                    cursor: "pointer",
                    objectFit: "cover",
                    borderRadius: "6px",
                    border: selectedImg === img ? "2px solid #000" : "1px solid #ccc",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ---------- RIGHT: DETAILS ---------- */}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "30px", fontWeight: 600 }}>{product.name}</h1>

          {formattedPrice && <p style={{ fontSize: "22px" }}>{formattedPrice}</p>}

          {product.shortDescription && (
            <p style={{ fontSize: "16px", marginTop: "10px" }}>
              {product.shortDescription}
            </p>
          )}

          {product.longDescription && (
            <p style={{ fontSize: "14px", marginTop: "6px", opacity: 0.8 }}>
              {product.longDescription}
            </p>
          )}

          {product.availability && (
            <p><b>Availability:</b> {product.availability}</p>
          )}

          {/* ----------- QTY ----------- */}
          <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              style={{ width: "60px", textAlign: "center" }}
            />
            <button onClick={() => setQty(q => q + 1)}>+</button>
          </div>

          <button
            onClick={() => addToCart(product.id)}
            style={{
              marginTop: "18px",
              background: "black",
              color: "white",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Add To Cart
          </button>
        </div>
      </div>

      {/* ---------- ACCORDIONS ---------- */}
      <div style={{ marginTop: "40px" }}>
        <Accordion title="Product Info">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            {Object.entries(data.attributes.system).map(([key, value]) => (
              <tr key={key}>
                <td style={{ fontWeight: 600, padding: "6px" }}>{key}</td>
                <td style={{ padding: "6px" }}>{value ?? "-"}</td>
              </tr>
            ))}
          </table>
        </Accordion>

        <Accordion title="Attributes">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            {Object.entries(data.attributes.custom).map(([key, value]) => (
              <tr key={key}>
                <td style={{ fontWeight: 600, padding: "6px" }}>{key}</td>
                <td style={{ padding: "6px" }}>{value ?? "-"}</td>
              </tr>
            ))}
          </table>
        </Accordion>
      </div>
    </div>
  );
}
