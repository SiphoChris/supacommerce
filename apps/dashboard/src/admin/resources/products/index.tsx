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
  ReferenceArrayInput,
  AutocompleteArrayInput,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  ImageField,
} from "react-admin";
import { StatusChipField, PRODUCT_STATUS, ImageUploadInput } from "../shared";

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
            <Datagrid bulkActionButtons={false}>
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

// ─── Shared form fields ───────────────────────────────────────────────────────
// Categories, collections, and tags are junction tables — react-admin handles
// them via ReferenceArrayInput + AutocompleteArrayInput which reads/writes the
// junction table automatically when the dataProvider supports many-to-many.
// The source uses the junction table resource name and the foreign key array.

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

      {/* Categories — many-to-many via product_category_products */}
      <ReferenceArrayInput
        source="category_ids"
        reference="product_categories"
        label="Categories"
      >
        <AutocompleteArrayInput optionText="name" />
      </ReferenceArrayInput>

      {/* Collections — many-to-many via product_collection_products */}
      <ReferenceArrayInput
        source="collection_ids"
        reference="product_collections"
        label="Collections"
      >
        <AutocompleteArrayInput optionText="title" />
      </ReferenceArrayInput>

      {/* Tags — many-to-many via product_tag_products */}
      <ReferenceArrayInput
        source="tag_ids"
        reference="product_tags"
        label="Tags"
      >
        <AutocompleteArrayInput optionText="value" />
      </ReferenceArrayInput>
    </>
  );
}

// ─── Edit ─────────────────────────────────────────────────────────────────────

export function ProductEdit() {
  return (
    <Edit>
      <SimpleForm>
        <ProductFormFields />
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
