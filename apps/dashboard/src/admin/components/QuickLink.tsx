import { Link } from "react-admin";
import { Box, Card, CardActionArea, Typography } from "@mui/material";
import type { ElementType } from "react";

type Props = {
  label: string;
  to: string;
  Icon: ElementType;
  description: string;
};

export function QuickLink({ label, to, Icon, description }: Props) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <CardActionArea
        component={Link as any}
        to={to}
        sx={{ height: "100%", p: 2 }}
      >
        <Box display="flex" alignItems="flex-start" gap={1.5}>
          <Box
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              borderRadius: 1,
              p: 0.75,
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={16} color="currentColor" />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
}
