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
  OrderFulfillmentShow,
  OrderFulfillmentEdit,
  OrderFulfillmentCreate,
  OrderReturnList,
  OrderReturnShow,
  OrderReturnEdit,
  OrderReturnCreate,
  OrderRefundList,
  OrderRefundShow,
  OrderRefundCreate,
} from "../admin/resources/orders/subResources";

// Products
import {
  ProductList,
  ProductShow,
  ProductEdit,
  ProductCreate,
} from "../admin/resources/products/index";
import {
  ProductVariantList,
  ProductVariantShow,
  ProductVariantEdit,
  ProductVariantCreate,
  ProductCategoryList,
  ProductCategoryShow,
  ProductCategoryEdit,
  ProductCategoryCreate,
  ProductCollectionList,
  ProductCollectionShow,
  ProductCollectionEdit,
  ProductCollectionCreate,
  ProductTagList,
  ProductTagShow,
  ProductTagEdit,
  ProductTagCreate,
  ProductImageCreate,
  ProductImageEdit,
} from "../admin/resources/products/subResources";

// Customers
import {
  CustomerList,
  CustomerShow,
  CustomerEdit,
  CustomerCreate,
  CustomerGroupList,
  CustomerGroupShow,
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
  PriceShow,
  PriceEdit,
  PriceCreate,
  PriceSetList,
  PriceSetShow,
  PriceSetCreate,
  PriceListList,
  PriceListShow,
  PriceListEdit,
  PriceListCreate,
} from "../admin/resources/pricing/index";

// Promotions
import {
  PromotionList,
  PromotionShow,
  PromotionEdit,
  PromotionCreate,
  PromotionRuleList,
  PromotionRuleShow,
  PromotionRuleCreate,
  PromotionRuleEdit,
} from "../admin/resources/promotions/index";

// Inventory
import {
  InventoryItemList,
  InventoryItemShow,
  InventoryItemEdit,
  InventoryItemCreate,
  InventoryLevelList,
  InventoryLevelShow,
  InventoryLevelEdit,
  InventoryLevelCreate,
  StockLocationList,
  StockLocationShow,
  StockLocationEdit,
  StockLocationCreate,
} from "../admin/resources/inventory/index";

// Shipping
import {
  ShippingOptionList,
  ShippingOptionShow,
  ShippingOptionEdit,
  ShippingOptionCreate,
  ShippingProfileList,
  ShippingProfileShow,
  ShippingProfileEdit,
  ShippingProfileCreate,
  FulfillmentProviderList,
  FulfillmentProviderShow,
  FulfillmentProviderEdit,
  FulfillmentProviderCreate,
} from "../admin/resources/shipping/index";

// Regions / Geo
import {
  RegionList,
  RegionShow,
  RegionEdit,
  RegionCreate,
  CountryList,
  CountryShow,
  CountryEdit,
  CountryCreate,
  CurrencyList,
  CurrencyShow,
  CurrencyEdit,
  CurrencyCreate,
} from "../admin/resources/regions/index";

// Misc: sales channels, tax, admin
import {
  SalesChannelList,
  SalesChannelShow,
  SalesChannelEdit,
  SalesChannelCreate,
  TaxRegionList,
  TaxRegionShow,
  TaxRegionEdit,
  TaxRegionCreate,
  TaxRateList,
  TaxRateShow,
  TaxRateEdit,
  TaxRateCreate,
  AdminUserList,
  AdminUserShow,
  AdminUserEdit,
  AdminInvitationList,
  AdminInvitationShow,
  AdminInvitationCreate,
} from "../admin/resources/misc";

