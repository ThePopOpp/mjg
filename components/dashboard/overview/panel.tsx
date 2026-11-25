"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

/** True at tablet width and up. Starts false on the server, settles on mount. */
export function useWide(query = "(min-width: 768px)") {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return wide;
}

/**
 * A side slide-out on desktop and a swipe-down bottom sheet on phones, with the
 * same content. Used by Add Card and All Features.
 */
export function Panel({
  open,
  onOpenChange,
  title,
  description,
  children,
  width = "sm:max-w-xl",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  width?: string;
}) {
  const wide = useWide();
  if (wide) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className={`flex w-full flex-col gap-0 p-0 ${width}`}>
          <SheetHeader className="border-b px-6 pb-4 pt-6">
            <SheetTitle>{title}</SheetTitle>
            {description ? <SheetDescription>{description}</SheetDescription> : null}
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="border-b">
          <DrawerTitle>{title}</DrawerTitle>
          {description ? <DrawerDescription>{description}</DrawerDescription> : null}
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
