import { IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@ui/card";

export const DashboardStudentsCard = () => {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Studenti</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          250
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <IconTrendingUp />
            +12.5%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="text-muted-foreground">
          Numărul total de stundenți înregistrați în platformă
        </div>
        <div className="line-clamp-1 flex gap-2 font-medium">
          <IconTrendingUp />
          15 studenți noi în ultima lună
        </div>
      </CardFooter>
    </Card>
  );
};
