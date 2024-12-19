"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import UserAvatar from "@/components/UserAvatar";
import { useSession } from "@/app/(main)/SessionProvider";
import "./styles.css";
import { useSubmitPostMutation } from "./EditorMutation";
import LoadingButton from "@/components/LoadingButton";
import useMediaUpload, { Attachment } from "./useMediaUpload";
import { ClipboardEvent, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useDropzone } from "@uploadthing/react";

function PostEditor() {
  const { user } = useSession();

  const mutation = useSubmitPostMutation();

  const {
    attachments,
    isUploading,
    removeAttachment,
    resetMediaUpload,
    startUpload,
    uploadProgress,
  } = useMediaUpload();

  //drag and drop component
  const { isDragActive, getInputProps, getRootProps } = useDropzone({
    onDrop: startUpload,
  });

  //enable paste
  function paste(e: ClipboardEvent<HTMLInputElement>) {
    const files = Array.from(e.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile()) as File[];

    startUpload(files);
  }

  //to disable the click on the input
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onClick, ...rootProps } = getRootProps();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),

      Placeholder.configure({
        placeholder: "What's a crack-a-lackin'",
      }),
    ],

    immediatelyRender: false,
  });

  const input =
    editor?.getText({
      blockSeparator: "\n",
    }) || "";

  function onSubmit() {
    mutation.mutate(
      {
        content: input,
        mediaIds: attachments.map((a) => a.mediaId).filter(Boolean) as string[],
      },
      {
        onSuccess: async () => {
          editor?.commands.clearContent();
          resetMediaUpload();
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex gap-5">
        <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline" />
        <div {...rootProps} className="w-full sm:w-[88%]">
          <EditorContent
            editor={editor}
            className={cn(
              "max-h-[20rem] flex-1 overflow-y-auto rounded-2xl bg-background px-5 py-3",
              isDragActive && "outline-dashed",
            )}
            onPaste={paste}
          />

          <input {...getInputProps()} />
        </div>
      </div>
      {!!attachments.length && (
        <AttachmentPreviews
          attachments={attachments}
          removeItem={removeAttachment}
        />
      )}
      <div className="flex items-center justify-end gap-3">
        {!!isUploading && (
          <>
            <span className="text-sm">{uploadProgress ?? 0} %</span>
            <Loader2 className="size-5 animate-spin text-primary" />
          </>
        )}
        <AddAttachmentButton
          onFilesSelected={startUpload}
          disabled={isUploading || attachments.length >= 5}
        />

        <LoadingButton
          onClick={onSubmit}
          disabled={!input.trim() || isUploading}
          className="min-w-20"
          loading={mutation.isPending}
        >
          Post
        </LoadingButton>
      </div>
    </div>
  );
}

export default PostEditor;

interface AddAttachmentButtonProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

function AddAttachmentButton({
  disabled,
  onFilesSelected,
}: AddAttachmentButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        variant={"ghost"}
        size={"icon"}
        className="text-primary hover:text-primary"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImageIcon />
      </Button>

      <input
        type="file"
        ref={fileInputRef}
        multiple
        className="sr-only hidden"
        accept="image/*, video/*"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);

          //check if there are any files available
          if (files.length) {
            onFilesSelected(files);
            e.target.value = "";
          }
        }}
      />
    </>
  );
}

interface AttachmentPreviewProp {
  attachment: Attachment;
  onRemoveClick: () => void;
}

//preview component
const AttachmentPreview = ({
  attachment: { file, isUploading },
  onRemoveClick,
}: AttachmentPreviewProp) => {
  const src = URL.createObjectURL(file);
  return (
    <div
      className={cn("relative mx-auto size-fit", isUploading && "opacity-50")}
    >
      {file.type.startsWith("image") ? (
        <Image
          src={src}
          alt="attachment preview"
          height={500}
          width={500}
          className="size-fit max-h-[30rem] rounded-2xl"
        />
      ) : (
        <video controls className="size-fit max-h-[30rem]">
          <source src={src} type={file.type} />
        </video>
      )}
      {!isUploading && (
        <button
          onClick={onRemoveClick}
          className="absolute right-3 top-3 rounded-full bg-foreground p-1.5 text-background transition-colors hover:bg-foreground/60"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};

interface AttachmentPreviewsProps {
  attachments: Attachment[];
  removeItem: (fileName: string) => void;
}

function AttachmentPreviews({
  attachments,
  removeItem,
}: AttachmentPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "grid-cols-2 sm:grid",
      )}
    >
      {attachments.map((attachment) => (
        <AttachmentPreview
          attachment={attachment}
          onRemoveClick={() => removeItem(attachment.file.name)}
          key={attachment.file.name}
        />
      ))}
    </div>
  );
}
