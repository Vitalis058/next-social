import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "./ui/button";
import { Loader2 } from "lucide-react";

interface LoadingButtonProps extends ButtonProps {
  loading: boolean;
}
function LoadingButton({
  loading,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      {...props}
      disabled={loading || disabled}
      className={cn("flex items-center gap-2", className)}
    >
      {loading && <Loader2 className="animate-spin" />}
      {props.children}
    </Button>
  );
}

export default LoadingButton;
