import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

const instanceUrl = import.meta.env.VITE_SUPABASE_URL;
const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(instanceUrl, apiKey);

type Invitation = {
  id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
};

type Step =
  | "loading"
  | "invalid"
  | "expired"
  | "already_accepted"
  | "form"
  | "success";

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [step, setStep] = useState<Step>("loading");
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Validate token on mount ──────────────────────────────────────────────

  useEffect(() => {
    if (!token) {
      setStep("invalid");
      return;
    }

    async function validate() {
      const { data, error } = await supabase
        .from("admin_invitations")
        .select("*")
        .eq("token", token)
        .single();

      if (error || !data) {
        setStep("invalid");
        return;
      }

      if (data.accepted_at) {
        setStep("already_accepted");
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setStep("expired");
        return;
      }

      setInvitation(data);
      setStep("form");
    }

    validate();
  }, [token]);

  // ── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!invitation) return;
    if (!firstName.trim() || !lastName.trim() || password.length < 8) {
      setError(
        "Please fill in all fields. Password must be at least 8 characters.",
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1. Create Supabase Auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName },
        },
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error("Failed to create account.");

      // 2. Insert admin_users row
      const { error: insertError } = await supabase.from("admin_users").insert({
        user_id: authData.user.id,
        email: invitation.email,
        first_name: firstName,
        last_name: lastName,
        role: invitation.role,
        is_active: true,
      });

      if (insertError) throw new Error(insertError.message);

      // 3. Stamp accepted_at on the invitation
      const { error: updateError } = await supabase
        .from("admin_invitations")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invitation.id);

      if (updateError) throw new Error(updateError.message);

      setStep("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#0f0f0f",
        p: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 420,
          bgcolor: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: 2,
          p: 4,
        }}
      >
        {/* Loading */}
        {step === "loading" && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
            py={4}
          >
            <CircularProgress size={32} sx={{ color: "#fff" }} />
            <Typography color="grey.400" variant="body2">
              Validating your invitation…
            </Typography>
          </Box>
        )}

        {/* Invalid */}
        {step === "invalid" && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
            py={2}
          >
            <XCircle size={40} color="#ef4444" />
            <Typography variant="h6" color="white" fontWeight={700}>
              Invalid invitation
            </Typography>
            <Typography color="grey.400" variant="body2" textAlign="center">
              This invitation link is invalid or doesn't exist.
            </Typography>
          </Box>
        )}

        {/* Expired */}
        {step === "expired" && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
            py={2}
          >
            <XCircle size={40} color="#f59e0b" />
            <Typography variant="h6" color="white" fontWeight={700}>
              Invitation expired
            </Typography>
            <Typography color="grey.400" variant="body2" textAlign="center">
              This invitation has expired. Ask an admin to send a new one.
            </Typography>
          </Box>
        )}

        {/* Already accepted */}
        {step === "already_accepted" && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
            py={2}
          >
            <CheckCircle2 size={40} color="#22c55e" />
            <Typography variant="h6" color="white" fontWeight={700}>
              Already accepted
            </Typography>
            <Typography color="grey.400" variant="body2" textAlign="center">
              This invitation has already been used.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate("/")}
              sx={{ mt: 1, color: "white", borderColor: "#3a3a3a" }}
            >
              Go to login
            </Button>
          </Box>
        )}

        {/* Form */}
        {step === "form" && invitation && (
          <Box display="flex" flexDirection="column" gap={3}>
            <Box>
              <Typography variant="h6" color="white" fontWeight={700} mb={0.5}>
                Accept invitation
              </Typography>
              <Typography color="grey.500" variant="body2">
                You've been invited as{" "}
                <Box
                  component="span"
                  sx={{ color: "grey.300", fontWeight: 600 }}
                >
                  {invitation.role.replace(/_/g, " ")}
                </Box>
              </Typography>
            </Box>

            <TextField
              label="Email"
              value={invitation.email}
              disabled
              size="small"
              InputProps={{ sx: { color: "grey.500" } }}
              sx={fieldSx}
            />

            <Box display="flex" gap={1.5}>
              <TextField
                label="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                size="small"
                fullWidth
                sx={fieldSx}
              />
              <TextField
                label="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                size="small"
                fullWidth
                sx={fieldSx}
              />
            </Box>

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="small"
              helperText="Minimum 8 characters"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                      size="small"
                      sx={{ color: "grey.500" }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />

            {error && (
              <Alert
                severity="error"
                sx={{ bgcolor: "#2a1a1a", color: "#fca5a5" }}
              >
                {error}
              </Alert>
            )}

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting}
              sx={{
                bgcolor: "white",
                color: "black",
                fontWeight: 700,
                "&:hover": { bgcolor: "grey.200" },
                "&:disabled": { bgcolor: "grey.700", color: "grey.500" },
              }}
            >
              {submitting ? (
                <CircularProgress size={18} sx={{ color: "grey.500" }} />
              ) : (
                "Create account"
              )}
            </Button>
          </Box>
        )}

        {/* Success */}
        {step === "success" && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
            py={2}
          >
            <CheckCircle2 size={40} color="#22c55e" />
            <Typography variant="h6" color="white" fontWeight={700}>
              Account created!
            </Typography>
            <Typography color="grey.400" variant="body2" textAlign="center">
              Your admin account is ready. You can now log in.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/")}
              sx={{ mt: 1, bgcolor: "white", color: "black", fontWeight: 700 }}
            >
              Go to login
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ── Shared MUI dark field styles ─────────────────────────────────────────────

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "white",
    "& fieldset": { borderColor: "#2a2a2a" },
    "&:hover fieldset": { borderColor: "#3a3a3a" },
    "&.Mui-focused fieldset": { borderColor: "#555" },
  },
  "& .MuiInputLabel-root": { color: "grey.500" },
  "& .MuiFormHelperText-root": { color: "grey.600" },
  "& .Mui-disabled": { WebkitTextFillColor: "#555 !important" },
};
