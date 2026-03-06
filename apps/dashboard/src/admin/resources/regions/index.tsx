import {
  List,
  Datagrid,
  TextField,
  DateField,
  BooleanField,
  BooleanInput,
  NumberField,
  SearchInput,
  FilterButton,
  TopToolbar,
  CreateButton,
  ExportButton,
  Show,
  TabbedShowLayout,
  ReferenceManyField,
  SimpleShowLayout,
  ReferenceField,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
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
        <TextInput
          source="tax_rate"
          helperText="Legacy field — tax is now resolved via tax_regions"
        />
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
        <TextInput
          source="tax_rate"
          defaultValue="0"
          helperText="Legacy field — tax is now resolved via tax_regions"
        />
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
        <ReferenceField
          source="region_id"
          reference="regions"
          link="show"
          emptyText="—"
        >
          <TextField source="name" label="Region" />
        </ReferenceField>
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
        <ReferenceField
          source="region_id"
          reference="regions"
          link="show"
          emptyText="—"
        >
          <TextField source="name" label="Region" />
        </ReferenceField>
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
        <TextInput source="iso2" required helperText="2-letter code, e.g. ZA" />
        <TextInput source="iso3" helperText="3-letter code, e.g. ZAF" />
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
  <SearchInput source="code@ilike" placeholder="Code (USD, ZAR…)" />,
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
        <TextInput source="code" required helperText="e.g. ZAR" />
        <TextInput
          source="name"
          required
          helperText="e.g. South African Rand"
        />
        <TextInput source="symbol" required helperText="e.g. R" />
        <BooleanInput source="includes_decimal" defaultValue={true} />
      </SimpleForm>
    </Create>
  );
}

// ─── Tax Regions ──────────────────────────────────────────────────────────────

const taxRegionFilters = [
  <SearchInput source="name@ilike" alwaysOn placeholder="Search by name" />,
  <SearchInput source="country_code@ilike" placeholder="Country code" />,
];

export function TaxRegionList() {
  return (
    <List
      filters={taxRegionFilters}
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
        <TextField source="country_code" label="Country" />
        <TextField source="province_code" label="Province" emptyText="—" />
        <TextField source="provider_id" label="Provider" emptyText="—" />
        <ReferenceField
          source="region_id"
          reference="regions"
          link="show"
          emptyText="—"
        >
          <TextField source="name" label="Region" />
        </ReferenceField>
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function TaxRegionShow() {
  return (
    <Show>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="Details">
          <TextField source="name" />
          <TextField source="country_code" />
          <TextField source="province_code" emptyText="—" />
          <TextField source="provider_id" emptyText="—" />
          <ReferenceField
            source="region_id"
            reference="regions"
            link="show"
            emptyText="—"
          >
            <TextField source="name" label="Region" />
          </ReferenceField>
          <DateField source="created_at" showTime />
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Tax Rates">
          <ReferenceManyField
            reference="tax_rates"
            target="tax_region_id"
            label={false}
          >
            <Datagrid bulkActionButtons={false} rowClick="show">
              <TextField source="name" />
              <TextField source="code" />
              <NumberField source="rate" />
              <BooleanField source="is_default" />
              <BooleanField source="is_active" />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
}

export function TaxRegionEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" required />
        <TextInput
          source="country_code"
          required
          helperText="2-letter ISO code, e.g. ZA"
        />
        <TextInput
          source="province_code"
          helperText="Optional — for province-level tax"
        />
        <TextInput source="provider_id" helperText="Optional tax provider ID" />
        <ReferenceInput source="region_id" reference="regions" allowEmpty>
          <AutocompleteInput optionText="name" label="Region (optional)" />
        </ReferenceInput>
      </SimpleForm>
    </Edit>
  );
}

export function TaxRegionCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" required />
        <TextInput
          source="country_code"
          required
          helperText="2-letter ISO code, e.g. ZA"
        />
        <TextInput
          source="province_code"
          helperText="Optional — for province-level tax"
        />
        <TextInput source="provider_id" helperText="Optional tax provider ID" />
        <ReferenceInput source="region_id" reference="regions" allowEmpty>
          <AutocompleteInput optionText="name" label="Region (optional)" />
        </ReferenceInput>
      </SimpleForm>
    </Create>
  );
}

// ─── Tax Rates ────────────────────────────────────────────────────────────────

const taxRateFilters = [
  <SearchInput source="name@ilike" alwaysOn placeholder="Search by name" />,
  <BooleanInput source="is_active" label="Active" />,
  <BooleanInput source="is_default" label="Default" />,
];

export function TaxRateList() {
  return (
    <List
      filters={taxRateFilters}
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
        <TextField source="code" />
        <NumberField source="rate" />
        <ReferenceField
          source="tax_region_id"
          reference="tax_regions"
          link="show"
        >
          <TextField source="name" label="Tax Region" />
        </ReferenceField>
        <BooleanField source="is_default" />
        <BooleanField source="is_active" />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function TaxRateShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="name" />
        <TextField source="code" />
        <NumberField source="rate" />
        <ReferenceField
          source="tax_region_id"
          reference="tax_regions"
          link="show"
        >
          <TextField source="name" label="Tax Region" />
        </ReferenceField>
        <BooleanField source="is_default" />
        <BooleanField source="is_active" />
        <DateField source="created_at" showTime />
        <DateField source="updated_at" showTime />
      </SimpleShowLayout>
    </Show>
  );
}

export function TaxRateEdit() {
  return (
    <Edit>
      <SimpleForm>
        <ReferenceField
          source="tax_region_id"
          reference="tax_regions"
          link={false}
        >
          <TextField source="name" label="Tax Region" />
        </ReferenceField>
        <TextInput source="name" required />
        <TextInput source="code" helperText="e.g. VAT, GST" />
        <NumberInput
          source="rate"
          required
          helperText="e.g. 0.15 for 15% VAT"
        />
        <BooleanInput source="is_default" />
        <BooleanInput source="is_active" />
      </SimpleForm>
    </Edit>
  );
}

export function TaxRateCreate() {
  return (
    <Create>
      <SimpleForm>
        <ReferenceInput source="tax_region_id" reference="tax_regions">
          <AutocompleteInput optionText="name" required />
        </ReferenceInput>
        <TextInput source="name" required />
        <TextInput source="code" helperText="e.g. VAT, GST" />
        <NumberInput
          source="rate"
          required
          helperText="e.g. 0.15 for 15% VAT"
        />
        <BooleanInput source="is_default" defaultValue={false} />
        <BooleanInput source="is_active" defaultValue={true} />
      </SimpleForm>
    </Create>
  );
}
