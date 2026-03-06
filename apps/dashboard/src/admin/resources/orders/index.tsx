import {
  List,
  Datagrid,
  TextField,
  DateField,
  EmailField,
  NumberField,
  SearchInput,
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
  ORDER_STATUS,
  ORDER_PAYMENT_STATUS,
  ORDER_FULFILLMENT_STATUS,
} from "../shared";

// ─── Filters ──────────────────────────────────────────────────────────────────

const filters = [
  <SearchInput source="email@ilike" alwaysOn placeholder="Search by email" />,
  <SelectInput source="status" choices={ORDER_STATUS} />,
  <SelectInput source="payment_status" choices={ORDER_PAYMENT_STATUS} />,
  <SelectInput
    source="fulfillment_status"
    choices={ORDER_FULFILLMENT_STATUS}
  />,
];

// ─── List ─────────────────────────────────────────────────────────────────────

export function OrderList() {
  return (
    <List
      filters={filters}
      actions={
        <TopToolbar>
          <FilterButton />
          <ExportButton />
        </TopToolbar>
      }
      sort={{ field: "created_at", order: "DESC" }}
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <TextField source="display_id" label="Order #" />
        <EmailField source="email" />
        <ReferenceField
          source="customer_id"
          reference="customers"
          link="show"
          emptyText="—"
        >
          <TextField source="first_name" />
        </ReferenceField>
        <StatusChipField source="status" />
        <StatusChipField source="payment_status" label="Payment" />
        <StatusChipField source="fulfillment_status" label="Fulfillment" />
        <CentsField source="total" currencySource="currency_code" />
        <TextField source="currency_code" label="Currency" />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

// ─── Show ─────────────────────────────────────────────────────────────────────

export function OrderShow() {
  return (
    <Show>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="Summary">
          <TextField source="display_id" label="Order #" />
          <EmailField source="email" />
          <ReferenceField
            source="customer_id"
            reference="customers"
            link="show"
            emptyText="—"
          >
            <TextField source="email" label="Customer" />
          </ReferenceField>
          <ReferenceField
            source="region_id"
            reference="regions"
            link="show"
            emptyText="—"
          >
            <TextField source="name" label="Region" />
          </ReferenceField>
          <StatusChipField source="status" />
          <StatusChipField source="payment_status" label="Payment Status" />
          <StatusChipField
            source="fulfillment_status"
            label="Fulfillment Status"
          />
          <TextField source="currency_code" />
          <CentsField source="subtotal" currencySource="currency_code" />
          <CentsField source="discount_total" currencySource="currency_code" />
          <CentsField source="shipping_total" currencySource="currency_code" />
          <CentsField source="tax_total" currencySource="currency_code" />
          <CentsField source="total" currencySource="currency_code" />
          <DateField source="created_at" showTime />
          <DateField source="updated_at" showTime />
          <DateField source="cancelled_at" showTime />
        </TabbedShowLayout.Tab>

        <TabbedShowLayout.Tab label="Line Items">
          <ReferenceManyField
            reference="order_line_items"
            target="order_id"
            label={false}
          >
            <Datagrid bulkActionButtons={false}>
              <TextField source="title" />
              <TextField source="subtitle" />
              <NumberField source="quantity" />
              <CentsField source="unit_price" />
              <CentsField source="subtotal" />
              <CentsField source="total" />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>

        <TabbedShowLayout.Tab label="Fulfillments">
          <ReferenceManyField
            reference="order_fulfillments"
            target="order_id"
            label={false}
          >
            <Datagrid bulkActionButtons={false} rowClick="show">
              <TextField source="provider_id" label="Provider" />
              <TextField source="tracking_number" />
              <TextField source="tracking_url" />
              <DateField source="shipped_at" showTime />
              <DateField source="cancelled_at" showTime />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>

        <TabbedShowLayout.Tab label="Returns">
          <ReferenceManyField
            reference="order_returns"
            target="order_id"
            label={false}
          >
            <Datagrid bulkActionButtons={false} rowClick="show">
              <StatusChipField source="status" />
              <CentsField source="refund_amount" />
              <CentsField source="shipping_total" />
              <DateField source="received_at" showTime />
              <DateField source="created_at" showTime />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>

        <TabbedShowLayout.Tab label="Refunds">
          <ReferenceManyField
            reference="order_refunds"
            target="order_id"
            label={false}
          >
            <Datagrid bulkActionButtons={false}>
              <CentsField source="amount" />
              <StatusChipField source="reason" />
              <TextField source="note" />
              <DateField source="created_at" showTime />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
}

// ─── Edit ─────────────────────────────────────────────────────────────────────

export function OrderEdit() {
  return (
    <Edit>
      <SimpleForm>
        <SelectInput source="status" choices={ORDER_STATUS} />
        <SelectInput source="payment_status" choices={ORDER_PAYMENT_STATUS} />
        <SelectInput
          source="fulfillment_status"
          choices={ORDER_FULFILLMENT_STATUS}
        />
      </SimpleForm>
    </Edit>
  );
}
