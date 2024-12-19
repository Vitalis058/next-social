import { useToast } from "@/hooks/use-toast";
import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";

export interface Attachment {
  file: File;
  mediaId?: string;
  isUploading: boolean;
}

export default function useMediaUpload() {
  const { toast } = useToast();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | undefined>();

  //upoad the image to uploadthing
  //recieve the url and upload it to prisma

  const { isUploading, startUpload } = useUploadThing("attachment", {
    onBeforeUploadBegin(files) {
      const renamedFiles = files.map((file) => {
        const extension = file.name.split(".").pop();

        //renaming the file to unique file names
        return new File(
          [file],
          `attachment_${crypto.randomUUID()}.${extension}`,
          {
            type: file.type,
          },
        );
      });

      setAttachments((prev) => [
        ...prev,
        ...renamedFiles.map((file) => ({ file, isUploading: true })),
      ]);
      return renamedFiles;
    },

    //indicates the upload progress
    onUploadProgress: setUploadProgress,

    //media id returned from on upload complete
    //setting is uploading to false
    onClientUploadComplete(res) {
      setAttachments((prev) =>
        prev.map((att) => {
          const uploadResult = res.find((r) => r.name === att.file.name);

          if (!uploadResult) return att;

          return {
            ...att,
            mediaId: uploadResult.serverData.mediaId,
            isUploading: false,
          };
        }),
      );
    },

    // handle error by removing the attachments that have an error
    onUploadError(e) {
      setAttachments((prev) => prev.filter((att) => !att.isUploading));
      toast({
        variant: "destructive",
        description: e.message,
      });
    },
  });

  // function to handle the upload progress
  function handleStartUpload(files: File[]) {
    if (isUploading) {
      toast({
        variant: "destructive",
        description: "Please wait for the current upload to finish",
      });
      return;
    }

    if (attachments.length + files.length > 5) {
      toast({
        variant: "destructive",
        description: "You can only upload 5 attachments per post",
      });
      return;
    }

    // initiate the file uploads
    startUpload(files);
  }

  function removeAttachment(fileName: string) {
    setAttachments((prev) => prev.filter((att) => att.file.name !== fileName));
  }

  function reset() {
    setAttachments([]);
    setUploadProgress(undefined);
  }

  return {
    resetMediaUpload: reset,
    removeAttachment,
    startUpload: handleStartUpload,
    isUploading,
    attachments,
    uploadProgress,
  };
}
