// import {
//   List,
//   Datagrid,
//   TextField,
//   EmailField,
//   DateField,
//   BooleanField,
//   BooleanInput,
//   SelectInput,
//   SearchInput,
//   FilterButton,
//   TopToolbar,
//   ExportButton,
//   CreateButton,
//   Show,
//   SimpleShowLayout,
//   TabbedShowLayout,
//   ReferenceManyField,
//   ReferenceField,
//   Edit,
//   Create,
//   SimpleForm,
//   TextInput,
//   DateTimeInput,
// } from "react-admin";
// import { StatusChipField, ImageUploadInput, ADMIN_ROLE } from "./shared";

// // ─── Sales Channels ───────────────────────────────────────────────────────────

// const channelFilters = [
//   <SearchInput source="name@ilike" alwaysOn placeholder="Search by name" />,
//   <BooleanInput source="is_disabled" label="Disabled" />,
//   <BooleanInput source="is_default" label="Default" />,
// ];

// export function SalesChannelList() {
//   return (
//     <List
//       filters={channelFilters}
//       actions={
//         <TopToolbar>
//           <FilterButton />
//           <CreateButton />
//           <ExportButton />
//         </TopToolbar>
//       }
//       sort={{ field: "created_at", order: "DESC" }}
//     >
//       <Datagrid rowClick="show" bulkActionButtons={false}>
//         <TextField source="name" />
//         <TextField source="description" />
//         <BooleanField source="is_default" />
//         <BooleanField source="is_disabled" />
//         <DateField source="created_at" showTime />
//       </Datagrid>
//     </List>
//   );
// }

// export function SalesChannelShow() {
//   return (
//     <Show>
//       <TabbedShowLayout>
//         <TabbedShowLayout.Tab label="Details">
//           <TextField source="name" />
//           <TextField source="description" />
//           <BooleanField source="is_default" />
//           <BooleanField source="is_disabled" />
//           <DateField source="created_at" showTime />
//           <DateField source="updated_at" showTime />
//         </TabbedShowLayout.Tab>
//         <TabbedShowLayout.Tab label="Products">
//           <ReferenceManyField
//             reference="sales_channel_products"
//             target="sales_channel_id"
//             label={false}
//           >
//             <Datagrid bulkActionButtons={false}>
//               <ReferenceField
//                 source="product_id"
//                 reference="products"
//                 link="show"
//               >
//                 <TextField source="title" label="Product" />
//               </ReferenceField>
//               <DateField source="created_at" showTime />
//             </Datagrid>
//           </ReferenceManyField>
//         </TabbedShowLayout.Tab>
//       </TabbedShowLayout>
//     </Show>
//   );
// }

// export function SalesChannelEdit() {
//   return (
//     <Edit>
//       <SimpleForm>
//         <TextInput source="name" required />
//         <TextInput source="description" multiline />
//         <BooleanInput source="is_default" />
//         <BooleanInput source="is_disabled" />
//       </SimpleForm>
//     </Edit>
//   );
// }

// export function SalesChannelCreate() {
//   return (
//     <Create>
//       <SimpleForm>
//         <TextInput source="name" required />
//         <TextInput source="description" multiline />
//         <BooleanInput source="is_default" defaultValue={false} />
//         <BooleanInput source="is_disabled" defaultValue={false} />
//       </SimpleForm>
//     </Create>
//   );
// }

// // ─── Admin Users ──────────────────────────────────────────────────────────────

// const adminUserFilters = [
//   <SearchInput source="email@ilike" alwaysOn placeholder="Search by email" />,
//   <SelectInput source="role" choices={ADMIN_ROLE} />,
//   <BooleanInput source="is_active" label="Active" />,
// ];

// export function AdminUserList() {
//   return (
//     <List
//       filters={adminUserFilters}
//       actions={
//         <TopToolbar>
//           <FilterButton />
//           <ExportButton />
//         </TopToolbar>
//       }
//       sort={{ field: "created_at", order: "DESC" }}
//     >
//       <Datagrid rowClick="show" bulkActionButtons={false}>
//         <TextField source="first_name" />
//         <TextField source="last_name" />
//         <EmailField source="email" />
//         <StatusChipField source="role" />
//         <BooleanField source="is_active" />
//         <DateField source="last_login_at" showTime />
//         <DateField source="created_at" showTime />
//       </Datagrid>
//     </List>
//   );
// }

// export function AdminUserShow() {
//   return (
//     <Show>
//       <SimpleShowLayout>
//         <TextField source="first_name" />
//         <TextField source="last_name" />
//         <EmailField source="email" />
//         <StatusChipField source="role" />
//         <BooleanField source="is_active" />
//         <DateField source="last_login_at" showTime />
//         <DateField source="created_at" showTime />
//         <DateField source="updated_at" showTime />
//       </SimpleShowLayout>
//     </Show>
//   );
// }

// export function AdminUserEdit() {
//   return (
//     <Edit>
//       <SimpleForm>
//         <TextInput source="first_name" />
//         <TextInput source="last_name" />
//         <TextInput source="email" type="email" required />
//         <SelectInput source="role" choices={ADMIN_ROLE} />
//         <BooleanInput source="is_active" />
//         <ImageUploadInput source="avatar_url" bucket="avatars" label="Avatar" />
//       </SimpleForm>
//     </Edit>
//   );
// }

// // ─── Admin Invitations ────────────────────────────────────────────────────────

// const invitationFilters = [
//   <SearchInput source="email@ilike" alwaysOn placeholder="Search by email" />,
//   <SelectInput source="role" choices={ADMIN_ROLE} />,
// ];

