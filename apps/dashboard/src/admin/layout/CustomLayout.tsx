import { Layout } from "react-admin";
import type { LayoutProps } from "react-admin";
import { CustomMenu } from "../menu/CustomMenu";

export function CustomLayout(props: LayoutProps) {
  return <Layout {...props} menu={CustomMenu} />;
}
