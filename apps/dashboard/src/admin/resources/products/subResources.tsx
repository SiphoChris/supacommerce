import {
  List,
  Datagrid,
  TextField,
  DateField,
  BooleanField,
  BooleanInput,
  SearchInput,
  FilterButton,
  TopToolbar,
  CreateButton,
  ExportButton,
  Show,
  SimpleShowLayout,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  NumberInput,
} from "react-admin";

// ─── Product Variants ─────────────────────────────────────────────────────────

const variantFilters = [
  <SearchInput source="title@ilike" alwaysOn placeholder="Search by title" />,
  <SearchInput source="sku@ilike" placeholder="Search by SKU" />,
  <BooleanInput source="manage_inventory" />,
  <BooleanInput source="allow_backorder" />,
];

export function ProductVariantList() {
  return (
    <List
      filters={variantFilters}
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
        <TextField source="title" />
        <TextField source="sku" />
        <TextField source="barcode" />
        <BooleanField source="manage_inventory" />
        <BooleanField source="allow_backorder" />
        <TextField source="rank" />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function ProductVariantShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="title" />
        <TextField source="sku" />
        <TextField source="barcode" />
        <TextField source="ean" />
        <TextField source="upc" />
        <TextField source="weight" />
        <TextField source="length" />
        <TextField source="height" />
        <TextField source="width" />
        <BooleanField source="manage_inventory" />
        <BooleanField source="allow_backorder" />
        <DateField source="created_at" showTime />
        <DateField source="updated_at" showTime />
      </SimpleShowLayout>
    </Show>
  );
}

export function ProductVariantEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="title" required />
        <TextInput source="sku" />
        <TextInput source="barcode" />
        <TextInput source="ean" />
        <TextInput source="upc" />
        <NumberInput source="weight" />
        <NumberInput source="length" />
        <NumberInput source="height" />
        <NumberInput source="width" />
        <BooleanInput source="manage_inventory" />
        <BooleanInput source="allow_backorder" />
        <NumberInput source="rank" />
      </SimpleForm>
    </Edit>
  );
}

export function ProductVariantCreate() {
  return (
    <Create>
      <SimpleForm>
        <ReferenceInput source="product_id" reference="products">
          <AutocompleteInput optionText="title" required />
        </ReferenceInput>
        <TextInput source="title" required />
        <TextInput source="sku" />
        <TextInput source="barcode" />
        <NumberInput source="weight" />
        <BooleanInput source="manage_inventory" defaultValue={true} />
        <BooleanInput source="allow_backorder" defaultValue={false} />
      </SimpleForm>
    </Create>
  );
}

// ─── Product Categories ───────────────────────────────────────────────────────

const categoryFilters = [
  <SearchInput source="name@ilike" alwaysOn placeholder="Search by name" />,
  <SearchInput source="handle@ilike" placeholder="Search by handle" />,
  <BooleanInput source="is_active" label="Active" />,
  <BooleanInput source="is_internal" label="Internal" />,
];

export function ProductCategoryList() {
  return (
    <List
      filters={categoryFilters}
      actions={
        <TopToolbar>
          <FilterButton />
          <CreateButton />
          <ExportButton />
        </TopToolbar>
      }
      sort={{ field: "rank", order: "ASC" }}
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <TextField source="name" />
        <TextField source="handle" />
        <TextField source="description" />
        <BooleanField source="is_active" label="Active" />
        <BooleanField source="is_internal" label="Internal" />
        <TextField source="rank" />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function ProductCategoryShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="name" />
        <TextField source="handle" />
        <TextField source="description" />
        <TextField source="parent_id" label="Parent Category" />
        <BooleanField source="is_active" />
        <BooleanField source="is_internal" />
        <TextField source="rank" />
        <DateField source="created_at" showTime />
        <DateField source="updated_at" showTime />
      </SimpleShowLayout>
    </Show>
  );
}

export function ProductCategoryEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" required />
        <TextInput source="handle" required />
        <TextInput source="description" multiline />
        <ReferenceInput
          source="parent_id"
          reference="product_categories"
          allowEmpty
        >
          <AutocompleteInput optionText="name" label="Parent Category" />
        </ReferenceInput>
        <NumberInput source="rank" />
        <BooleanInput source="is_active" defaultValue={true} />
        <BooleanInput source="is_internal" defaultValue={false} />
      </SimpleForm>
    </Edit>
  );
}

export function ProductCategoryCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" required />
        <TextInput source="handle" required />
        <TextInput source="description" multiline />
        <ReferenceInput
          source="parent_id"
          reference="product_categories"
          allowEmpty
        >
          <AutocompleteInput optionText="name" label="Parent Category" />
        </ReferenceInput>
        <NumberInput source="rank" defaultValue={0} />
        <BooleanInput source="is_active" defaultValue={true} />
        <BooleanInput source="is_internal" defaultValue={false} />
      </SimpleForm>
    </Create>
  );
}

// ─── Product Collections ──────────────────────────────────────────────────────

const collectionFilters = [
  <SearchInput source="title@ilike" alwaysOn placeholder="Search by title" />,
  <SearchInput source="handle@ilike" placeholder="Search by handle" />,
];

export function ProductCollectionList() {
  return (
    <List
      filters={collectionFilters}
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
        <TextField source="title" />
        <TextField source="handle" />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function ProductCollectionShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="title" />
        <TextField source="handle" />
        <DateField source="created_at" showTime />
        <DateField source="updated_at" showTime />
      </SimpleShowLayout>
    </Show>
  );
}

export function ProductCollectionEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="title" required />
        <TextInput source="handle" required />
      </SimpleForm>
    </Edit>
  );
}

export function ProductCollectionCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="title" required />
        <TextInput source="handle" required />
      </SimpleForm>
    </Create>
  );
}

// ─── Product Tags ─────────────────────────────────────────────────────────────

const tagFilters = [
  <SearchInput source="value@ilike" alwaysOn placeholder="Search by tag" />,
];

export function ProductTagList() {
  return (
    <List
      filters={tagFilters}
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
        <TextField source="value" />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function ProductTagShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="value" />
        <DateField source="created_at" showTime />
        <DateField source="updated_at" showTime />
      </SimpleShowLayout>
    </Show>
  );
}

export function ProductTagEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="value" required />
      </SimpleForm>
    </Edit>
  );
}

export function ProductTagCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="value" required />
      </SimpleForm>
    </Create>
  );
}