// export function AdminInvitationList() {
//   return (
//     <List
//       filters={invitationFilters}
//       actions={
//         <TopToolbar>
//           <FilterButton />
//           <CreateButton />
//           <ExportButton />
//         </TopToolbar>
//       }
//       sort={{ field: "created_at", order: "DESC" }}
//     >
//       <Datagrid rowClick="show" bulkActionButtons={false}>
//         <EmailField source="email" />
//         <StatusChipField source="role" />
//         <DateField source="accepted_at" showTime />
//         <DateField source="expires_at" showTime />
//         <DateField source="created_at" showTime />
//       </Datagrid>
//     </List>
//   );
// }

// export function AdminInvitationShow() {
//   return (
//     <Show>
//       <SimpleShowLayout>
//         <EmailField source="email" />
//         <StatusChipField source="role" />
//         <TextField source="token" />
//         <DateField source="accepted_at" showTime />
//         <DateField source="expires_at" showTime />
//         <DateField source="created_at" showTime />
//       </SimpleShowLayout>
//     </Show>
//   );
// }

// function generateToken(): string {
//   const arr = new Uint8Array(32);
//   crypto.getRandomValues(arr);
//   return Array.from(arr)
//     .map((b) => b.toString(16).padStart(2, "0"))
//     .join("");
// }

// export function AdminInvitationCreate() {
//   const transform = (data: Record<string, unknown>) => ({
//     ...data,
//     token: generateToken(),
//   });

//   const mutationOptions = {
//     onSuccess: async (data: Record<string, unknown>) => {
//       try {
//         const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
//         const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
//         await fetch(`${supabaseUrl}/functions/v1/admin-send-invite`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${supabaseKey}`,
//           },
//           body: JSON.stringify({ invitationId: data.id }),
//         });
//       } catch (err) {
//         console.error("Failed to send invite email:", err);
//       }
//     },
//   };

//   return (
//     <Create transform={transform} mutationOptions={mutationOptions}>
//       <SimpleForm>
//         <TextInput source="email" type="email" required />
//         <SelectInput source="role" choices={ADMIN_ROLE} defaultValue="viewer" />
//         <DateTimeInput source="expires_at" required />
//       </SimpleForm>
//     </Create>
//   );
// }

// // ─── Customers (moved here from customers/index.tsx for completeness) ─────────
// // Note: customers/index.tsx remains the primary file. This section is not
// // exported — customer fixes are applied directly in customers/index.tsx below.

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
  NumberField,
  NumberInput,
  FilterButton,
  TopToolbar,
  ExportButton,
  CreateButton,
  Show,
  SimpleShowLayout,
  TabbedShowLayout,
  ReferenceManyField,
  ReferenceField,
  ReferenceInput,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  DateTimeInput,
} from "react-admin";
import { StatusChipField, ImageUploadInput, ADMIN_ROLE } from "./shared";

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
              <ReferenceField
                source="product_id"
                reference="products"
                link="show"
              >
                <TextField source="title" label="Product" />
              </ReferenceField>
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
        <ImageUploadInput source="avatar_url" bucket="avatars" label="Avatar" />
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
        console.error("Failed to send invite email:", err);
      }
    },
  };

  return (
    <Create transform={transform} mutationOptions={mutationOptions}>
      <SimpleForm>
        <TextInput source="email" type="email" required />
        <SelectInput source="role" choices={ADMIN_ROLE} defaultValue="viewer" />
        <DateTimeInput source="expires_at" required />
      </SimpleForm>
    </Create>
  );
}

// ─── Tax Regions ──────────────────────────────────────────────────────────────

const taxRegionFilters = [
  <SearchInput source="name@ilike" alwaysOn placeholder="Search by name" />,
  <SearchInput source="country_code@ilike" label="Country code" />,
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
        <TextField source="country_code" />
        <TextField source="province_code" />
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
          <DateField source="created_at" showTime />
          <DateField source="updated_at" showTime />
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Tax Rates">
          <ReferenceManyField
            reference="tax_rates"
            target="tax_region_id"
            label={false}
          >
            <Datagrid bulkActionButtons={false} rowClick="show">
              <TextField source="name" />
              <NumberField source="rate" />
              <TextField source="code" />
              <BooleanField source="is_default" />
              <DateField source="created_at" showTime />
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
      </SimpleForm>
    </Create>
  );
}

// ─── Tax Rates ────────────────────────────────────────────────────────────────

const taxRateFilters = [
  <SearchInput source="name@ilike" alwaysOn placeholder="Search by name" />,
  <SearchInput source="code@ilike" label="Code" />,
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
        <NumberField source="rate" />
        <TextField source="code" />
        <ReferenceField
          source="tax_region_id"
          reference="tax_regions"
          link="show"
        >
          <TextField source="name" />
        </ReferenceField>
        <BooleanField source="is_default" />
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
        <NumberField source="rate" />
        <TextField source="code" />
        <ReferenceField
          source="tax_region_id"
          reference="tax_regions"
          link="show"
        >
          <TextField source="name" />
        </ReferenceField>
        <BooleanField source="is_default" />
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
        <NumberInput source="rate" required />
        <TextInput source="code" />
        <ReferenceInput source="tax_region_id" reference="tax_regions">
          <SelectInput optionText="name" required />
        </ReferenceInput>
        <BooleanInput source="is_default" />
      </SimpleForm>
    </Edit>
  );
}

export function TaxRateCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" required />
        <NumberInput source="rate" required />
        <TextInput source="code" />
        <ReferenceInput source="tax_region_id" reference="tax_regions">
          <SelectInput optionText="name" required />
        </ReferenceInput>
        <BooleanInput source="is_default" defaultValue={false} />
      </SimpleForm>
    </Create>
  );
}
