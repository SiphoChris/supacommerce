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
  TabbedShowLayout,
  ReferenceManyField,
  SimpleShowLayout,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
} from "react-admin";

// ─── Regions ──────────────────────────────────────────────────────────────────

const regionFilters = [
  <SearchInput source="name@ilike" alwaysOn placeholder="Search by name" />,
  <BooleanInput source="is_active" label="Active" />,
  <BooleanInput source="tax_included" label="Tax Included" />,
];

export function RegionList() {
  return (
    <List
      filters={regionFilters}
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
        <TextField source="currency_code" label="Currency" />
        <TextField source="tax_rate" />
        <BooleanField source="tax_included" />
        <BooleanField source="is_active" />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function RegionShow() {
  return (
    <Show>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="Details">
          <TextField source="name" />
          <TextField source="currency_code" />
          <TextField source="tax_rate" />
          <BooleanField source="tax_included" />
          <BooleanField source="is_active" />
          <DateField source="created_at" showTime />
          <DateField source="updated_at" showTime />
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Countries">
          <ReferenceManyField
            reference="countries"
            target="region_id"
            label={false}
          >
            <Datagrid bulkActionButtons={false}>
              <TextField source="name" />
              <TextField source="iso2" />
              <TextField source="iso3" />
              <TextField source="display_name" />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
}

export function RegionEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" required />
        <ReferenceInput source="currency_code" reference="currencies">
          <AutocompleteInput optionText="name" optionValue="code" required />
        </ReferenceInput>
        <TextInput source="tax_rate" />
        <BooleanInput source="tax_included" />
        <BooleanInput source="is_active" />
      </SimpleForm>
    </Edit>
  );
}

export function RegionCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" required />
        <ReferenceInput source="currency_code" reference="currencies">
          <AutocompleteInput optionText="name" optionValue="code" required />
        </ReferenceInput>
        <TextInput source="tax_rate" defaultValue="0" />
        <BooleanInput source="tax_included" defaultValue={false} />
        <BooleanInput source="is_active" defaultValue={true} />
      </SimpleForm>
    </Create>
  );
}

// ─── Countries ────────────────────────────────────────────────────────────────

const countryFilters = [
  <SearchInput source="name@ilike" alwaysOn placeholder="Search by name" />,
  <SearchInput source="iso2@ilike" placeholder="ISO2 code" />,
];

export function CountryList() {
  return (
    <List
      filters={countryFilters}
      actions={
        <TopToolbar>
          <FilterButton />
          <CreateButton />
          <ExportButton />
        </TopToolbar>
      }
      sort={{ field: "name", order: "ASC" }}
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <TextField source="name" />
        <TextField source="iso2" label="ISO2" />
        <TextField source="iso3" label="ISO3" />
        <TextField source="display_name" />
        <TextField source="region_id" label="Region" />
      </Datagrid>
    </List>
  );
}

export function CountryShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="name" />
        <TextField source="iso2" />
        <TextField source="iso3" />
        <TextField source="display_name" />
        <TextField source="region_id" />
        <DateField source="created_at" showTime />
      </SimpleShowLayout>
    </Show>
  );
}

export function CountryEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" required />
        <TextInput source="iso2" required />
        <TextInput source="iso3" />
        <TextInput source="display_name" />
        <ReferenceInput source="region_id" reference="regions">
          <AutocompleteInput optionText="name" required />
        </ReferenceInput>
      </SimpleForm>
    </Edit>
  );
}

export function CountryCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" required />
        <TextInput source="iso2" required />
        <TextInput source="iso3" />
        <TextInput source="display_name" />
        <ReferenceInput source="region_id" reference="regions">
          <AutocompleteInput optionText="name" required />
        </ReferenceInput>
      </SimpleForm>
    </Create>
  );
}

// ─── Currencies ───────────────────────────────────────────────────────────────

const currencyFilters = [
  <SearchInput source="name@ilike" alwaysOn placeholder="Search by name" />,
  <SearchInput source="code@ilike" placeholder="Code (USD, EUR…)" />,
];

export function CurrencyList() {
  return (
    <List
      filters={currencyFilters}
      actions={
        <TopToolbar>
          <FilterButton />
          <CreateButton />
          <ExportButton />
        </TopToolbar>
      }
      sort={{ field: "code", order: "ASC" }}
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <TextField source="code" />
        <TextField source="name" />
        <TextField source="symbol" />
        <BooleanField source="includes_decimal" />
      </Datagrid>
    </List>
  );
}

export function CurrencyShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="code" />
        <TextField source="name" />
        <TextField source="symbol" />
        <BooleanField source="includes_decimal" />
        <DateField source="created_at" showTime />
      </SimpleShowLayout>
    </Show>
  );
}

export function CurrencyEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" required />
        <TextInput source="symbol" required />
        <BooleanInput source="includes_decimal" />
      </SimpleForm>
    </Edit>
  );
}

export function CurrencyCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="code" required />
        <TextInput source="name" required />
        <TextInput source="symbol" required />
        <BooleanInput source="includes_decimal" defaultValue={true} />
      </SimpleForm>
    </Create>
  );
}
