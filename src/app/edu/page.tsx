import { DataTable } from "@faeComponents/dashboard/data-table";
import { SectionCards } from "@faeComponents/dashboard/section-cards";
import { SiteHeader } from "@faeCommon/site-header";
import { SidebarInset, SidebarProvider } from "@ui/sidebar";

import data from "./data.json";
import { PageHeader } from "@faeCommon/page-header";

export default function EducationDashboard() {
  return (
    <SidebarInset>
      <PageHeader title="Dashboard" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <DataTable data={data} />
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
