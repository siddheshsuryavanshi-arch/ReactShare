/**
 * Base Product object returned from PDP API
 */
export interface Product {
  id: string;
  name: string;
  price: number | null;
  image: string | null;

  shortDescription?: string | null;
  longDescription?: string | null;

  availability?: string | null;
  stock?: number | null;
}

/**
 * System attributes = native Salesforce Commerce Cloud fields
 */
export interface SystemAttributes {
  brand: string | null;
  type: "ONLINE" | "OFFLINE" | null;
  searchable: boolean;
  taxClassID: string | null;
}

/**
 * Custom attributes from product.custom
 * We don't know the keys ahead of time
 */
export interface CustomAttributes {
  [attributeName: string]: string | null;
}

/**
 * Variation attribute options returned by controller
 * Example:
 * {
 *   color: ["Black", "Navy"],
 *   size: ["S","M","L"]
 * }
 */
export interface VariationOptions {
  [attributeName: string]: string[];
}

/**
 * Individual variant product record returned from controller
 */
export interface Variant {
  id: string;
  name: string;
  price: number | null;
  image: string | null;
  attributes: Record<string, string | null>;
}

/**
 * Full PDP JSON response shape
 */
export interface PDPResponse {
  action: string; // "Category-ProductDetails"
  product: Product;

  attributes: {
    system: SystemAttributes;
    custom: CustomAttributes;
  };

  variationOptions: VariationOptions;
  variants: Variant[];
}
