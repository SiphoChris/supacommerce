import type { ElementType } from "react";
import {
  ShoppingCart,
  Package,
  Users,
  Globe,
  DollarSign,
  Percent,
  Warehouse,
  Truck,
  Star,
  Shield,
  CreditCard,
} from "lucide-react";

export type MenuGroup = {
  key: string;
  label: string;
  Icon: ElementType;
  /** Only primary resources — child/junction tables are excluded intentionally */
  resources: string[];
  /** Open by default? */
  defaultOpen?: boolean;
};

export const MENU_GROUPS: MenuGroup[] = [
  {
    key: "orders",
    label: "Orders",
    Icon: ShoppingCart,
    defaultOpen: true,
    resources: [
      "orders",
      "order_fulfillments",
      "order_returns",
      "order_refunds",
    ],
  },
  {
    key: "products",
    label: "Products",
    Icon: Package,
    defaultOpen: true,
    resources: [
      "products",
      "product_variants",
      "product_categories",
      "product_collections",
      "product_tags",
    ],
  },
  {
    key: "customers",
    label: "Customers",
    Icon: Users,
    resources: ["customers", "customer_groups"],
  },
  {
    key: "payments",
    label: "Payments",
    Icon: CreditCard,
    resources: ["payment_collections", "payment_sessions"],
  },
  {
    key: "pricing",
    label: "Pricing",
    Icon: DollarSign,
    resources: ["prices", "price_sets", "price_lists"],
  },
  {
    key: "promotions",
    label: "Promotions",
    Icon: Percent,
    resources: ["promotions", "promotion_rules"],
  },
  {
    key: "inventory",
    label: "Inventory",
    Icon: Warehouse,
    resources: ["inventory_items", "inventory_levels", "stock_locations"],
  },
  {
    key: "shipping",
    label: "Shipping",
    Icon: Truck,
    resources: [
      "shipping_options",
      "shipping_profiles",
      "fulfillment_providers",
    ],
  },
  {
    key: "regions",
    label: "Regions & Geo",
    Icon: Globe,
    resources: ["regions", "countries", "currencies"],
  },
  {
    key: "sales_channels",
    label: "Sales Channels",
    Icon: Star,
    resources: ["sales_channels"],
  },
  {
    key: "tax",
    label: "Tax",
    Icon: Percent,
    resources: ["tax_regions", "tax_rates"],
  },
  {
    key: "admin",
    label: "Admin",
    Icon: Shield,
    resources: ["admin_users", "admin_invitations"],
  },
];
