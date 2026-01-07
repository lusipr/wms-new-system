import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { invalidateQuery, useMutate } from "@/lib/query";

type Params = {
  id: string;
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<undefined, Params>({
    endpoint: "/users/:id",
    method: "delete",
    onSuccess: () => {
      toast.success("User successfully deleted");
      invalidateQuery(queryClient, [
        ["list-account"],
      ]);
    },
    onError: {
      message: "User failed to delete",
      title: "DELETE_USER",
    },
  });

  return mutation;
};
