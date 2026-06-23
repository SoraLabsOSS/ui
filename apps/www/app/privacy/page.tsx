import { redirect } from "next/navigation";

export default function PrivacyRedirectPage() {
  redirect("/legal/privacy");
}
