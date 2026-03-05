import {
  List,
  Datagrid,
  TextField,
  DateField,
  SelectInput,
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
  NumberInput,
} from "react-admin";
import {
  StatusChipField,
  CentsField,
  PRICE_LIST_STATUS,
  PRICE_LIST_TYPE,
} from "../shared";

// ─── Prices ───────────────────────────────────────────────────────────────────

const priceFilters = [
  <SearchInput
    source="currency_code@ilike"
    alwaysOn
    placeholder="Currency code"
  />,
];

export function PriceList() {
  return (
    <List
      filters={priceFilters}
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
        <TextField source="price_set_id" label="Price Set" />
        <TextField source="currency_code" label="Currency" />
        <CentsField source="amount" />
        <TextField source="min_quantity" />
        <TextField source="max_quantity" />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function PriceShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="price_set_id" />
        <TextField source="currency_code" />
        <CentsField source="amount" />
        <TextField source="min_quantity" />
        <TextField source="max_quantity" />
        <TextField source="region_id" />
        <DateField source="created_at" showTime />
      </SimpleShowLayout>
    </Show>
  );
}

export function PriceEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="currency_code" required />
        <NumberInput source="amount" helperText="In cents" required />
        <NumberInput source="min_quantity" />
        <NumberInput source="max_quantity" />
      </SimpleForm>
    </Edit>
  );
}

export function PriceCreate() {
  return (
    <Create>
      <SimpleForm>
        <ReferenceInput source="price_set_id" reference="price_sets">
          <AutocompleteInput optionText="id" required />
        </ReferenceInput>
        <TextInput source="currency_code" required />
        <NumberInput source="amount" helperText="In cents" required />
        <NumberInput source="min_quantity" />
        <NumberInput source="max_quantity" />
      </SimpleForm>
    </Create>
  );
}

// ─── Price Sets ───────────────────────────────────────────────────────────────

export function PriceSetList() {
  return (
    <List
      actions={
        <TopToolbar>
          <CreateButton />
          <ExportButton />
        </TopToolbar>
      }
      sort={{ field: "created_at", order: "DESC" }}
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <TextField source="variant_id" label="Variant" />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function PriceSetShow() {
  return (
    <Show>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="Details">
          <TextField source="variant_id" />
          <DateField source="created_at" showTime />
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Prices">
          <ReferenceManyField
            reference="prices"
            target="price_set_id"
            label={false}
          >
            <Datagrid bulkActionButtons={false}>
              <TextField source="currency_code" />
              <CentsField source="amount" />
              <TextField source="min_quantity" />
              <TextField source="max_quantity" />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
}

export function PriceSetCreate() {
  return (
    <Create>
      <SimpleForm>
        <ReferenceInput source="variant_id" reference="product_variants">
          <AutocompleteInput optionText="title" required />
        </ReferenceInput>
      </SimpleForm>
    </Create>
  );
}

// ─── Price Lists ──────────────────────────────────────────────────────────────

const priceListFilters = [
  <SearchInput source="name@ilike" alwaysOn placeholder="Search by name" />,
  <SelectInput source="status" choices={PRICE_LIST_STATUS} />,
  <SelectInput source="type" choices={PRICE_LIST_TYPE} />,
];

export function PriceListList() {
  return (
    <List
      filters={priceListFilters}
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
        <StatusChipField source="status" />
        <StatusChipField source="type" />
        <DateField source="starts_at" showTime />
        <DateField source="ends_at" showTime />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function PriceListShow() {
  return (
    <Show>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="Details">
          <TextField source="name" />
          <TextField source="description" />
          <StatusChipField source="status" />
          <StatusChipField source="type" />
          <DateField source="starts_at" showTime />
          <DateField source="ends_at" showTime />
          <DateField source="created_at" showTime />
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Prices">
          <ReferenceManyField
            reference="price_list_prices"
            target="price_list_id"
            label={false}
          >
            <Datagrid bulkActionButtons={false}>
              <TextField source="variant_id" />
              <TextField source="currency_code" />
              <CentsField source="amount" />
              <TextField source="min_quantity" />
              <TextField source="max_quantity" />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
}

export function PriceListEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" required />
        <TextInput source="description" multiline />
        <SelectInput source="status" choices={PRICE_LIST_STATUS} />
        <SelectInput source="type" choices={PRICE_LIST_TYPE} />
        <TextInput source="starts_at" type="datetime-local" />
        <TextInput source="ends_at" type="datetime-local" />
      </SimpleForm>
    </Edit>
  );
}

export function PriceListCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" required />
        <TextInput source="description" multiline />
        <SelectInput
          source="status"
          choices={PRICE_LIST_STATUS}
          defaultValue="draft"
        />
        <SelectInput
          source="type"
          choices={PRICE_LIST_TYPE}
          defaultValue="sale"
        />
        <TextInput source="starts_at" type="datetime-local" />
        <TextInput source="ends_at" type="datetime-local" />
      </SimpleForm>
    </Create>
  );
}
