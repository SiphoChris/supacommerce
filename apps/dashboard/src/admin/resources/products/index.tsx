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
  Edit,
  Create,
  SimpleForm,
  TextInput,
  ImageField,
} from "react-admin";
import { StatusChipField, PRODUCT_STATUS } from "../shared";

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
      </TabbedShowLayout>
    </Show>
  );
}

// ─── Edit ─────────────────────────────────────────────────────────────────────

export function ProductEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="title" required />
        <TextInput source="subtitle" />
        <TextInput source="handle" required />
        <TextInput source="description" multiline rows={4} />
        <SelectInput source="status" choices={PRODUCT_STATUS} />
        <TextInput source="thumbnail" label="Thumbnail URL" />
        <BooleanInput source="is_giftcard" label="Gift Card" />
        <BooleanInput source="discountable" />
        <TextInput source="external_id" />
      </SimpleForm>
    </Edit>
  );
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function ProductCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="title" required />
        <TextInput source="subtitle" />
        <TextInput source="handle" required />
        <TextInput source="description" multiline rows={4} />
        <SelectInput
          source="status"
          choices={PRODUCT_STATUS}
          defaultValue="draft"
        />
        <TextInput source="thumbnail" label="Thumbnail URL" />
        <BooleanInput
          source="is_giftcard"
          label="Gift Card"
          defaultValue={false}
        />
        <BooleanInput source="discountable" defaultValue={true} />
      </SimpleForm>
    </Create>
  );
}
