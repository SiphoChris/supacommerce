import {
  List,
  Datagrid,
  TextField,
  DateField,
  Show,
  TabbedShowLayout,
  ReferenceManyField,
  ReferenceField,
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
  CreateButton,
  DateTimeInput,
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
          <CreateButton />
          <ExportButton />
        </TopToolbar>
      }
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <ReferenceField source="order_id" reference="orders" link="show">
          <TextField source="display_id" label="Order #" />
        </ReferenceField>
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
          <ReferenceField source="order_id" reference="orders" link="show">
            <TextField source="display_id" label="Order #" />
          </ReferenceField>
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
              <ReferenceField
                source="line_item_id"
                reference="order_line_items"
                link={false}
                emptyText="—"
              >
                <TextField source="title" label="Item" />
              </ReferenceField>
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
        <ReferenceField source="order_id" reference="orders" link={false}>
          <TextField source="display_id" label="Order #" />
        </ReferenceField>
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
          <AutocompleteInput
            optionText={(r) => (r ? `#${r.display_id} — ${r.email}` : "")}
            label="Order"
            required
          />
        </ReferenceInput>
        <TextInput source="provider_id" helperText="e.g. paxi, manual" />
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
          <CreateButton />
          <ExportButton />
        </TopToolbar>
      }
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <ReferenceField source="order_id" reference="orders" link="show">
          <TextField source="display_id" label="Order #" />
        </ReferenceField>
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
          <ReferenceField source="order_id" reference="orders" link="show">
            <TextField source="display_id" label="Order #" />
          </ReferenceField>
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
              <ReferenceField
                source="line_item_id"
                reference="order_line_items"
                link={false}
                emptyText="—"
              >
                <TextField source="title" label="Item" />
              </ReferenceField>
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
        <ReferenceField source="order_id" reference="orders" link={false}>
          <TextField source="display_id" label="Order #" />
        </ReferenceField>
        <SelectInput source="status" choices={RETURN_STATUS} />
        <DateTimeInput source="received_at" label="Received At" />
      </SimpleForm>
    </Edit>
  );
}

export function OrderReturnCreate() {
  return (
    <Create>
      <SimpleForm>
        <ReferenceInput source="order_id" reference="orders">
          <AutocompleteInput
            optionText={(r) => (r ? `#${r.display_id} — ${r.email}` : "")}
            label="Order"
            required
          />
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
          <CreateButton />
          <ExportButton />
        </TopToolbar>
      }
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <ReferenceField source="order_id" reference="orders" link="show">
          <TextField source="display_id" label="Order #" />
        </ReferenceField>
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
          <ReferenceField source="order_id" reference="orders" link="show">
            <TextField source="display_id" label="Order #" />
          </ReferenceField>
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
          <AutocompleteInput
            optionText={(r) => (r ? `#${r.display_id} — ${r.email}` : "")}
            label="Order"
            required
          />
        </ReferenceInput>
        <NumberInput
          source="amount"
          label="Amount (cents)"
          helperText="e.g. 1099 = R10.99"
          required
        />
        <SelectInput source="reason" choices={REFUND_REASON} required />
        <TextInput source="note" multiline />
      </SimpleForm>
    </Create>
  );
}