export const resources: ResourceProps[] = [
  // ── Admin ─────────────────────────────────────────────────────────────────
  // admin_users: no create — users are onboarded via invitation only
  {
    name: "admin_users",
    icon: Shield,
    list: AdminUserList,
    show: AdminUserShow,
    edit: AdminUserEdit,
  },
  {
    name: "admin_invitations",
    icon: Mail,
    list: AdminInvitationList,
    show: AdminInvitationShow,
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
    show: OrderFulfillmentShow,
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
    show: OrderReturnShow,
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
    show: OrderRefundShow,
    create: OrderRefundCreate,
  },

  // ── Products ──────────────────────────────────────────────────────────────
  {
    name: "products",
    icon: Package,
    list: ProductList,
    show: ProductShow,
    edit: ProductEdit,
    create: ProductCreate,
  },
  {
    name: "product_variants",
    icon: Sliders,
    list: ProductVariantList,
    show: ProductVariantShow,
    edit: ProductVariantEdit,
    create: ProductVariantCreate,
  },
  {
    name: "product_categories",
    icon: Layers,
    list: ProductCategoryList,
    show: ProductCategoryShow,
    edit: ProductCategoryEdit,
    create: ProductCategoryCreate,
  },
  {
    name: "product_collections",
    icon: BookOpen,
    list: ProductCollectionList,
    show: ProductCollectionShow,
    edit: ProductCollectionEdit,
    create: ProductCollectionCreate,
  },
  {
    name: "product_tags",
    icon: Tag,
    list: ProductTagList,
    show: ProductTagShow,
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
    show: CustomerShow,
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
    show: CustomerGroupShow,
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
    show: PriceShow,
    edit: PriceEdit,
    create: PriceCreate,
  },
  {
    name: "price_sets",
    icon: DollarSign,
    list: PriceSetList,
    show: PriceSetShow,
    create: PriceSetCreate,
  },
  {
    name: "price_lists",
    icon: BarChart2,
    list: PriceListList,
    show: PriceListShow,
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
    show: PromotionShow,
    edit: PromotionEdit,
    create: PromotionCreate,
  },
  {
    name: "promotion_rules",
    icon: Settings,
    list: PromotionRuleList,
    show: PromotionRuleShow,
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
    show: InventoryItemShow,
    edit: InventoryItemEdit,
    create: InventoryItemCreate,
  },
  {
    name: "inventory_levels",
    icon: BarChart2,
    list: InventoryLevelList,
    show: InventoryLevelShow,
    edit: InventoryLevelEdit,
    create: InventoryLevelCreate,
  },
  // inventory_reservations: managed by RPCs — read-only
  { name: "inventory_reservations", icon: Warehouse },
  {
    name: "stock_locations",
    icon: Warehouse,
    list: StockLocationList,
    show: StockLocationShow,
    edit: StockLocationEdit,
    create: StockLocationCreate,
  },

  // ── Regions & Geo ─────────────────────────────────────────────────────────
  {
    name: "regions",
    icon: Globe,
    list: RegionList,
    show: RegionShow,
    edit: RegionEdit,
    create: RegionCreate,
  },
  {
    name: "countries",
    icon: MapPin,
    list: CountryList,
    show: CountryShow,
    edit: CountryEdit,
    create: CountryCreate,
  },
  {
    name: "currencies",
    icon: DollarSign,
    list: CurrencyList,
    show: CurrencyShow,
    edit: CurrencyEdit,
    create: CurrencyCreate,
  },

  // ── Shipping ──────────────────────────────────────────────────────────────
  {
    name: "shipping_options",
    icon: Truck,
    list: ShippingOptionList,
    show: ShippingOptionShow,
    edit: ShippingOptionEdit,
    create: ShippingOptionCreate,
  },
  { name: "shipping_option_requirements", icon: Settings },
  {
    name: "shipping_profiles",
    icon: Truck,
    list: ShippingProfileList,
    show: ShippingProfileShow,
    edit: ShippingProfileEdit,
    create: ShippingProfileCreate,
  },
  {
    name: "fulfillment_providers",
    icon: Store,
    list: FulfillmentProviderList,
    show: FulfillmentProviderShow,
    edit: FulfillmentProviderEdit,
    create: FulfillmentProviderCreate,
  },

  // ── Sales Channels ────────────────────────────────────────────────────────
  {
    name: "sales_channels",
    icon: Star,
    list: SalesChannelList,
    show: SalesChannelShow,
    edit: SalesChannelEdit,
    create: SalesChannelCreate,
  },
  { name: "sales_channel_products", icon: Package },

  // ── Tax ───────────────────────────────────────────────────────────────────
  {
    name: "tax_regions",
    icon: Globe,
    list: TaxRegionList,
    show: TaxRegionShow,
    edit: TaxRegionEdit,
    create: TaxRegionCreate,
  },
  {
    name: "tax_rates",
    icon: Percent,
    list: TaxRateList,
    show: TaxRateShow,
    edit: TaxRateEdit,
    create: TaxRateCreate,
  },
  { name: "tax_rate_product_categories", icon: Layers },
];
