import { useGetList, Link } from "react-admin";
import { Box, Card, CardContent, Chip, Typography } from "@mui/material";
import { Clock, ExternalLink } from "lucide-react";

export function RecentOrdersTable() {
  const { data, isLoading } = useGetList("orders", {
    pagination: { page: 1, perPage: 8 },
    sort: { field: "created_at", order: "DESC" },
  });

  return (
    <Card variant="outlined">
      <CardContent>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Clock size={16} />
            <Typography variant="subtitle1" fontWeight={700}>
              Recent Orders
            </Typography>
          </Box>
          <Link to="/orders" style={{ textDecoration: "none" }}>
            <Chip
              label="View all"
              size="small"
              icon={<ExternalLink size={12} />}
              clickable
            />
          </Link>
        </Box>

        {isLoading ? (
          <Typography variant="body2" color="text.secondary">
            Loading…
          </Typography>
        ) : !data?.length ? (
          <Typography variant="body2" color="text.secondary">
            No orders yet.
          </Typography>
        ) : (
          <Box
            component="table"
            sx={{
              width: "100%",
              borderCollapse: "collapse",
              "& th": {
                textAlign: "left",
                py: 1,
                px: 1.5,
                fontSize: 12,
                fontWeight: 600,
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                borderBottom: "1px solid",
                borderColor: "divider",
              },
              "& td": {
                py: 1,
                px: 1.5,
                fontSize: 13,
                borderBottom: "1px solid",
                borderColor: "divider",
              },
              "& tr:last-child td": { borderBottom: "none" },
            }}
          >
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Customer</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {data.map((order: any) => (
                <tr key={order.id}>
                  <td>
                    <Link
                      to={`/orders/${order.id}/show`}
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                        fontWeight: 600,
                      }}
                    >
                      #{String(order.id).slice(0, 8)}
                    </Link>
                  </td>
                  <td>
                    <Chip
                      label={order.status ?? "—"}
                      size="small"
                      color={
                        order.status === "completed"
                          ? "success"
                          : order.status === "pending"
                            ? "warning"
                            : "default"
                      }
                    />
                  </td>
                  <td>{order.customer_id ?? "Guest"}</td>
                  <td>
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
