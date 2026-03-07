import { useState, useEffect, useCallback } from "react";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  BooleanField,
  BooleanInput,
  SearchInput,
  SelectInput,
  FilterButton,
  TopToolbar,
  CreateButton,
  ExportButton,
  Show,
  TabbedShowLayout,
  ReferenceManyField,
  ReferenceField,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  ImageField,
  useDataProvider,
  useRecordContext,
  useNotify,
} from "react-admin";
import {
  Autocomplete,
  TextField as MuiTextField,
  Chip,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { StatusChipField, PRODUCT_STATUS, ImageUploadInput } from "../shared";
import { ProductImageManager } from "./ProductImageManager";

// ─── Filters ──────────────────────────────────────────────────────────────────

const filters = [
  <SearchInput source="title@ilike" alwaysOn placeholder="Search by title" />,
  <SearchInput source="handle@ilike" placeholder="Search by handle" />,
  <SelectInput source="status" choices={PRODUCT_STATUS} />,
  <BooleanInput source="is_giftcard" label="Gift Card" />,
  <BooleanInput source="discountable" />,
];

// ─── List ─────────────────────────────────────────────────────────────────────

export function ProductList() {
  return (
    <List
      filters={filters}
      actions={
        <TopToolbar>
          <FilterButton />
          <CreateButton />
          <ExportButton />
        </TopToolbar>
      }
      sort={{ field: "created_at", order: "DESC" }}
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <ImageField
          source="thumbnail"
          label=""
          sx={{
            "& img": {
              width: 40,
              height: 40,
              objectFit: "cover",
              borderRadius: 1,
            },
          }}
        />
        <TextField source="title" />
        <TextField source="handle" />
        <StatusChipField source="status" />
        <BooleanField source="is_giftcard" label="Gift Card" />
        <BooleanField source="discountable" />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

// ─── Show ─────────────────────────────────────────────────────────────────────

export function ProductShow() {
  return (
    <Show>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="Details">
          <ImageField source="thumbnail" />
          <TextField source="title" />
          <TextField source="subtitle" />
          <TextField source="handle" />
          <TextField source="description" />
          <StatusChipField source="status" />
          <BooleanField source="is_giftcard" label="Gift Card" />
          <BooleanField source="discountable" />
          <TextField source="external_id" />
          <DateField source="created_at" showTime />
          <DateField source="updated_at" showTime />
        </TabbedShowLayout.Tab>

        <TabbedShowLayout.Tab label="Variants">
          <ReferenceManyField
            reference="product_variants"
            target="product_id"
            label={false}
          >
            <Datagrid bulkActionButtons={false} rowClick="show">
              <TextField source="title" />
              <TextField source="sku" />
              <TextField source="barcode" />
              <BooleanField source="manage_inventory" />
              <BooleanField source="allow_backorder" />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>

        <TabbedShowLayout.Tab label="Images">
          <ReferenceManyField
            reference="product_images"
            target="product_id"
            label={false}
          >
            <Datagrid bulkActionButtons={false} rowClick="edit">
              <ImageField
                source="url"
                sx={{
                  "& img": {
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 1,
                  },
                }}
              />
              <TextField source="alt" />
              <TextField source="rank" />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>

        <TabbedShowLayout.Tab label="Options">
          <ReferenceManyField
            reference="product_options"
            target="product_id"
            label={false}
          >
            <Datagrid bulkActionButtons={false} rowClick="show">
              <TextField source="title" />
              <TextField source="rank" />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>

        <TabbedShowLayout.Tab label="Categories">
          <ReferenceManyField
            reference="product_category_products"
            target="product_id"
            label={false}
          >
            <Datagrid bulkActionButtons={false}>
              <ReferenceField
                source="category_id"
                reference="product_categories"
                link="show"
              >
                <TextField source="name" />
              </ReferenceField>
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>

        <TabbedShowLayout.Tab label="Collections">
          <ReferenceManyField
            reference="product_collection_products"
            target="product_id"
            label={false}
          >
            <Datagrid bulkActionButtons={false}>
              <ReferenceField
                source="collection_id"
                reference="product_collections"
                link="show"
              >
                <TextField source="title" />
              </ReferenceField>
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>

        <TabbedShowLayout.Tab label="Tags">
          <ReferenceManyField
            reference="product_tag_products"
            target="product_id"
            label={false}
          >
            <Datagrid bulkActionButtons={false}>
              <ReferenceField
                source="tag_id"
                reference="product_tags"
                link={false}
              >
                <TextField source="value" />
              </ReferenceField>
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
}

// ─── JunctionManyInput ────────────────────────────────────────────────────────
//
// Handles many-to-many relationships through a junction table.
// On an existing product (Edit), it reads current rows from the junction table,
// shows them as chips, and on save it deletes removed rows and creates new ones.
// On Create it does nothing (product_id doesn't exist yet) — manage from Edit.

type JunctionOption = { id: string; label: string };

function JunctionManyInput({
  label,
  junctionResource, // e.g. "product_category_products"
  junctionForeignKey, // e.g. "category_id"
  lookupResource, // e.g. "product_categories"
  optionText, // field to show in dropdown, e.g. "name"
}: {
  label: string;
  junctionResource: string;
  junctionForeignKey: string;
  lookupResource: string;
  optionText: string;
}) {
  const record = useRecordContext();
  const dataProvider = useDataProvider();
  const notify = useNotify();

  const [options, setOptions] = useState<JunctionOption[]>([]);
  const [selected, setSelected] = useState<JunctionOption[]>([]);
  const [currentJunctionRows, setCurrentJunctionRows] = useState<
    { id: string; foreignId: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Load all available options from the lookup table
  useEffect(() => {
    dataProvider
      .getList(lookupResource, {
        pagination: { page: 1, perPage: 200 },
        sort: { field: optionText, order: "ASC" },
        filter: {},
      })
      .then(({ data }) => {
        setOptions(
          data.map((r: Record<string, unknown>) => ({
            id: r.id as string,
            label: r[optionText] as string,
          })),
        );
      });
  }, [lookupResource, optionText, dataProvider]);

  // Load current junction rows for this product
  useEffect(() => {
    if (!record?.id) {
      setLoading(false);
      return;
    }
    dataProvider
      .getList(junctionResource, {
        pagination: { page: 1, perPage: 200 },
        sort: { field: "id", order: "ASC" },
        filter: { product_id: record.id },
      })
      .then(({ data }) => {
        const rows = data.map((r: Record<string, unknown>) => ({
          id: r.id as string,
          foreignId: r[junctionForeignKey] as string,
        }));
        setCurrentJunctionRows(rows);
        // Match to options labels once options are loaded
        setSelected(
          rows.map((r) => {
            const opt = options.find((o) => o.id === r.foreignId);
            return { id: r.foreignId, label: opt?.label ?? r.foreignId };
          }),
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.id, junctionResource, junctionForeignKey]);

  // Re-resolve labels once options are loaded
  useEffect(() => {
    if (options.length === 0) return;
    setSelected((prev) =>
      prev.map((s) => {
        const opt = options.find((o) => o.id === s.id);
        return opt ? { id: s.id, label: opt.label } : s;
      }),
    );
  }, [options]);

  const handleChange = useCallback(
    async (_: unknown, newValue: JunctionOption[]) => {
      if (!record?.id) return;

      const addedIds = newValue
        .filter((v) => !selected.find((s) => s.id === v.id))
        .map((v) => v.id);
      const removedIds = selected
        .filter((s) => !newValue.find((v) => v.id === s.id))
        .map((s) => s.id);

      // Delete removed junction rows
      for (const foreignId of removedIds) {
        const row = currentJunctionRows.find((r) => r.foreignId === foreignId);
        if (row) {
          await dataProvider.delete(junctionResource, {
            id: row.id,
            previousData: row,
          });
          setCurrentJunctionRows((prev) => prev.filter((r) => r.id !== row.id));
        }
      }

      // Create new junction rows
      for (const foreignId of addedIds) {
        const created = await dataProvider.create(junctionResource, {
          data: { product_id: record.id, [junctionForeignKey]: foreignId },
        });
        setCurrentJunctionRows((prev) => [
          ...prev,
          { id: created.data.id, foreignId },
        ]);
      }

      setSelected(newValue);
      notify(`${label} updated`, { type: "success" });
    },
    [
      record?.id,
      selected,
      currentJunctionRows,
      junctionResource,
      junctionForeignKey,
      dataProvider,
      notify,
      label,
    ],
  );

  // On Create the record doesn't exist yet — hide entirely, manage from Edit
  if (!record?.id) return null;

  return (
    <Box sx={{ mb: 2, maxWidth: 500 }}>
      {loading ? (
        <CircularProgress size={20} />
      ) : (
        <Autocomplete
          multiple
          options={options}
          value={selected}
          getOptionLabel={(o) => o.label}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          onChange={handleChange}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                key={index}
                label={option.label}
                size="small"
                {...getTagProps({ index })}
              />
            ))
          }
          renderInput={(params) => (
            <MuiTextField {...params} label={label} size="small" />
          )}
        />
      )}
    </Box>
  );
}

// ─── Shared form fields ───────────────────────────────────────────────────────

function ProductFormFields({ isCreate = false }: { isCreate?: boolean }) {
  return (
    <>
      <TextInput source="title" required fullWidth />
      <TextInput source="subtitle" fullWidth />
      <TextInput
        source="handle"
        required
        fullWidth
        helperText="URL-safe identifier, e.g. my-product"
      />
      <TextInput source="description" multiline rows={4} fullWidth />
      <SelectInput
        source="status"
        choices={PRODUCT_STATUS}
        defaultValue={isCreate ? "draft" : undefined}
      />
      <ImageUploadInput
        source="thumbnail"
        bucket="products"
        path="thumbnails"
        label="Thumbnail"
      />
      <BooleanInput
        source="is_giftcard"
        label="Gift Card"
        defaultValue={false}
      />
      <BooleanInput source="discountable" defaultValue={true} />
      <TextInput source="external_id" />

      <JunctionManyInput
        label="Categories"
        junctionResource="product_category_products"
        junctionForeignKey="category_id"
        lookupResource="product_categories"
        optionText="name"
      />
      <JunctionManyInput
        label="Collections"
        junctionResource="product_collection_products"
        junctionForeignKey="collection_id"
        lookupResource="product_collections"
        optionText="title"
      />
      <JunctionManyInput
        label="Tags"
        junctionResource="product_tag_products"
        junctionForeignKey="tag_id"
        lookupResource="product_tags"
        optionText="value"
      />
    </>
  );
}

// ─── Edit ─────────────────────────────────────────────────────────────────────

export function ProductEdit() {
  return (
    <Edit>
      <SimpleForm>
        <ProductFormFields />
        <ProductImageManager />
      </SimpleForm>
    </Edit>
  );
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function ProductCreate() {
  return (
    <Create>
      <SimpleForm>
        <ProductFormFields isCreate />
      </SimpleForm>
    </Create>
  );
}
