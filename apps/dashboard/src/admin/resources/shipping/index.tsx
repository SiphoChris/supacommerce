import {
  List,
  Datagrid,
  TextField,
  DateField,
  BooleanField,
  BooleanInput,
  SelectInput,
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
  NumberInput,
  ReferenceInput,
  AutocompleteInput,
} from "react-admin";
import {
  StatusChipField,
  CentsField,
  SHIPPING_OPTION_TYPE,
  SHIPPING_PROFILE_TYPE,
} from "../shared";

// ─── Shipping Options ─────────────────────────────────────────────────────────

const optionFilters = [
  <SearchInput source="name@ilike" alwaysOn placeholder="Search by name" />,
  <SelectInput source="type" choices={SHIPPING_OPTION_TYPE} />,
  <BooleanInput source="is_active" label="Active" />,
  <BooleanInput source="is_return" label="Return Option" />,
];

export function ShippingOptionList() {
  return (
    <List
      filters={optionFilters}
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
        <TextField source="region_id" label="Region" />
        <StatusChipField source="type" />
        <CentsField source="amount" />
        <BooleanField source="is_active" label="Active" />
        <BooleanField source="is_return" label="Return" />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function ShippingOptionShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="name" />
        <TextField source="region_id" />
        <TextField source="profile_id" />
        <TextField source="provider_id" />
        <StatusChipField source="type" />
        <CentsField source="amount" />
        <BooleanField source="is_active" />
        <BooleanField source="is_return" />
        <DateField source="created_at" showTime />
        <DateField source="updated_at" showTime />
      </SimpleShowLayout>
    </Show>
  );
}

export function ShippingOptionEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" required />
        <ReferenceInput source="region_id" reference="regions">
          <AutocompleteInput optionText="name" required />
        </ReferenceInput>
        <SelectInput source="type" choices={SHIPPING_OPTION_TYPE} />
        <NumberInput source="amount" helperText="In cents" />
        <BooleanInput source="is_active" />
        <BooleanInput source="is_return" />
      </SimpleForm>
    </Edit>
  );
}

export function ShippingOptionCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" required />
        <ReferenceInput source="region_id" reference="regions">
          <AutocompleteInput optionText="name" required />
        </ReferenceInput>
        <SelectInput
          source="type"
          choices={SHIPPING_OPTION_TYPE}
          defaultValue="flat_rate"
        />
        <NumberInput source="amount" helperText="In cents" defaultValue={0} />
        <BooleanInput source="is_active" defaultValue={true} />
        <BooleanInput source="is_return" defaultValue={false} />
      </SimpleForm>
    </Create>
  );
}

// ─── Shipping Profiles ────────────────────────────────────────────────────────

const profileFilters = [
  <SearchInput source="name@ilike" alwaysOn placeholder="Search by name" />,
  <SelectInput source="type" choices={SHIPPING_PROFILE_TYPE} />,
];

export function ShippingProfileList() {
  return (
    <List
      filters={profileFilters}
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
        <StatusChipField source="type" />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function ShippingProfileShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="name" />
        <StatusChipField source="type" />
        <DateField source="created_at" showTime />
        <DateField source="updated_at" showTime />
      </SimpleShowLayout>
    </Show>
  );
}

export function ShippingProfileEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" required />
        <SelectInput source="type" choices={SHIPPING_PROFILE_TYPE} />
      </SimpleForm>
    </Edit>
  );
}

export function ShippingProfileCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" required />
        <SelectInput
          source="type"
          choices={SHIPPING_PROFILE_TYPE}
          defaultValue="default"
        />
      </SimpleForm>
    </Create>
  );
}

// ─── Fulfillment Providers ────────────────────────────────────────────────────

export function FulfillmentProviderList() {
  return (
    <List sort={{ field: "id", order: "ASC" }}>
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <TextField source="id" label="Provider ID" />
        <BooleanField source="is_installed" />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function FulfillmentProviderShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <BooleanField source="is_installed" />
        <DateField source="created_at" showTime />
        <DateField source="updated_at" showTime />
      </SimpleShowLayout>
    </Show>
  );
}

export function FulfillmentProviderEdit() {
  return (
    <Edit>
      <SimpleForm>
        <BooleanInput source="is_installed" />
      </SimpleForm>
    </Edit>
  );
}

export function FulfillmentProviderCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="id" label="Provider ID" required />
        <BooleanInput source="is_installed" defaultValue={true} />
      </SimpleForm>
    </Create>
  );
}
