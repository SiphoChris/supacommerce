import { defaultTheme, RaThemeOptions } from "react-admin";
import { deepmerge } from "@mui/utils";

// =============================================================================
// PEP Brand Tokens
// =============================================================================

const PEP_BLUE = "#1180FA";
const PEP_BLUE_DARK = "#0A6AE0";
const PEP_BLUE_LIGHT = "#3A97FB";
const PEP_LIME = "#C8FA32";
const PEP_LIME_DARK = "#AADE20";
const PEP_STEEL = "#3F729B";

// =============================================================================
// Light Theme — white canvas, PEP Blue primary, Lime accents
// =============================================================================

export const pepLightTheme: RaThemeOptions = deepmerge(defaultTheme, {
  palette: {
    mode: "light",
    primary: {
      main: PEP_BLUE,
      dark: PEP_BLUE_DARK,
      light: PEP_BLUE_LIGHT,
      contrastText: "#ffffff",
    },
    secondary: {
      main: PEP_LIME,
      dark: PEP_LIME_DARK,
      light: "#D8FC66",
      contrastText: "#0A1A00",
    },
    background: {
      default: "#F0F6FF",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0A1E36",
      secondary: "#3F729B",
    },
    divider: "#D0E4F7",
    error: { main: "#E53935" },
    warning: { main: "#F59E0B" },
    success: { main: "#16A34A" },
    info: { main: PEP_STEEL },
  },
  typography: {
    fontFamily: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 800, color: PEP_BLUE },
    h5: { fontWeight: 700, color: PEP_BLUE },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    body2: { color: "#3F729B" },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: PEP_BLUE,
          color: "#ffffff",
          boxShadow: "none",
          borderBottom: `3px solid ${PEP_LIME}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#FFFFFF",
          borderRight: "1px solid #D0E4F7",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: "0 1px 4px 0 rgba(17,128,250,0.08)",
          border: "1px solid #D0E4F7",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: { backgroundColor: "#EBF4FF" },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottomColor: "#D0E4F7" },
        head: {
          fontWeight: 700,
          fontSize: "0.75rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase" as const,
          color: PEP_STEEL,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": { backgroundColor: "#EBF4FF !important" },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 700,
          letterSpacing: "0.03em",
          textTransform: "none" as const,
        },
        containedPrimary: {
          backgroundColor: PEP_BLUE,
          "&:hover": { backgroundColor: PEP_BLUE_DARK },
        },
        containedSecondary: {
          backgroundColor: PEP_LIME,
          color: "#0A1A00",
          "&:hover": { backgroundColor: PEP_LIME_DARK },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 5, fontWeight: 600, fontSize: "0.72rem" },
      },
    },
    RaMenuItemLink: {
      styleOverrides: {
        root: {
          borderRadius: 7,
          margin: "1px 8px",
          paddingLeft: 12,
          fontWeight: 500,
          color: "#2C5070",
          "&:hover": { backgroundColor: "#EBF4FF" },
          "&.RaMenuItemLink-active": {
            backgroundColor: `${PEP_BLUE}15`,
            color: PEP_BLUE,
            fontWeight: 700,
            borderLeft: `3px solid ${PEP_LIME}`,
          },
        },
      },
    },
  },
} as RaThemeOptions);

// =============================================================================
// Dark Theme — deep navy canvas, PEP Blue + Lime accents
// =============================================================================

export const pepDarkTheme: RaThemeOptions = deepmerge(defaultTheme, {
  palette: {
    mode: "dark",
    primary: {
      main: PEP_LIME,
      dark: PEP_LIME_DARK,
      light: "#D8FC66",
      contrastText: "#0A1A00",
    },
    secondary: {
      main: PEP_BLUE,
      dark: PEP_BLUE_DARK,
      light: PEP_BLUE_LIGHT,
      contrastText: "#ffffff",
    },
    background: {
      default: "#060F1A",
      paper: "#0C1E30",
    },
    text: {
      primary: "#E8F4FF",
      secondary: "#7AAEC8",
    },
    divider: "#142840",
    error: { main: "#F87171" },
    warning: { main: "#FBBF24" },
    success: { main: "#4ADE80" },
    info: { main: PEP_BLUE_LIGHT },
  },
  typography: {
    fontFamily: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 800, color: PEP_LIME },
    h5: { fontWeight: 700, color: PEP_LIME },
    h6: { fontWeight: 700, color: "#E8F4FF" },
    subtitle1: { fontWeight: 600 },
    body2: { color: "#7AAEC8" },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#0C1E30",
          color: "#E8F4FF",
          boxShadow: "none",
          borderBottom: `3px solid ${PEP_LIME}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#0C1E30",
          borderRight: "1px solid #142840",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: "#0C1E30",
          border: "1px solid #142840",
          boxShadow: "0 2px 8px 0 rgba(0,0,0,0.5)",
          backgroundImage: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#0C1E30",
          border: "1px solid #142840",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: { backgroundColor: "#081525" },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottomColor: "#142840" },
        head: {
          fontWeight: 700,
          fontSize: "0.75rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase" as const,
          color: "#7AAEC8",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": { backgroundColor: "#102030 !important" },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& fieldset": { borderColor: "#142840" },
          "&:hover fieldset": { borderColor: PEP_BLUE },
          "&.Mui-focused fieldset": { borderColor: PEP_LIME },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#7AAEC8",
          "&.Mui-focused": { color: PEP_LIME },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 700,
          letterSpacing: "0.03em",
          textTransform: "none" as const,
        },
        containedPrimary: {
          backgroundColor: PEP_LIME,
          color: "#0A1A00",
          "&:hover": { backgroundColor: PEP_LIME_DARK },
        },
        containedSecondary: {
          backgroundColor: PEP_BLUE,
          color: "#ffffff",
          "&:hover": { backgroundColor: PEP_BLUE_DARK },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 5, fontWeight: 600, fontSize: "0.72rem" },
      },
    },
    RaMenuItemLink: {
      styleOverrides: {
        root: {
          borderRadius: 7,
          margin: "1px 8px",
          paddingLeft: 12,
          fontWeight: 500,
          color: "#7AAEC8",
          "&:hover": {
            backgroundColor: "#102030",
            color: "#E8F4FF",
          },
          "&.RaMenuItemLink-active": {
            backgroundColor: "#102030",
            color: PEP_LIME,
            fontWeight: 700,
            borderLeft: `3px solid ${PEP_LIME}`,
          },
        },
      },
    },
    RaToolbar: {
      styleOverrides: {
        root: {
          backgroundColor: "#0C1E30 !important",
          borderTop: "1px solid #142840",
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          backgroundColor: "#0C1E30",
        },
      },
    },
    RaSaveButton: {
      styleOverrides: {
        root: {
          backgroundColor: PEP_LIME,
          color: "#0A1A00",
          fontWeight: 700,
          "&:hover": { backgroundColor: PEP_LIME_DARK },
        },
      },
    },
  },
} as RaThemeOptions);
