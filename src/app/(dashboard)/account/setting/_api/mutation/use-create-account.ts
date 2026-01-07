import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { invalidateQuery, useMutate } from "@/lib/query";

type Body = {
  email: string;
  name: string;
  password: string;
  role_id: string;
  username: string;
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body>({
    endpoint: "/register",
    method: "post",
    onSuccess: (res) => {
      toast.success("User successfully created");
      invalidateQuery(queryClient, [
        ["list-account"],
        ["account-detail", res.data.data.resource.id],
      ]);
    },
    onError: {
      message: "User failed to create",
      title: "CREATE_USER",
    },
  });

  return mutation;
};
