import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invalidateQuery, useMutate } from "@/lib/query";

type Params = {
  id: string;
};

type Body = {
  email: string;
  name: string;
  password: string;
  role_id: string;
  username: string;
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<Body, Params>({
    endpoint: "/users/:id",
    method: "put",
    onSuccess: (res) => {
      toast.success("User successfully updated");
      invalidateQuery(queryClient, [
        ["list-account"],
        ["account-detail", res.data.data.resource.id],
      ]);
    },
    onError: {
      message: "User failed to update",
      title: "UPDATE_USER",
    },
  });

  return mutation;
};
