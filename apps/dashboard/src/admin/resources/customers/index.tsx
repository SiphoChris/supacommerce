import {
  List,
  Datagrid,
  TextField,
  EmailField,
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
  ReferenceField,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
} from "react-admin";
import { CentsField } from "../shared";

// ─── Filters ──────────────────────────────────────────────────────────────────

const filters = [
  <SearchInput source="email@ilike" alwaysOn placeholder="Search by email" />,
  <SearchInput source="first_name@ilike" placeholder="First name" />,
  <SearchInput source="last_name@ilike" placeholder="Last name" />,
  <BooleanInput source="is_anonymous" label="Anonymous" />,
];

// ─── List ─────────────────────────────────────────────────────────────────────

export function CustomerList() {
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
      <Datagrid rowClick="edit" bulkActionButtons={undefined}>
        <TextField source="first_name" />
        <TextField source="last_name" />
        <EmailField source="email" />
        <TextField source="phone" />
        <ReferenceField
          source="group_id"
          reference="customer_groups"
          link="show"
          emptyText="—"
        >
          <TextField source="name" label="Group" />
        </ReferenceField>
        <BooleanField source="is_anonymous" label="Anonymous" />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

// ─── Show ─────────────────────────────────────────────────────────────────────

export function CustomerShow() {
  return (
    <Show>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="Details">
          <TextField source="first_name" />
          <TextField source="last_name" />
          <EmailField source="email" />
          <TextField source="phone" />
          <BooleanField source="is_anonymous" />
          <ReferenceField
            source="group_id"
            reference="customer_groups"
            link="show"
            emptyText="—"
          >
            <TextField source="name" label="Group" />
          </ReferenceField>
          <DateField source="created_at" showTime />
          <DateField source="updated_at" showTime />
        </TabbedShowLayout.Tab>

        <TabbedShowLayout.Tab label="Addresses">
          <ReferenceManyField
            reference="customer_addresses"
            target="customer_id"
            label={false}
          >
            <Datagrid bulkActionButtons={undefined}>
              <TextField source="address_1" />
              <TextField source="address_2" />
              <TextField source="city" />
              <TextField source="province" />
              <TextField source="postal_code" />
              <TextField source="country_code" />
              <BooleanField source="is_default" />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>

        <TabbedShowLayout.Tab label="Orders">
          <ReferenceManyField
            reference="orders"
            target="customer_id"
            label={false}
          >
            <Datagrid bulkActionButtons={false} rowClick="edit">
              <TextField source="display_id" label="Order #" />
              <TextField source="status" />
              <CentsField source="total" currencySource="currency_code" />
              <TextField source="currency_code" />
              <DateField source="created_at" showTime />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
}

// ─── Edit ─────────────────────────────────────────────────────────────────────

export function CustomerEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="first_name" />
        <TextInput source="last_name" />
        <TextInput source="email" type="email" />
        <TextInput source="phone" />
        <ReferenceInput
          source="group_id"
          reference="customer_groups"
          allowEmpty
        >
          <AutocompleteInput optionText="name" label="Group (optional)" />
        </ReferenceInput>
      </SimpleForm>
    </Edit>
  );
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function CustomerCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="first_name" />
        <TextInput source="last_name" />
        <TextInput source="email" type="email" />
        <TextInput source="phone" />
        <ReferenceInput
          source="group_id"
          reference="customer_groups"
          allowEmpty
        >
          <AutocompleteInput optionText="name" label="Group (optional)" />
        </ReferenceInput>
      </SimpleForm>
    </Create>
  );
}

// ─── Customer Groups ──────────────────────────────────────────────────────────

const groupFilters = [
  <SearchInput source="name@ilike" alwaysOn placeholder="Search by name" />,
];

export function CustomerGroupList() {
  return (
    <List
      filters={groupFilters}
      actions={
        <TopToolbar>
          <FilterButton />
          <CreateButton />
          <ExportButton />
        </TopToolbar>
      }
      sort={{ field: "created_at", order: "DESC" }}
    >
      <Datagrid rowClick="edit" bulkActionButtons={undefined}>
        <TextField source="name" />
        <TextField source="description" />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function CustomerGroupShow() {
  return (
    <Show>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="Details">
          <TextField source="name" />
          <TextField source="description" />
          <DateField source="created_at" showTime />
          <DateField source="updated_at" showTime />
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Customers">
          <ReferenceManyField
            reference="customers"
            target="group_id"
            label={false}
          >
            <Datagrid bulkActionButtons={false} rowClick="edit">
              <TextField source="first_name" />
              <TextField source="last_name" />
              <EmailField source="email" />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
}

export function CustomerGroupEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" required />
        <TextInput source="description" multiline />
      </SimpleForm>
    </Edit>
  );
}

export function CustomerGroupCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" required />
        <TextInput source="description" multiline />
      </SimpleForm>
    </Create>
  );
}
