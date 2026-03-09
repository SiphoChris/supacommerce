import type { ResourceProps } from "react-admin";
import {
  ShoppingCart,
  Package,
  Users,
  MapPin,
  Globe,
  DollarSign,
  Tag,
  Layers,
  Image,
  Settings,
  Truck,
  Warehouse,
  BarChart2,
  CreditCard,
  RefreshCw,
  RotateCcw,
  Percent,
  List,
  Star,
  Grid,
  Box,
  Sliders,
  BookOpen,
  UserCheck,
  Mail,
  Receipt,
  Store,
  Shield,
} from "lucide-react";

// Orders
import {
  OrderList,
  OrderShow,
  OrderEdit,
} from "../admin/resources/orders/index";
import {
  OrderFulfillmentList,
  OrderFulfillmentEdit,
  OrderFulfillmentCreate,
  OrderReturnList,
  OrderReturnEdit,
  OrderReturnCreate,
  OrderRefundList,
  OrderRefundCreate,
} from "../admin/resources/orders/subResources";

// Products
import {
  ProductList,
  ProductEdit,
  ProductCreate,
} from "../admin/resources/products/index";
import {
  ProductVariantList,
  ProductVariantEdit,
  ProductVariantCreate,
  ProductCategoryList,
  ProductCategoryEdit,
  ProductCategoryCreate,
  ProductCollectionList,
  ProductCollectionEdit,
  ProductCollectionCreate,
  ProductTagList,
  ProductTagEdit,
  ProductTagCreate,
  ProductImageCreate,
  ProductImageEdit,
} from "../admin/resources/products/subResources";

// Customers
import {
  CustomerList,
  CustomerEdit,
  CustomerCreate,
  CustomerGroupList,
  CustomerGroupEdit,
  CustomerGroupCreate,
} from "../admin/resources/customers/index";

// Payments — read-only + status edit only, no create
import {
  PaymentCollectionList,
  PaymentCollectionShow,
  PaymentCollectionEdit,
  PaymentSessionList,
  PaymentSessionShow,
} from "../admin/resources/payments/index";

// Pricing
import {
  PriceList,
  PriceEdit,
  PriceCreate,
  PriceSetList,
  PriceSetCreate,
  PriceListList,
  PriceListEdit,
  PriceListCreate,
} from "../admin/resources/pricing/index";

// Promotions
import {
  PromotionList,
  PromotionEdit,
  PromotionCreate,
  PromotionRuleList,
  PromotionRuleCreate,
  PromotionRuleEdit,
} from "../admin/resources/promotions/index";

// Inventory
import {
  InventoryItemList,
  InventoryItemEdit,
  InventoryItemCreate,
  InventoryLevelList,
  InventoryLevelEdit,
  InventoryLevelCreate,
  StockLocationList,
  StockLocationEdit,
  StockLocationCreate,
} from "../admin/resources/inventory/index";

// Shipping
import {
  ShippingOptionList,
  ShippingOptionEdit,
  ShippingOptionCreate,
  ShippingProfileList,
  ShippingProfileEdit,
  ShippingProfileCreate,
  FulfillmentProviderList,
  FulfillmentProviderEdit,
  FulfillmentProviderCreate,
} from "../admin/resources/shipping/index";

// Regions / Geo
import {
  RegionList,
  RegionEdit,
  RegionCreate,
  CountryList,
  CountryEdit,
  CountryCreate,
  CurrencyList,
  CurrencyEdit,
  CurrencyCreate,
} from "../admin/resources/regions/index";

// Misc: sales channels, tax, admin
import {
  SalesChannelList,
  SalesChannelEdit,
  SalesChannelCreate,
  TaxRegionList,
  TaxRegionEdit,
  TaxRegionCreate,
  TaxRateList,
  TaxRateEdit,
  TaxRateCreate,
  AdminUserList,
  AdminUserEdit,
  AdminInvitationList,
  AdminInvitationCreate,
} from "../admin/resources/misc";

