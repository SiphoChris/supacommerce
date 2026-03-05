import {
  List,
  Datagrid,
  TextField,
  DateField,
  NumberField,
  BooleanField,
  BooleanInput,
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
  NumberInput,
} from "react-admin";
import { StatusChipField, PROMOTION_STATUS, PROMOTION_TYPE } from "../shared";

// ─── Filters ──────────────────────────────────────────────────────────────────

const filters = [
  <SearchInput source="code@ilike" alwaysOn placeholder="Search by code" />,
  <SelectInput source="status" choices={PROMOTION_STATUS} />,
  <SelectInput source="type" choices={PROMOTION_TYPE} />,
  <BooleanInput source="is_automatic" label="Automatic" />,
];

// ─── List ─────────────────────────────────────────────────────────────────────

export function PromotionList() {
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
        <TextField source="code" />
        <StatusChipField source="status" />
        <StatusChipField source="type" />
        <NumberField source="value" />
        <NumberField source="usage_count" label="Uses" />
        <NumberField source="usage_limit" label="Limit" />
        <BooleanField source="is_automatic" label="Auto" />
        <DateField source="starts_at" showTime />
        <DateField source="ends_at" showTime />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

// ─── Show ─────────────────────────────────────────────────────────────────────

export function PromotionShow() {
  return (
    <Show>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="Details">
          <TextField source="code" />
          <TextField source="description" />
          <StatusChipField source="status" />
          <StatusChipField source="type" />
          <NumberField source="value" />
          <NumberField source="usage_count" />
          <NumberField source="usage_limit" />
          <NumberField source="usage_limit_per_customer" />
          <BooleanField source="is_automatic" />
          <BooleanField source="is_case_insensitive" />
          <DateField source="starts_at" showTime />
          <DateField source="ends_at" showTime />
          <DateField source="created_at" showTime />
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Rules">
          <ReferenceManyField
            reference="promotion_rules"
            target="promotion_id"
            label={false}
          >
            <Datagrid bulkActionButtons={false}>
              <TextField source="type" />
              <TextField source="value" />
              <TextField source="description" />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Usage">
          <ReferenceManyField
            reference="promotion_usages"
            target="promotion_id"
            label={false}
          >
            <Datagrid bulkActionButtons={false}>
              <TextField source="order_id" />
              <TextField source="customer_id" />
              <DateField source="created_at" showTime />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
}

// ─── Edit ─────────────────────────────────────────────────────────────────────

export function PromotionEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="code" />
        <TextInput source="description" multiline />
        <SelectInput source="status" choices={PROMOTION_STATUS} />
        <SelectInput source="type" choices={PROMOTION_TYPE} />
        <NumberInput source="value" required />
        <NumberInput source="usage_limit" />
        <NumberInput source="usage_limit_per_customer" />
        <BooleanInput source="is_automatic" />
        <BooleanInput source="is_case_insensitive" />
        <TextInput source="starts_at" type="datetime-local" />
        <TextInput source="ends_at" type="datetime-local" />
      </SimpleForm>
    </Edit>
  );
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function PromotionCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="code" />
        <TextInput source="description" multiline />
        <SelectInput
          source="status"
          choices={PROMOTION_STATUS}
          defaultValue="draft"
        />
        <SelectInput source="type" choices={PROMOTION_TYPE} required />
        <NumberInput source="value" required />
        <NumberInput source="usage_limit" />
        <NumberInput source="usage_limit_per_customer" />
        <BooleanInput source="is_automatic" defaultValue={false} />
        <BooleanInput source="is_case_insensitive" defaultValue={true} />
        <TextInput source="starts_at" type="datetime-local" />
        <TextInput source="ends_at" type="datetime-local" />
      </SimpleForm>
    </Create>
  );
}

// ─── Promotion Rules ──────────────────────────────────────────────────────────

export function PromotionRuleList() {
  return (
    <List sort={{ field: "created_at", order: "DESC" }}>
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <TextField source="promotion_id" label="Promotion" />
        <TextField source="type" />
        <TextField source="value" />
        <TextField source="description" />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function PromotionRuleShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="promotion_id" />
        <TextField source="type" />
        <TextField source="value" />
        <TextField source="description" />
        <DateField source="created_at" showTime />
      </SimpleShowLayout>
    </Show>
  );
}
