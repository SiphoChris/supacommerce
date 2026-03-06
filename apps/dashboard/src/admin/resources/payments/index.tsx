import {
  List,
  Datagrid,
  TextField,
  DateField,
  SelectInput,
  FilterButton,
  TopToolbar,
  ExportButton,
  Show,
  TabbedShowLayout,
  ReferenceManyField,
  ReferenceField,
  Edit,
  SimpleForm,
} from "react-admin";
import {
  StatusChipField,
  CentsField,
  PAYMENT_COLLECTION_STATUS,
  PAYMENT_SESSION_STATUS,
} from "../shared";

// ─── Payment Collections ──────────────────────────────────────────────────────

const collectionFilters = [
  <SelectInput source="status" choices={PAYMENT_COLLECTION_STATUS} />,
];

export function PaymentCollectionList() {
  return (
    <List
      filters={collectionFilters}
      actions={
        <TopToolbar>
          <FilterButton />
          <ExportButton />
        </TopToolbar>
      }
      sort={{ field: "created_at", order: "DESC" }}
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <ReferenceField source="order_id" reference="orders" link="show">
          <TextField source="display_id" label="Order #" />
        </ReferenceField>
        <StatusChipField source="status" />
        <TextField source="currency_code" label="Currency" />
        <CentsField source="amount" currencySource="currency_code" />
        <CentsField source="authorized_amount" currencySource="currency_code" />
        <CentsField source="captured_amount" currencySource="currency_code" />
        <CentsField source="refunded_amount" currencySource="currency_code" />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function PaymentCollectionShow() {
  return (
    <Show>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="Details">
          <ReferenceField source="order_id" reference="orders" link="show">
            <TextField source="display_id" label="Order #" />
          </ReferenceField>
          <StatusChipField source="status" />
          <TextField source="currency_code" />
          <CentsField source="amount" currencySource="currency_code" />
          <CentsField
            source="authorized_amount"
            currencySource="currency_code"
          />
          <CentsField source="captured_amount" currencySource="currency_code" />
          <CentsField source="refunded_amount" currencySource="currency_code" />
          <DateField source="created_at" showTime />
          <DateField source="updated_at" showTime />
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Sessions">
          <ReferenceManyField
            reference="payment_sessions"
            target="payment_collection_id"
            label={false}
          >
            <Datagrid bulkActionButtons={false} rowClick="show">
              <TextField source="provider_id" label="Provider" />
              <StatusChipField source="status" />
              <CentsField source="amount" currencySource="currency_code" />
              <TextField source="currency_code" />
              <DateField source="authorized_at" showTime />
              <DateField source="captured_at" showTime />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
}

export function PaymentCollectionEdit() {
  return (
    <Edit>
      <SimpleForm>
        <SelectInput source="status" choices={PAYMENT_COLLECTION_STATUS} />
      </SimpleForm>
    </Edit>
  );
}

// ─── Payment Sessions ─────────────────────────────────────────────────────────

const sessionFilters = [
  <SelectInput source="status" choices={PAYMENT_SESSION_STATUS} />,
];

export function PaymentSessionList() {
  return (
    <List
      filters={sessionFilters}
      actions={
        <TopToolbar>
          <FilterButton />
          <ExportButton />
        </TopToolbar>
      }
      sort={{ field: "created_at", order: "DESC" }}
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <ReferenceField
          source="payment_collection_id"
          reference="payment_collections"
          link="show"
        >
          <ReferenceField source="order_id" reference="orders" link={false}>
            <TextField source="display_id" label="Order #" />
          </ReferenceField>
        </ReferenceField>
        <TextField source="provider_id" label="Provider" />
        <StatusChipField source="status" />
        <CentsField source="amount" currencySource="currency_code" />
        <TextField source="currency_code" />
        <DateField source="authorized_at" showTime />
        <DateField source="captured_at" showTime />
        <DateField source="cancelled_at" showTime />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function PaymentSessionShow() {
  return (
    <Show>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="Details">
          <ReferenceField
            source="payment_collection_id"
            reference="payment_collections"
            link="show"
          >
            <ReferenceField source="order_id" reference="orders" link="show">
              <TextField source="display_id" label="Order #" />
            </ReferenceField>
          </ReferenceField>
          <TextField source="provider_id" />
          <TextField source="provider_session_id" />
          <StatusChipField source="status" />
          <CentsField source="amount" currencySource="currency_code" />
          <TextField source="currency_code" />
          <DateField source="authorized_at" showTime />
          <DateField source="captured_at" showTime />
          <DateField source="cancelled_at" showTime />
          <DateField source="created_at" showTime />
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
}
