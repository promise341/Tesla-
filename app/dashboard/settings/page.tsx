// Redirect old /dashboard/settings → /dashboard/account-settings
import { redirect } from "next/navigation";

export default function OldSettingsRedirect() {
  redirect("/dashboard/account-settings");
}
