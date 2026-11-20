import { cn } from "@/lib/utils";
import {
  ArrowRightIcon,
  NewspaperIcon,
  TriangleAlertIcon,
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";
import NewsCard from "./news-card";

type LandingNewsArticle = {
  id: number;
  name: string | null;
  preview: string | null;
  image: string | null;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    image: string | null;
    email: string;
    role: string | null;
  } | null;
};

type LandingNewsListProps = {
  articles: LandingNewsArticle[];
} & React.HTMLAttributes<HTMLDivElement>;

const LandingNewsList = ({
  articles,
  className,
  ...props
}: LandingNewsListProps) => {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 md:px-10",
        className,
      )}
      {...props}
    >
      <div className="flex flex-row items-start justify-center gap-2.5 md:items-center">
        <NewspaperIcon />
        <h2 className="w-fit text-2xl leading-none font-black">
          Siste nyheter
        </h2>
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {articles.map((article) => (
            <Link
              href={`/nyheter/${article.id}`}
              key={article.id}
              className="h-auto"
            >
              <NewsCard
                description={article.preview ?? ""}
                title={article.name ?? ""}
                image={article.image}
                author={{
                  role: article.author?.role ?? "user",
                  image: article.author?.image ?? "",
                  name: article.author?.name ?? "Ukjent",
                  email: article.author?.email ?? "",
                }}
                date={article.createdAt}
              />
            </Link>
          ))}
        </div>
      ) : (
        <Alert variant="default" className="mx-auto w-fit">
          <TriangleAlertIcon />
          <AlertTitle>Her var det tomt</AlertTitle>
          <AlertDescription>Det er ingen nyheter akkurat nå</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center pt-2">
        <Button asChild size="lg">
          <Link href="/nyheter">
            Se alle nyheter <ArrowRightIcon />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default LandingNewsList;
