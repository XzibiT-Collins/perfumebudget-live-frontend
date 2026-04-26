import { cn } from "../utils";

export const LoadingSpinner = ({ fullScreen, className }: { fullScreen?: boolean; className?: string }) => {
  const content = (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1A1A1A]/10 border-t-[#1A1A1A]" />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};
