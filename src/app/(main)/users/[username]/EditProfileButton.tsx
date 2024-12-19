"use client";
import { Button } from "@/components/ui/button";
import { UserData } from "@/lib/types";
import { useState } from "react";
import EditProfileDialog from "./EditProfileDialog";

interface EditProfileButtonProps {
  user: UserData;
}

function EditProfileButton({ user }: EditProfileButtonProps) {
  const [showDialog, setShowDialog] = useState<boolean>(false);

  //func to close the dialog
  const onOpenChange = () => {
    setShowDialog((prevState) => !prevState);
  };

  return (
    <>
      <Button variant={"outline"} onClick={() => setShowDialog(true)}>
        Edit Profile
      </Button>
      {showDialog && (
        <EditProfileDialog
          onOpenChange={onOpenChange}
          open={showDialog}
          user={user}
        />
      )}
    </>
  );
}

export default EditProfileButton;
