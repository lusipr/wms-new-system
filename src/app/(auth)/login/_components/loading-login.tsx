import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingLogin = () => {
  return (
    <CardContent className="flex flex-col gap-4">
      <div className="flex w-full flex-col gap-1">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-9" />
      </div>
      <div className="flex w-full flex-col gap-1">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-9" />
      </div>
      <Skeleton className="h-9" />
    </CardContent>
  );
};
