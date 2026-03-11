import { useGetList } from "react-admin";
import { Box, Grid, Typography } from "@mui/material";
import {
  ShoppingCart,
  Package,
  Users,
  Percent,
  Warehouse,
  DollarSign,
} from "lucide-react";

import { StatCard } from "../components/StatCard";
import { QuickLink } from "../components/QuickLink";
import { RecentOrdersTable } from "./RecentOrdersTable";

const QUICK_LINKS = [
  {
    label: "Orders",
    to: "/orders",
    Icon: ShoppingCart,
    description: "View and manage orders",
  },
  {
    label: "Add Product",
    to: "/products/create",
    Icon: Package,
    description: "Add a product to your catalog",
  },
  {
    label: "Add Customer",
    to: "/customers/create",
    Icon: Users,
    description: "Register a new customer",
  },
  {
    label: "Promotions",
    to: "/promotions",
    Icon: Percent,
    description: "View and edit active promotions",
  },
  {
    label: "Inventory",
    to: "/inventory_items",
    Icon: Warehouse,
    description: "Check stock levels",
  },
  {
    label: "Price Lists",
    to: "/price_lists",
    Icon: DollarSign,
    description: "Manage pricing rules",
  },
];

export function Dashboard() {
  const { total: orderCount } = useGetList("orders", {
    pagination: { page: 1, perPage: 1 },
  });
  const { total: customerCount } = useGetList("customers", {
    pagination: { page: 1, perPage: 1 },
  });
  const { total: productCount } = useGetList("products", {
    pagination: { page: 1, perPage: 1 },
  });

  return (
    <Box p={3}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome back. Here&apo;s what&apos;s going on.
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            label="Total Orders"
            value={orderCount ?? "—"}
            Icon={ShoppingCart}
            color="#1976d2"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            label="Customers"
            value={customerCount ?? "—"}
            Icon={Users}
            color="#388e3c"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            label="Products"
            value={productCount ?? "—"}
            Icon={Package}
            color="#F28500"
          />
        </Grid>
      </Grid>

      {/* Quick actions */}
      <Typography
        variant="caption"
        fontWeight={700}
        color="text.secondary"
        sx={{
          textTransform: "uppercase",
          letterSpacing: 0.5,
          display: "block",
          mb: 1.5,
        }}
      >
        Quick Actions
      </Typography>
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {QUICK_LINKS.map((q) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={q.to}>
            <QuickLink {...q} />
          </Grid>
        ))}
      </Grid>

      {/* Recent orders */}
      <RecentOrdersTable />
    </Box>
  );
}
