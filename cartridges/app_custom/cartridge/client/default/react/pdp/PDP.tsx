import React, { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

export default function PDP() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1️⃣ read product id passed from ISML div
  const pid = document.getElementById("pdp-root")?.dataset?.productid;

  useEffect(() => {
    async function loadProduct() {
      if (!pid) {
        setErrorMsg("Missing product ID");
        setLoading(false);
        return;
      }

      try {
        // 2️⃣ CALL FULL PIPELINE URL — NOT RELATIVE
        const url = `${window.location.origin}/on/demandware.store/Sites-RefArch-Site/default/Category-ProductDetails?pid=${pid}`;
        
        console.log("[PDP] Fetch →", url);

        const res = await fetch(url);
        const data = await res.json();

        console.log("[PDP] response ↓");
        console.log(data);

        // 3️⃣ backend returned error
        if (!data || data.error) {
          setProduct(null);
          setErrorMsg("Product not found");
        } else {
          // 4️⃣ map backend → Product type
          setProduct({
            id: data.id,
            name: data.name,
            price: data.price,
            image: `${window.location.origin}${data.image}`,
          });
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
  if (!product) return <h2>Product Not Found</h2>;

  // 5️⃣ Render PDP UI
return (
  <div
    style={{
      padding: "32px",
      fontFamily: "sans-serif",
      display: "flex",
      alignItems: "flex-start",
      gap: "40px",
    }}
  >
    {/* LEFT SIDE IMAGE */}
    <div style={{ flex: "0 0 380px" }}>
      <img
        src={product.image}
        alt={product.name}
        style={{
          width: "100%",
          borderRadius: "12px",
          objectFit: "cover",
        }}
      />
    </div>

    {/* RIGHT SIDE DETAILS */}
    <div style={{ flex: 1 }}>
      <h1 style={{ fontSize: "28px", fontWeight: 600, marginBottom: "16px" }}>
        {product.name}
      </h1>

      <p style={{ fontSize: "22px", marginBottom: "24px" }}>
        $ {product.price}
      </p>
    </div>
  </div>
);
}
