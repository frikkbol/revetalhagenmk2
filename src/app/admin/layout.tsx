import DynamicBreadcrumbs from "@/components/dynamic-breadcrumbs";
import AdminSidebar from "@/components/screen/admin-sidebar/admin-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/server/auth";
import { HomeIcon } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (!session.user.role?.includes("admin")) {
    redirect("/");
  }

  return (
    <>
      <div className="mt-28 flex min-h-[calc(100vh_-_10rem)] w-full flex-col gap-5 px-5 pb-10 md:px-10">
        <DynamicBreadcrumbs
          items={[
            { href: "/", label: "Hjem", icon: <HomeIcon size={16} /> },
            { href: "/admin", label: "Admin" },
          ]}
        />
        <div className="flex flex-1 flex-col gap-5 lg:flex-row">
          <AdminSidebar />
          <Card className="min-w-0 flex-1">
            <CardContent>{children}</CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Layout;
