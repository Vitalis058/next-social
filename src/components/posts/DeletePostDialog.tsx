import { PostData } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import LoadingButton from "../LoadingButton";
import { useDeletePost } from "./PostsMutation";
import { Button } from "../ui/button";

interface DeletePostsProps {
  post: PostData;
  open: boolean;
  onClose: () => void;
}

function DeletePostDialog({ onClose, open, post }: DeletePostsProps) {
  const mutationObj = useDeletePost();

  function handleOpenChange() {
    if (!open || !mutationObj.isPending) {
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Post</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this post? This action cannot be
            undone
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <LoadingButton
            variant={"destructive"}
            loading={mutationObj.isPending}
            onClick={() => mutationObj.mutate(post.id, { onSuccess: onClose })}
          >
            Delete
          </LoadingButton>
          <Button
            variant={"outline"}
            onClick={onClose}
            disabled={mutationObj.isPending}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeletePostDialog;
