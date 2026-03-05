import {
  List,
  Datagrid,
  TextField,
  DateField,
  Show,
  TabbedShowLayout,
  ReferenceManyField,
  NumberField,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  SelectInput,
  TopToolbar,
  FilterButton,
  ExportButton,
} from "react-admin";
import {
  StatusChipField,
  CentsField,
  RETURN_STATUS,
  REFUND_REASON,
} from "../shared";

// ─── Order Fulfillments ───────────────────────────────────────────────────────

export function OrderFulfillmentList() {
  return (
    <List
      sort={{ field: "created_at", order: "DESC" }}
      actions={
        <TopToolbar>
          <ExportButton />
        </TopToolbar>
      }
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <TextField source="order_id" label="Order" />
        <TextField source="provider_id" label="Provider" />
        <TextField source="tracking_number" />
        <DateField source="shipped_at" showTime />
        <DateField source="cancelled_at" showTime />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function OrderFulfillmentShow() {
  return (
    <Show>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="Details">
          <TextField source="order_id" />
          <TextField source="provider_id" />
          <TextField source="tracking_number" />
          <TextField source="tracking_url" />
          <DateField source="shipped_at" showTime />
          <DateField source="cancelled_at" showTime />
          <DateField source="created_at" showTime />
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Items">
          <ReferenceManyField
            reference="order_fulfillment_items"
            target="fulfillment_id"
            label={false}
          >
            <Datagrid bulkActionButtons={false}>
              <TextField source="line_item_id" />
              <NumberField source="quantity" />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
}

export function OrderFulfillmentEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="tracking_number" />
        <TextInput source="tracking_url" />
        <TextInput source="provider_id" />
      </SimpleForm>
    </Edit>
  );
}

export function OrderFulfillmentCreate() {
  return (
    <Create>
      <SimpleForm>
        <ReferenceInput source="order_id" reference="orders">
          <AutocompleteInput optionText="email" />
        </ReferenceInput>
        <TextInput source="provider_id" />
        <TextInput source="tracking_number" />
        <TextInput source="tracking_url" />
      </SimpleForm>
    </Create>
  );
}

// ─── Order Returns ────────────────────────────────────────────────────────────

const returnFilters = [<SelectInput source="status" choices={RETURN_STATUS} />];

export function OrderReturnList() {
  return (
    <List
      filters={returnFilters}
      sort={{ field: "created_at", order: "DESC" }}
      actions={
        <TopToolbar>
          <FilterButton />
          <ExportButton />
        </TopToolbar>
      }
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <TextField source="order_id" label="Order" />
        <StatusChipField source="status" />
        <CentsField source="refund_amount" />
        <CentsField source="shipping_total" />
        <DateField source="received_at" showTime />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function OrderReturnShow() {
  return (
    <Show>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="Details">
          <TextField source="order_id" />
          <StatusChipField source="status" />
          <CentsField source="refund_amount" />
          <CentsField source="shipping_total" />
          <DateField source="received_at" showTime />
          <DateField source="created_at" showTime />
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Items">
          <ReferenceManyField
            reference="order_return_items"
            target="return_id"
            label={false}
          >
            <Datagrid bulkActionButtons={false}>
              <TextField source="line_item_id" />
              <NumberField source="quantity" />
              <TextField source="note" />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
}

export function OrderReturnEdit() {
  return (
    <Edit>
      <SimpleForm>
        <SelectInput source="status" choices={RETURN_STATUS} />
      </SimpleForm>
    </Edit>
  );
}

export function OrderReturnCreate() {
  return (
    <Create>
      <SimpleForm>
        <ReferenceInput source="order_id" reference="orders">
          <AutocompleteInput optionText="email" />
        </ReferenceInput>
        <SelectInput
          source="status"
          choices={RETURN_STATUS}
          defaultValue="requested"
        />
      </SimpleForm>
    </Create>
  );
}

// ─── Order Refunds ────────────────────────────────────────────────────────────

const refundFilters = [<SelectInput source="reason" choices={REFUND_REASON} />];

export function OrderRefundList() {
  return (
    <List
      filters={refundFilters}
      sort={{ field: "created_at", order: "DESC" }}
      actions={
        <TopToolbar>
          <FilterButton />
          <ExportButton />
        </TopToolbar>
      }
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <TextField source="order_id" label="Order" />
        <CentsField source="amount" />
        <StatusChipField source="reason" />
        <TextField source="note" />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function OrderRefundShow() {
  return (
    <Show>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="Details">
          <TextField source="order_id" />
          <CentsField source="amount" />
          <StatusChipField source="reason" />
          <TextField source="note" />
          <DateField source="created_at" showTime />
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
}

export function OrderRefundCreate() {
  return (
    <Create>
      <SimpleForm>
        <ReferenceInput source="order_id" reference="orders">
          <AutocompleteInput optionText="email" />
        </ReferenceInput>
        <TextInput source="amount" label="Amount (cents)" />
        <SelectInput source="reason" choices={REFUND_REASON} />
        <TextInput source="note" multiline />
      </SimpleForm>
    </Create>
  );
}
