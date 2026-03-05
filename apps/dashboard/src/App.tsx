// import { Admin, Resource, CustomRoutes } from "react-admin";
// import { BrowserRouter, Route } from "react-router-dom";
// import { createClient } from "@supabase/supabase-js";
// import {
//   LoginPage,
//   SetPasswordPage,
//   ForgotPasswordPage,
//   defaultI18nProvider,
//   supabaseDataProvider,
//   supabaseAuthProvider,
// } from "ra-supabase";

// import { resources } from "./lib/resources";
// import { CustomLayout } from "./admin/layout/CustomLayout";
// import { Dashboard } from "./admin/dashboard/Dashboard";
// import { AcceptInvitePage } from "./pages/AcceptInvitePage";

// const instanceUrl = import.meta.env.VITE_SUPABASE_URL;
// const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// const supabaseClient = createClient(instanceUrl, apiKey);

// const dataProvider = supabaseDataProvider({
//   instanceUrl,
//   apiKey,
//   supabaseClient,
// });
// const authProvider = supabaseAuthProvider(supabaseClient, {});

// export const App = () => (
//   <BrowserRouter>
//     <Admin
//       dataProvider={dataProvider}
//       authProvider={authProvider}
//       i18nProvider={defaultI18nProvider}
//       loginPage={LoginPage}
//       layout={CustomLayout}
//       dashboard={Dashboard}
//     >
//       {resources.map((r) => (
//         <Resource key={r.name} {...r} />
//       ))}
//       <CustomRoutes noLayout>
//         <Route path={SetPasswordPage.path} element={<SetPasswordPage />} />
//         <Route
//           path={ForgotPasswordPage.path}
//           element={<ForgotPasswordPage />}
//         />
//         <Route path="/accept-invite" element={<AcceptInvitePage />} />
//       </CustomRoutes>
//     </Admin>
//   </BrowserRouter>
// );

// export default App;

import { Admin, Resource, CustomRoutes } from "react-admin";
import { BrowserRouter, Route } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import {
  LoginPage,
  SetPasswordPage,
  ForgotPasswordPage,
  defaultI18nProvider,
  supabaseDataProvider,
  supabaseAuthProvider,
} from "ra-supabase";

import { resources } from "./lib/resources";
import { CustomLayout } from "./admin/layout/CustomLayout";
import { Dashboard } from "./admin/dashboard/Dashboard";
import { AcceptInvitePage } from "./pages/AcceptInvitePage";
import { pepLightTheme, pepDarkTheme } from ".//theme/theme";

const instanceUrl = import.meta.env.VITE_SUPABASE_URL;
const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseClient = createClient(instanceUrl, apiKey);

const dataProvider = supabaseDataProvider({
  instanceUrl,
  apiKey,
  supabaseClient,
});
const authProvider = supabaseAuthProvider(supabaseClient, {});

export const App = () => (
  <BrowserRouter>
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      i18nProvider={defaultI18nProvider}
      loginPage={LoginPage}
      layout={CustomLayout}
      dashboard={Dashboard}
      theme={pepLightTheme}
      darkTheme={pepDarkTheme}
      defaultTheme="light"
    >
      {resources.map((r) => (
        <Resource key={r.name} {...r} />
      ))}
      <CustomRoutes noLayout>
        <Route path={SetPasswordPage.path} element={<SetPasswordPage />} />
        <Route
          path={ForgotPasswordPage.path}
          element={<ForgotPasswordPage />}
        />
        <Route path="/accept-invite" element={<AcceptInvitePage />} />
      </CustomRoutes>
    </Admin>
  </BrowserRouter>
);

export default App;
