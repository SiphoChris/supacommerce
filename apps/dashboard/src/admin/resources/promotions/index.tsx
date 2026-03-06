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
  ReferenceField,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  ReferenceInput,
  AutocompleteInput,
  DateTimeInput,
} from "react-admin";
import {
  StatusChipField,
  PROMOTION_STATUS,
  PROMOTION_TYPE,
  PROMOTION_RULE_TYPE,
} from "../shared";

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
        <TextField source="code" emptyText="(automatic)" />
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
          <TextField source="code" emptyText="(automatic)" />
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
              <ReferenceField
                source="order_id"
                reference="orders"
                link="show"
                emptyText="—"
              >
                <TextField source="display_id" label="Order #" />
              </ReferenceField>
              <ReferenceField
                source="customer_id"
                reference="customers"
                link="show"
                emptyText="—"
              >
                <TextField source="email" label="Customer" />
              </ReferenceField>
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
        <TextInput
          source="code"
          helperText="Leave blank for automatic promotions"
        />
        <TextInput source="description" multiline />
        <SelectInput source="status" choices={PROMOTION_STATUS} />
        <SelectInput source="type" choices={PROMOTION_TYPE} />
        <NumberInput
          source="value"
          required
          helperText="Percentage (0–100) for percentage type, or cents for fixed_amount"
        />
        <NumberInput
          source="usage_limit"
          helperText="Leave blank for unlimited"
        />
        <NumberInput
          source="usage_limit_per_customer"
          helperText="Leave blank for unlimited"
        />
        <BooleanInput source="is_automatic" />
        <BooleanInput source="is_case_insensitive" />
        <DateTimeInput source="starts_at" />
        <DateTimeInput source="ends_at" />
      </SimpleForm>
    </Edit>
  );
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function PromotionCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput
          source="code"
          helperText="Leave blank for automatic promotions"
        />
        <TextInput source="description" multiline />
        <SelectInput
          source="status"
          choices={PROMOTION_STATUS}
          defaultValue="draft"
        />
        <SelectInput source="type" choices={PROMOTION_TYPE} required />
        <NumberInput
          source="value"
          required
          helperText="Percentage (0–100) for percentage type, or cents for fixed_amount"
        />
        <NumberInput
          source="usage_limit"
          helperText="Leave blank for unlimited"
        />
        <NumberInput
          source="usage_limit_per_customer"
          helperText="Leave blank for unlimited"
        />
        <BooleanInput source="is_automatic" defaultValue={false} />
        <BooleanInput source="is_case_insensitive" defaultValue={true} />
        <DateTimeInput source="starts_at" />
        <DateTimeInput source="ends_at" />
      </SimpleForm>
    </Create>
  );
}

// ─── Promotion Rules ──────────────────────────────────────────────────────────

export function PromotionRuleList() {
  return (
    <List sort={{ field: "created_at", order: "DESC" }}>
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <ReferenceField
          source="promotion_id"
          reference="promotions"
          link="show"
        >
          <TextField source="code" emptyText="(automatic)" label="Promotion" />
        </ReferenceField>
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
        <ReferenceField
          source="promotion_id"
          reference="promotions"
          link="show"
        >
          <TextField source="code" emptyText="(automatic)" label="Promotion" />
        </ReferenceField>
        <TextField source="type" />
        <TextField source="value" />
        <TextField source="description" />
        <DateField source="created_at" showTime />
      </SimpleShowLayout>
    </Show>
  );
}

export function PromotionRuleCreate() {
  return (
    <Create>
      <SimpleForm>
        <ReferenceInput source="promotion_id" reference="promotions">
          <AutocompleteInput
            optionText={(r) => r?.code ?? "(automatic)"}
            required
          />
        </ReferenceInput>
        <SelectInput source="type" choices={PROMOTION_RULE_TYPE} required />
        <TextInput
          source="value"
          required
          helperText="For cart_total: minimum in cents. For customer_group: group ID. For product/category: record ID."
        />
        <TextInput source="description" multiline />
      </SimpleForm>
    </Create>
  );
}

export function PromotionRuleEdit() {
  return (
    <Edit>
      <SimpleForm>
        <ReferenceField
          source="promotion_id"
          reference="promotions"
          link={false}
        >
          <TextField source="code" emptyText="(automatic)" label="Promotion" />
        </ReferenceField>
        <SelectInput source="type" choices={PROMOTION_RULE_TYPE} required />
        <TextInput
          source="value"
          required
          helperText="For cart_total: minimum in cents. For customer_group: group ID. For product/category: record ID."
        />
        <TextInput source="description" multiline />
      </SimpleForm>
    </Edit>
  );
}
