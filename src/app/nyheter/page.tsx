import DynamicBreadcrumbs from "@/components/dynamic-breadcrumbs";
import NewsFilters from "@/components/screen/news-filters";
import NewsletterSubscription from "@/components/screen/newsletter-subscription/newsletter-subscription";
import SlideAnimation from "@/components/ui/animated/slide-animation";
import NewsList from "@/components/ui/news-list";
import { api } from "@/trpc/server";
import { HomeIcon } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nyheter",
  description:
    "Les siste nytt, oppdateringer og historier fra Revetalhagen.",
  alternates: {
    canonical: "/nyheter",
  },
};

export default async function NyheterPage() {
  const initialPage = await api.news.getAllInfinite({
    limit: 9,
    direction: "forward",
    query: "",
  });

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-2.5 px-5 pt-24 md:pt-36">
      <DynamicBreadcrumbs
        className="mt-5 px-5 md:pl-20"
        items={[
          { href: "/", label: "Hjem", icon: <HomeIcon size={16} /> },
          { href: "/nyheter", label: "Nyheter" },
        ]}
      />
      <SlideAnimation className="w-fit" direction="right">
        <h1 className="text-foreground flex w-fit flex-row flex-wrap items-center justify-start gap-x-2 pl-5 text-left text-4xl leading-12 md:gap-5 md:pl-20 md:text-6xl md:leading-20">
          <span>Hva er siste</span>{" "}
          <span className="text-secondary-foreground bg-secondary inline-block rounded-3xl px-2">
            nytt
          </span>{" "}
          <span>i Revetalhagen?</span>
        </h1>
      </SlideAnimation>
      <div className="flex flex-col gap-5 px-5 md:px-20">
        <NewsFilters />
        <NewsList initialPage={initialPage} />
      </div>
      <NewsletterSubscription />
    </div>
  );
}