export const resources: ResourceProps[] = [
  // ── Admin ─────────────────────────────────────────────────────────────────
  // admin_users: no create — users are onboarded via invitation only
  {
    name: "admin_users",
    icon: Shield,
    list: AdminUserList,
    edit: AdminUserEdit,
  },
  {
    name: "admin_invitations",
    icon: Mail,
    list: AdminInvitationList,
    create: AdminInvitationCreate,
  },

  // ── Orders ────────────────────────────────────────────────────────────────
  // orders: no create — created by checkout edge function only
  {
    name: "orders",
    icon: ShoppingCart,
    list: OrderList,
    show: OrderShow,
    edit: OrderEdit,
  },
  // order_line_items: read-only, shown inside order show page
  {
    name: "order_line_items",
    icon: List,
  },
  {
    name: "order_fulfillments",
    icon: Truck,
    list: OrderFulfillmentList,
    edit: OrderFulfillmentEdit,
    create: OrderFulfillmentCreate,
  },
  // order_fulfillment_items: read-only junction table, shown inside fulfillment show
  {
    name: "order_fulfillment_items",
    icon: Box,
  },
  {
    name: "order_returns",
    icon: RotateCcw,
    list: OrderReturnList,
    edit: OrderReturnEdit,
    create: OrderReturnCreate,
  },
  // order_return_items: read-only junction table, shown inside return show
  {
    name: "order_return_items",
    icon: RefreshCw,
  },
  {
    name: "order_refunds",
    icon: Receipt,
    list: OrderRefundList,
    create: OrderRefundCreate,
  },

  // ── Products ──────────────────────────────────────────────────────────────
  {
    name: "products",
    icon: Package,
    list: ProductList,
    edit: ProductEdit,
    create: ProductCreate,
  },
  {
    name: "product_variants",
    icon: Sliders,
    list: ProductVariantList,
    edit: ProductVariantEdit,
    create: ProductVariantCreate,
  },
  {
    name: "product_categories",
    icon: Layers,
    list: ProductCategoryList,
    edit: ProductCategoryEdit,
    create: ProductCategoryCreate,
  },
  {
    name: "product_collections",
    icon: BookOpen,
    list: ProductCollectionList,
    edit: ProductCollectionEdit,
    create: ProductCollectionCreate,
  },
  {
    name: "product_tags",
    icon: Tag,
    list: ProductTagList,
    edit: ProductTagEdit,
    create: ProductTagCreate,
  },
  // Junction/child tables — registered for reference fields, no UI
  { name: "product_options", icon: Settings },
  { name: "product_option_values", icon: Grid },
  {
    name: "product_images",
    icon: Image,
    create: ProductImageCreate,
    edit: ProductImageEdit,
  },
  { name: "product_category_products", icon: Layers },
  { name: "product_collection_products", icon: BookOpen },
  { name: "product_tag_products", icon: Tag },
  { name: "product_variant_option_values", icon: Sliders },

  // ── Customers ─────────────────────────────────────────────────────────────
  {
    name: "customers",
    icon: Users,
    list: CustomerList,
    edit: CustomerEdit,
    create: CustomerCreate,
  },
  // customer_addresses: managed via customer show page
  {
    name: "customer_addresses",
    icon: MapPin,
  },
  {
    name: "customer_groups",
    icon: UserCheck,
    list: CustomerGroupList,
    edit: CustomerGroupEdit,
    create: CustomerGroupCreate,
  },

  // ── Carts ─────────────────────────────────────────────────────────────────
  // Carts are managed by the SDK — admin can read only
  { name: "carts", icon: ShoppingCart },
  { name: "cart_line_items", icon: List },
  { name: "cart_shipping_methods", icon: Truck },

  // ── Payments ──────────────────────────────────────────────────────────────
  // payment_collections: created by checkout RPC, status edit only
  // payment_sessions: managed by payment webhook, read-only
  {
    name: "payment_collections",
    icon: CreditCard,
    list: PaymentCollectionList,
    show: PaymentCollectionShow,
    edit: PaymentCollectionEdit,
  },
  {
    name: "payment_sessions",
    icon: CreditCard,
    list: PaymentSessionList,
    show: PaymentSessionShow,
  },

  // ── Pricing ───────────────────────────────────────────────────────────────
  {
    name: "prices",
    icon: DollarSign,
    list: PriceList,
    edit: PriceEdit,
    create: PriceCreate,
  },
  {
    name: "price_sets",
    icon: DollarSign,
    list: PriceSetList,
    create: PriceSetCreate,
  },
  {
    name: "price_lists",
    icon: BarChart2,
    list: PriceListList,
    edit: PriceListEdit,
    create: PriceListCreate,
  },
  { name: "price_list_prices", icon: DollarSign },
  { name: "price_list_customer_groups", icon: UserCheck },

  // ── Promotions ────────────────────────────────────────────────────────────
  {
    name: "promotions",
    icon: Percent,
    list: PromotionList,
    edit: PromotionEdit,
    create: PromotionCreate,
  },
  {
    name: "promotion_rules",
    icon: Settings,
    list: PromotionRuleList,
    create: PromotionRuleCreate,
    edit: PromotionRuleEdit,
  },
  // promotion_usages: read-only audit log
  { name: "promotion_usages", icon: BarChart2 },

  // ── Inventory ─────────────────────────────────────────────────────────────
  {
    name: "inventory_items",
    icon: Box,
    list: InventoryItemList,
    edit: InventoryItemEdit,
    create: InventoryItemCreate,
  },
  {
    name: "inventory_levels",
    icon: BarChart2,
    list: InventoryLevelList,
    edit: InventoryLevelEdit,
    create: InventoryLevelCreate,
  },
  // inventory_reservations: managed by RPCs — read-only
  { name: "inventory_reservations", icon: Warehouse },
  {
    name: "stock_locations",
    icon: Warehouse,
    list: StockLocationList,
    edit: StockLocationEdit,
    create: StockLocationCreate,
  },

  // ── Regions & Geo ─────────────────────────────────────────────────────────
  {
    name: "regions",
    icon: Globe,
    list: RegionList,
    edit: RegionEdit,
    create: RegionCreate,
  },
  {
    name: "countries",
    icon: MapPin,
    list: CountryList,
    edit: CountryEdit,
    create: CountryCreate,
  },
  {
    name: "currencies",
    icon: DollarSign,
    list: CurrencyList,
    edit: CurrencyEdit,
    create: CurrencyCreate,
  },

  // ── Shipping ──────────────────────────────────────────────────────────────
  {
    name: "shipping_options",
    icon: Truck,
    list: ShippingOptionList,
    edit: ShippingOptionEdit,
    create: ShippingOptionCreate,
  },
  { name: "shipping_option_requirements", icon: Settings },
  {
    name: "shipping_profiles",
    icon: Truck,
    list: ShippingProfileList,
    edit: ShippingProfileEdit,
    create: ShippingProfileCreate,
  },
  {
    name: "fulfillment_providers",
    icon: Store,
    list: FulfillmentProviderList,
    edit: FulfillmentProviderEdit,
    create: FulfillmentProviderCreate,
  },

  // ── Sales Channels ────────────────────────────────────────────────────────
  {
    name: "sales_channels",
    icon: Star,
    list: SalesChannelList,
    edit: SalesChannelEdit,
    create: SalesChannelCreate,
  },
  { name: "sales_channel_products", icon: Package },

  // ── Tax ───────────────────────────────────────────────────────────────────
  {
    name: "tax_regions",
    icon: Globe,
    list: TaxRegionList,
    edit: TaxRegionEdit,
    create: TaxRegionCreate,
  },
  {
    name: "tax_rates",
    icon: Percent,
    list: TaxRateList,
    edit: TaxRateEdit,
    create: TaxRateCreate,
  },
  { name: "tax_rate_product_categories", icon: Layers },
];
