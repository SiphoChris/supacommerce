import {
  List,
  Datagrid,
  TextField,
  DateField,
  NumberField,
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
  SimpleShowLayout,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  ReferenceInput,
  AutocompleteInput,
} from "react-admin";
import { StatusChipField, RESERVATION_STATUS } from "../shared";

// ─── Inventory Items ──────────────────────────────────────────────────────────

const itemFilters = [
  <SearchInput source="sku@ilike" alwaysOn placeholder="Search by SKU" />,
  <BooleanInput source="requires_shipping" />,
];

export function InventoryItemList() {
  return (
    <List
      filters={itemFilters}
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
        <TextField source="sku" />
        <TextField source="description" />
        <TextField source="variant_id" label="Variant" />
        <BooleanField source="requires_shipping" />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function InventoryItemShow() {
  return (
    <Show>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="Details">
          <TextField source="sku" />
          <TextField source="description" />
          <TextField source="variant_id" />
          <BooleanField source="requires_shipping" />
          <NumberField source="weight" />
          <NumberField source="length" />
          <NumberField source="height" />
          <NumberField source="width" />
          <DateField source="created_at" showTime />
          <DateField source="updated_at" showTime />
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Levels">
          <ReferenceManyField
            reference="inventory_levels"
            target="inventory_item_id"
            label={false}
          >
            <Datagrid bulkActionButtons={false}>
              <TextField source="location_id" label="Location" />
              <NumberField source="stocked_quantity" />
              <NumberField source="reserved_quantity" />
              <NumberField source="incoming_quantity" />
              <NumberField source="quantity_available" />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
}

export function InventoryItemEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="sku" />
        <TextInput source="description" multiline />
        <BooleanInput source="requires_shipping" />
        <NumberInput source="weight" />
        <NumberInput source="length" />
        <NumberInput source="height" />
        <NumberInput source="width" />
      </SimpleForm>
    </Edit>
  );
}

export function InventoryItemCreate() {
  return (
    <Create>
      <SimpleForm>
        <ReferenceInput
          source="variant_id"
          reference="product_variants"
          allowEmpty
        >
          <AutocompleteInput optionText="title" />
        </ReferenceInput>
        <TextInput source="sku" />
        <TextInput source="description" multiline />
        <BooleanInput source="requires_shipping" defaultValue={true} />
        <NumberInput source="weight" />
        <NumberInput source="length" />
        <NumberInput source="height" />
        <NumberInput source="width" />
      </SimpleForm>
    </Create>
  );
}

// ─── Inventory Levels ─────────────────────────────────────────────────────────

export function InventoryLevelList() {
  return (
    <List sort={{ field: "updated_at", order: "DESC" }}>
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <TextField source="inventory_item_id" label="Item" />
        <TextField source="location_id" label="Location" />
        <NumberField source="stocked_quantity" />
        <NumberField source="reserved_quantity" />
        <NumberField source="incoming_quantity" />
        <NumberField source="quantity_available" />
        <DateField source="updated_at" showTime />
      </Datagrid>
    </List>
  );
}

export function InventoryLevelShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="inventory_item_id" />
        <TextField source="location_id" />
        <NumberField source="stocked_quantity" />
        <NumberField source="reserved_quantity" />
        <NumberField source="incoming_quantity" />
        <NumberField source="quantity_available" />
        <DateField source="created_at" showTime />
        <DateField source="updated_at" showTime />
      </SimpleShowLayout>
    </Show>
  );
}

export function InventoryLevelEdit() {
  return (
    <Edit>
      <SimpleForm>
        <NumberInput source="stocked_quantity" />
        <NumberInput source="reserved_quantity" />
        <NumberInput source="incoming_quantity" />
      </SimpleForm>
    </Edit>
  );
}

export function InventoryLevelCreate() {
  return (
    <Create>
      <SimpleForm>
        <ReferenceInput source="inventory_item_id" reference="inventory_items">
          <AutocompleteInput optionText="sku" required />
        </ReferenceInput>
        <ReferenceInput source="location_id" reference="stock_locations">
          <AutocompleteInput optionText="name" required />
        </ReferenceInput>
        <NumberInput source="stocked_quantity" defaultValue={0} />
        <NumberInput source="reserved_quantity" defaultValue={0} />
        <NumberInput source="incoming_quantity" defaultValue={0} />
      </SimpleForm>
    </Create>
  );
}

// ─── Stock Locations ──────────────────────────────────────────────────────────

const locationFilters = [
  <SearchInput source="name@ilike" alwaysOn placeholder="Search by name" />,
  <BooleanInput source="is_active" label="Active" />,
];

export function StockLocationList() {
  return (
    <List
      filters={locationFilters}
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
        <TextField source="name" />
        <TextField source="city" />
        <TextField source="country_code" label="Country" />
        <BooleanField source="is_active" />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function StockLocationShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="name" />
        <TextField source="address_1" />
        <TextField source="address_2" />
        <TextField source="city" />
        <TextField source="province" />
        <TextField source="postal_code" />
        <TextField source="country_code" />
        <BooleanField source="is_active" />
        <DateField source="created_at" showTime />
        <DateField source="updated_at" showTime />
      </SimpleShowLayout>
    </Show>
  );
}

export function StockLocationEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" required />
        <TextInput source="address_1" />
        <TextInput source="address_2" />
        <TextInput source="city" />
        <TextInput source="province" />
        <TextInput source="postal_code" />
        <TextInput source="country_code" />
        <BooleanInput source="is_active" />
      </SimpleForm>
    </Edit>
  );
}

export function StockLocationCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" required />
        <TextInput source="address_1" />
        <TextInput source="address_2" />
        <TextInput source="city" />
        <TextInput source="province" />
        <TextInput source="postal_code" />
        <TextInput source="country_code" />
        <BooleanInput source="is_active" defaultValue={true} />
      </SimpleForm>
    </Create>
  );
}
