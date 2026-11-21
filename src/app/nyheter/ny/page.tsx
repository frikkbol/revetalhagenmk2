import DynamicBreadcrumbs from "@/components/dynamic-breadcrumbs";
import NewsEditor from "@/components/screen/news-editor";
import { Button } from "@/components/ui/button";
import { auth } from "@/server/auth";
import { ArrowLeftIcon, HomeIcon } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Ny artikkel",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewNewsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (!session.user.role?.includes("admin")) {
    redirect("/nyheter");
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 pt-24 pb-16 md:px-10 md:pt-32">
      <DynamicBreadcrumbs
        items={[
          { href: "/", label: "Hjem", icon: <HomeIcon size={16} /> },
          { href: "/nyheter", label: "Nyheter" },
          { href: "/nyheter/ny", label: "Ny artikkel" },
        ]}
      />

      <div className="flex flex-col gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-3 w-fit">
          <Link href="/nyheter">
            <ArrowLeftIcon />
            Tilbake til nyheter
          </Link>
        </Button>
        <h1 className="text-foreground text-3xl font-semibold md:text-4xl">
          Skriv ny artikkel
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Legg til en nyhet som vil bli synlig for alle brukere av nettsiden.
        </p>
      </div>

      <NewsEditor />
    </div>
  );
}
