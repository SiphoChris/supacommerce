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
  ReferenceField,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  NumberInput,
  DateTimeInput,
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
        <ReferenceField
          source="price_set_id"
          reference="price_sets"
          link="show"
        >
          <ReferenceField
            source="variant_id"
            reference="product_variants"
            link={false}
          >
            <TextField source="title" />
          </ReferenceField>
        </ReferenceField>
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
        <ReferenceField
          source="price_set_id"
          reference="price_sets"
          link="show"
        >
          <ReferenceField
            source="variant_id"
            reference="product_variants"
            link="show"
          >
            <TextField source="title" label="Variant" />
          </ReferenceField>
        </ReferenceField>
        <TextField source="currency_code" />
        <CentsField source="amount" />
        <TextField source="min_quantity" />
        <TextField source="max_quantity" />
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

export function PriceEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="currency_code" required />
        <NumberInput
          source="amount"
          helperText="In cents, e.g. 1099 = R10.99"
          required
        />
        <NumberInput source="min_quantity" />
        <NumberInput source="max_quantity" />
        <ReferenceInput source="region_id" reference="regions" allowEmpty>
          <AutocompleteInput optionText="name" label="Region (optional)" />
        </ReferenceInput>
      </SimpleForm>
    </Edit>
  );
}

export function PriceCreate() {
  return (
    <Create>
      <SimpleForm>
        <ReferenceInput source="price_set_id" reference="price_sets">
          <AutocompleteInput
            optionText={(record) => record?.variant?.title ?? record?.id ?? ""}
            label="Price Set (Variant)"
            required
          />
        </ReferenceInput>
        <TextInput source="currency_code" required />
        <NumberInput
          source="amount"
          helperText="In cents, e.g. 1099 = R10.99"
          required
        />
        <NumberInput source="min_quantity" />
        <NumberInput source="max_quantity" />
        <ReferenceInput source="region_id" reference="regions" allowEmpty>
          <AutocompleteInput optionText="name" label="Region (optional)" />
        </ReferenceInput>
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
        <ReferenceField
          source="variant_id"
          reference="product_variants"
          link="show"
          emptyText="—"
        >
          <TextField source="title" label="Variant" />
        </ReferenceField>
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
          <ReferenceField
            source="variant_id"
            reference="product_variants"
            link="show"
            emptyText="—"
          >
            <TextField source="title" label="Variant" />
          </ReferenceField>
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
              <ReferenceField
                source="variant_id"
                reference="product_variants"
                link="show"
              >
                <TextField source="title" />
              </ReferenceField>
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
        <DateTimeInput source="starts_at" />
        <DateTimeInput source="ends_at" />
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
        <DateTimeInput source="starts_at" />
        <DateTimeInput source="ends_at" />
      </SimpleForm>
    </Create>
  );
}
