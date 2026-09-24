"use client";

import { MessageSquarePlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useFabVisible } from "@/components/layout/fab-visibility";

/**
 * Show/hide the floating quick-actions button (the round button in the
 * bottom-right corner). The same preference is set by the x that appears when
 * you hover the button itself, so this is the way back once it is hidden.
 *
 * Super-Admin-only, because that is the only role the button renders for.
 */
export function FabSettingsCard() {
  const { visible, ready, setVisible } = useFabVisible();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquarePlus className="h-4 w-4 text-primary" /> Quick actions button
        </CardTitle>
        <CardDescription>
          The round button in the bottom-right corner of every dashboard page — new change requests, your request inbox
          and Direct Messages.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <span>
            <span className="block text-sm font-medium">Show the quick actions button</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Turn this off to clear the bottom-right corner. You can also hover the button and click the x to hide it.
            </span>
          </span>
          <Switch
            checked={visible === true}
            disabled={!ready}
            onCheckedChange={setVisible}
            aria-label="Show the quick actions button"
          />
        </label>
        <p className="text-xs text-muted-foreground">
          Saved on this device and browser, so it applies to how you work rather than to your account.
        </p>
      </CardContent>
    </Card>
  );
}
