import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@ui/card";

export const DashboardMentorsCard = () => {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Mentori</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          1,234
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <IconTrendingDown />
            -20%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        {/* <div className="text-muted-foreground">Acquisition needs attention</div> */}
        <div className="text-muted-foreground">
          Numărul total de mentori înregistrați în platformă
        </div>
        <div className="line-clamp-1 flex gap-2 font-medium">
          <IconTrendingUp />
          25 mentori noi în ultima lună
        </div>
      </CardFooter>
    </Card>
  );
};
