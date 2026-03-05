import { useState } from "react";
import { Menu, useSidebarState } from "react-admin";
import {
  Box,
  Collapse,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import { ChevronDown, ChevronRight } from "lucide-react";

import { MENU_GROUPS } from "./menuGroups";

function buildDefaultOpen(): Record<string, boolean> {
  return Object.fromEntries(
    MENU_GROUPS.map((g) => [g.key, g.defaultOpen ?? false]),
  );
}

export function CustomMenu() {
  const [open, setOpen] = useState<Record<string, boolean>>(buildDefaultOpen);
  const [sidebarOpen] = useSidebarState();

  const toggle = (key: string) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <Menu>
      <Menu.DashboardItem />
      <Divider sx={{ my: 1 }} />

      {MENU_GROUPS.map(({ key, label, Icon, resources }) => {
        const isOpen = !!open[key];

        // Sidebar collapsed: show only the group icon, no children
        if (!sidebarOpen) {
          return (
            <Tooltip key={key} title={label} placement="right">
              <ListItemButton
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  px: 1.5,
                  py: 0.75,
                  justifyContent: "center",
                  minWidth: 0,
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, justifyContent: "center" }}>
                  {/* @ts-expect-error lucide icons are valid here */}
                  <Icon size={20} />
                </ListItemIcon>
              </ListItemButton>
            </Tooltip>
          );
        }

        // Sidebar expanded: full group header + collapsible children
        return (
          <Box key={key}>
            <ListItemButton
              onClick={() => toggle(key)}
              sx={{ borderRadius: 1, mx: 1, px: 1.5, py: 0.75 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                {/* @ts-expect-error lucide icons are valid here */}
                <Icon size={16} />
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  variant: "caption",
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  sx: { textTransform: "uppercase", color: "text.secondary" },
                }}
              />
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </ListItemButton>

            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List disablePadding sx={{ pl: 1.5 }}>
                {resources.map((name) => (
                  <Menu.ResourceItem key={name} name={name} />
                ))}
              </List>
            </Collapse>
          </Box>
        );
      })}
    </Menu>
  );
}
