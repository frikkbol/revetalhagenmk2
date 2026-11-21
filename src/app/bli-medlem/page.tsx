import BliMedlemClient from "@/components/screen/bli-medlem-client";
import { api } from "@/trpc/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bli medlem",
  description:
    "Bli medlem i Revetalhagen og bli en del av et åpent, livssynsnøytralt og inkluderende fellesskap for mennesker i alle aldre.",
  alternates: {
    canonical: "/bli-medlem",
  },
};

export default async function BliMedlemPage() {
  const content = await api.cms.getContent({
    slug: "become-member",
  });

  return <BliMedlemClient initialContent={content?.[0]?.content.content} />;
}
