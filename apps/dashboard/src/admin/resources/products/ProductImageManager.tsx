import { useState, useCallback, useRef } from "react";
import {
  useRecordContext,
  useDataProvider,
  useNotify,
  Confirm,
} from "react-admin";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Stack,
  LinearProgress,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { supabaseClient } from "../../../App";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];
const MAX_FILE_SIZE_MB = 10;

type UploadStatus = "pending" | "uploading" | "done" | "error";

interface PendingFile {
  id: string;
  file: File;
  preview: string;
  status: UploadStatus;
  error?: string;
  progress?: number;
}

interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  rank: number;
}

export function ProductImageManager() {
  const record = useRecordContext();
  const dataProvider = useDataProvider();
  const notify = useNotify();

  const [existingImages, setExistingImages] = useState<ProductImage[] | null>(
    null,
  );
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (existingImages === null && !loadingExisting && record?.id) {
    setLoadingExisting(true);
    dataProvider
      .getList("product_images", {
        pagination: { page: 1, perPage: 100 },
        sort: { field: "rank", order: "ASC" },
        filter: { product_id: record.id },
      })
      .then(({ data }) => {
        setExistingImages(data as ProductImage[]);
        setLoadingExisting(false);
      })
      .catch(() => {
        setExistingImages([]);
        setLoadingExisting(false);
      });
  }

  const uploadFile = useCallback(
    async (pending: PendingFile) => {
      if (!record?.id) return;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      setPendingFiles((prev) =>
        prev.map((f) =>
          f.id === pending.id ? { ...f, status: "uploading" } : f,
        ),
      );

      try {
        const {
          data: { session },
        } = await supabaseClient.auth.getSession();
        console.log("session", session);
        const token = session?.access_token ?? supabaseKey;
        console.log("token being sent", token);

        const formData = new FormData();
        formData.append("file", pending.file);
        formData.append("bucket", "products");
        formData.append("path", "images");

        const res = await fetch(`${supabaseUrl}/functions/v1/storage-upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        // ... rest unchanged

        const json = await res.json();
        if (!res.ok || !json.url)
          throw new Error(json.error ?? "Upload failed");

        const nextRank =
          (existingImages?.length ?? 0) +
          pendingFiles.filter((f) => f.status === "done").length;
        await dataProvider.create("product_images", {
          data: {
            product_id: record.id,
            url: json.url,
            alt: pending.file.name
              .replace(/\.[^.]+$/, "")
              .replace(/[_-]/g, " "),
            rank: nextRank,
          },
        });

        setPendingFiles((prev) =>
          prev.map((f) => (f.id === pending.id ? { ...f, status: "done" } : f)),
        );

        const { data } = await dataProvider.getList("product_images", {
          pagination: { page: 1, perPage: 100 },
          sort: { field: "rank", order: "ASC" },
          filter: { product_id: record.id },
        });
        setExistingImages(data as ProductImage[]);
      } catch (err) {
        setPendingFiles((prev) =>
          prev.map((f) =>
            f.id === pending.id
              ? {
                  ...f,
                  status: "error",
                  error: err instanceof Error ? err.message : "Upload failed",
                }
              : f,
          ),
        );
      }
    },
    [record?.id, dataProvider, existingImages, pendingFiles],
  );

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const valid: PendingFile[] = [];

      for (const file of Array.from(files)) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          notify(`${file.name}: unsupported file type`, { type: "warning" });
          continue;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          notify(`${file.name}: exceeds ${MAX_FILE_SIZE_MB}MB limit`, {
            type: "warning",
          });
          continue;
        }
        valid.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: URL.createObjectURL(file),
          status: "pending",
        });
      }

      if (valid.length === 0) return;

      setPendingFiles((prev) => [...prev, ...valid]);

      for (const pending of valid) {
        uploadFile(pending);
      }
    },
    [uploadFile, notify],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const handleDelete = useCallback(
    async (image: ProductImage) => {
      await dataProvider.delete("product_images", {
        id: image.id,
        previousData: image,
      });
      setExistingImages((prev) => prev?.filter((i) => i.id !== image.id) ?? []);
      setDeleteTarget(null);
      notify("Image deleted", { type: "success" });
    },
    [dataProvider, notify],
  );

  const clearDone = useCallback(() => {
    setPendingFiles((prev) => prev.filter((f) => f.status !== "done"));
  }, []);

  if (!record?.id) {
    return (
      <Typography variant="caption" color="text.secondary">
        Save the product first, then add images.
      </Typography>
    );
  }

  const uploading = pendingFiles.some((f) => f.status === "uploading");
  const doneCount = pendingFiles.filter((f) => f.status === "done").length;
  const errorCount = pendingFiles.filter((f) => f.status === "error").length;

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
        Product Images
      </Typography>

      {loadingExisting ? (
        <CircularProgress size={20} sx={{ mb: 2 }} />
      ) : existingImages && existingImages.length > 0 ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
          {existingImages.map((img) => (
            <Box
              key={img.id}
              sx={{
                position: "relative",
                width: 100,
                height: 100,
                borderRadius: 1,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                "&:hover .delete-btn": { opacity: 1 },
              }}
            >
              <img
                src={img.url}
                alt={img.alt ?? ""}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <IconButton
                className="delete-btn"
                size="small"
                onClick={() => setDeleteTarget(img)}
                sx={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  opacity: 0,
                  transition: "opacity 0.15s",
                  bgcolor: "rgba(0,0,0,0.55)",
                  color: "white",
                  "&:hover": { bgcolor: "error.main" },
                  p: 0.5,
                }}
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 2 }}
        >
          No images yet.
        </Typography>
      )}

      <Box
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        sx={{
          border: "2px dashed",
          borderColor: isDragOver ? "primary.main" : "divider",
          borderRadius: 2,
          p: 3,
          textAlign: "center",
          cursor: "pointer",
          bgcolor: isDragOver ? "action.hover" : "background.paper",
          transition: "all 0.15s",
          "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
          maxWidth: 480,
        }}
      >
        <CloudUploadIcon
          sx={{ fontSize: 36, color: "text.secondary", mb: 1 }}
        />
        <Typography variant="body2" color="text.secondary">
          Drag & drop images here, or <strong>click to browse</strong>
        </Typography>
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ mt: 0.5, display: "block" }}
        >
          JPEG, PNG, WebP, GIF, SVG · Max {MAX_FILE_SIZE_MB}MB each · Multiple
          files supported
        </Typography>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          multiple
          hidden
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </Box>

      {pendingFiles.length > 0 && (
        <Box sx={{ mt: 2, maxWidth: 480 }}>
          {uploading && <LinearProgress sx={{ mb: 1, borderRadius: 1 }} />}

          <Stack spacing={0.75}>
            {pendingFiles.map((f) => (
              <Stack key={f.id} direction="row" alignItems="center" spacing={1}>
                <img
                  src={f.preview}
                  alt=""
                  style={{
                    width: 32,
                    height: 32,
                    objectFit: "cover",
                    borderRadius: 4,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {f.file.name}
                </Typography>
                {f.status === "uploading" && <CircularProgress size={14} />}
                {f.status === "done" && (
                  <CheckCircleIcon
                    sx={{ fontSize: 16, color: "success.main" }}
                  />
                )}
                {f.status === "error" && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <ErrorIcon sx={{ fontSize: 16, color: "error.main" }} />
                    <Typography variant="caption" color="error">
                      {f.error}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            ))}
          </Stack>

          {!uploading && (doneCount > 0 || errorCount > 0) && (
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {doneCount > 0 && (
                <Chip
                  label={`${doneCount} uploaded`}
                  size="small"
                  color="success"
                  onClick={clearDone}
                  onDelete={clearDone}
                />
              )}
              {errorCount > 0 && (
                <Chip
                  label={`${errorCount} failed`}
                  size="small"
                  color="error"
                />
              )}
            </Stack>
          )}
        </Box>
      )}

      <Confirm
        isOpen={!!deleteTarget}
        title="Delete image"
        content="Are you sure you want to delete this image? This cannot be undone."
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
