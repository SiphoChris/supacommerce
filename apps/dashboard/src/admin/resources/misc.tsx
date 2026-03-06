import {
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  BooleanField,
  BooleanInput,
  SelectInput,
  SearchInput,
  FilterButton,
  TopToolbar,
  CreateButton,
  ExportButton,
  Show,
  SimpleShowLayout,
  TabbedShowLayout,
  ReferenceManyField,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  NumberField,
  NumberInput,
  ReferenceInput,
  AutocompleteInput,
} from "react-admin";
import { StatusChipField, ADMIN_ROLE } from "./shared";

// ─── Sales Channels ───────────────────────────────────────────────────────────

const channelFilters = [
  <SearchInput source="name@ilike" alwaysOn placeholder="Search by name" />,
  <BooleanInput source="is_disabled" label="Disabled" />,
  <BooleanInput source="is_default" label="Default" />,
];

export function SalesChannelList() {
  return (
    <List
      filters={channelFilters}
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
        <TextField source="description" />
        <BooleanField source="is_default" />
        <BooleanField source="is_disabled" />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function SalesChannelShow() {
  return (
    <Show>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="Details">
          <TextField source="name" />
          <TextField source="description" />
          <BooleanField source="is_default" />
          <BooleanField source="is_disabled" />
          <DateField source="created_at" showTime />
          <DateField source="updated_at" showTime />
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Products">
          <ReferenceManyField
            reference="sales_channel_products"
            target="sales_channel_id"
            label={false}
          >
            <Datagrid bulkActionButtons={false}>
              <TextField source="product_id" />
              <DateField source="created_at" showTime />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
}

export function SalesChannelEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" required />
        <TextInput source="description" multiline />
        <BooleanInput source="is_default" />
        <BooleanInput source="is_disabled" />
      </SimpleForm>
    </Edit>
  );
}

export function SalesChannelCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" required />
        <TextInput source="description" multiline />
        <BooleanInput source="is_default" defaultValue={false} />
        <BooleanInput source="is_disabled" defaultValue={false} />
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
        <TextField source="province_code" label="Province" />
        <TextField source="provider_id" label="Provider" />
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
          <TextField source="province_code" />
          <TextField source="provider_id" />
          <TextField source="region_id" />
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
        <TextInput source="country_code" required />
        <TextInput source="province_code" />
        <TextInput source="provider_id" />
      </SimpleForm>
    </Edit>
  );
}

export function TaxRegionCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" required />
        <TextInput source="country_code" required />
        <TextInput source="province_code" />
        <TextInput source="provider_id" />
        <ReferenceInput source="region_id" reference="regions" allowEmpty>
          <AutocompleteInput optionText="name" />
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
        <TextField source="tax_region_id" label="Tax Region" />
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
        <TextField source="tax_region_id" />
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
        <TextInput source="name" required />
        <TextInput source="code" />
        <NumberInput source="rate" required />
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
        <TextInput source="code" />
        <NumberInput source="rate" required />
        <BooleanInput source="is_default" defaultValue={false} />
        <BooleanInput source="is_active" defaultValue={true} />
      </SimpleForm>
    </Create>
  );
}

// ─── Admin Users ──────────────────────────────────────────────────────────────

const adminUserFilters = [
  <SearchInput source="email@ilike" alwaysOn placeholder="Search by email" />,
  <SelectInput source="role" choices={ADMIN_ROLE} />,
  <BooleanInput source="is_active" label="Active" />,
];

export function AdminUserList() {
  return (
    <List
      filters={adminUserFilters}
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
        <TextField source="first_name" />
        <TextField source="last_name" />
        <EmailField source="email" />
        <StatusChipField source="role" />
        <BooleanField source="is_active" />
        <DateField source="last_login_at" showTime />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function AdminUserShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="first_name" />
        <TextField source="last_name" />
        <EmailField source="email" />
        <StatusChipField source="role" />
        <BooleanField source="is_active" />
        <DateField source="last_login_at" showTime />
        <DateField source="created_at" showTime />
        <DateField source="updated_at" showTime />
      </SimpleShowLayout>
    </Show>
  );
}

export function AdminUserEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="first_name" />
        <TextInput source="last_name" />
        <TextInput source="email" type="email" required />
        <SelectInput source="role" choices={ADMIN_ROLE} />
        <BooleanInput source="is_active" />
        <TextInput source="avatar_url" label="Avatar URL" />
      </SimpleForm>
    </Edit>
  );
}

// ─── Admin Invitations ────────────────────────────────────────────────────────

const invitationFilters = [
  <SearchInput source="email@ilike" alwaysOn placeholder="Search by email" />,
  <SelectInput source="role" choices={ADMIN_ROLE} />,
];

export function AdminInvitationList() {
  return (
    <List
      filters={invitationFilters}
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
        <EmailField source="email" />
        <StatusChipField source="role" />
        <DateField source="accepted_at" showTime />
        <DateField source="expires_at" showTime />
        <DateField source="created_at" showTime />
      </Datagrid>
    </List>
  );
}

export function AdminInvitationShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <EmailField source="email" />
        <StatusChipField source="role" />
        <TextField source="token" />
        <DateField source="accepted_at" showTime />
        <DateField source="expires_at" showTime />
        <DateField source="created_at" showTime />
      </SimpleShowLayout>
    </Show>
  );
}

function generateToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function AdminInvitationCreate() {
  const transform = (data: Record<string, unknown>) => ({
    ...data,
    token: generateToken(),
  });

  const mutationOptions = {
    onSuccess: async (data: Record<string, unknown>) => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        await fetch(`${supabaseUrl}/functions/v1/admin-send-invite`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ invitationId: data.id }),
        });
      } catch (err) {
        // Non-fatal — invitation was created, email just didn't send.
        // Admin can resend manually.
        console.error("Failed to send invite email:", err);
      }
    },
  };

  return (
    <Create transform={transform} mutationOptions={mutationOptions}>
      <SimpleForm>
        <TextInput source="email" type="email" required />
        <SelectInput source="role" choices={ADMIN_ROLE} defaultValue="viewer" />
        <TextInput source="expires_at" type="datetime-local" required />
      </SimpleForm>
    </Create>
  );
}
