import { Box, Card, CardContent, Typography } from "@mui/material";
import type { ElementType } from "react";

type Props = {
  label: string;
  value: string | number;
  Icon: ElementType;
  color: string;
};

export function StatCard({ label, value, Icon, color }: Props) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        "&:hover .icon-halo": {
          transform: "scale(1.6)",
          opacity: 0.2,
        },
        "&:hover .icon-box": {
          bgcolor: `${color}44`,
        },
      }}
    >
      <CardContent>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
        >
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>

          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
            }}
          >
            {/* Animated halo */}
            <Box
              className="icon-halo"
              sx={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                bgcolor: color,
                opacity: 0.1,
                transform: "scale(1)",
                transition: "transform 0.35s ease, opacity 0.35s ease",
                pointerEvents: "none",
              }}
            />
            {/* Icon box */}
            <Box
              className="icon-box"
              sx={{
                position: "relative",
                bgcolor: `${color}33`,
                border: `1px solid ${color}55`,
                borderRadius: 1,
                p: 0.75,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 0.25s ease",
              }}
            >
              <Icon size={16} color={color} />
            </Box>
          </Box>
        </Box>

        <Typography variant="h5" fontWeight={700}>
          {value ?? "—"}
        </Typography>
      </CardContent>
    </Card>
  );
}
