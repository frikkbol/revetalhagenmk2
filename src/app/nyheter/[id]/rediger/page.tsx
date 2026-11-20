import DynamicBreadcrumbs from "@/components/dynamic-breadcrumbs";
import NewsEditor from "@/components/screen/news-editor";
import { Button } from "@/components/ui/button";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { news } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { ArrowLeftIcon, HomeIcon } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (!session.user.role?.includes("admin")) {
    redirect("/nyheter");
  }

  const { id } = await params;
  const articleId = Number(id);
  if (Number.isNaN(articleId)) {
    notFound();
  }

  const article = await db.query.news.findFirst({
    where: eq(news.id, articleId),
  });

  if (!article) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 pt-24 pb-16 md:px-10 md:pt-32">
      <DynamicBreadcrumbs
        items={[
          { href: "/", label: "Hjem", icon: <HomeIcon size={16} /> },
          { href: "/nyheter", label: "Nyheter" },
          {
            href: `/nyheter/${article.id}`,
            label: article.name ?? "Nyhetsartikkel",
          },
          { href: `/nyheter/${article.id}/rediger`, label: "Rediger" },
        ]}
      />

      <div className="flex flex-col gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-3 w-fit">
          <Link href={`/nyheter/${article.id}`}>
            <ArrowLeftIcon />
            Tilbake til artikkelen
          </Link>
        </Button>
        <h1 className="text-foreground text-3xl font-semibold md:text-4xl">
          Rediger artikkel
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Oppdater tittel, forsidebilde, oppsummering eller innhold for{" "}
          {article.name ? `«${article.name}»` : "artikkelen"}.
        </p>
      </div>

      <NewsEditor defaultValues={article} />
    </div>
  );
}
