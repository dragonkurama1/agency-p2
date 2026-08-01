"use client";

import { useState, useTransition } from "react";
import { RefreshCw, CheckCircle } from "lucide-react";
import { revalidateAllCache } from "@/actions/revalidate";
import { Button } from "@/components/ui/button";

export function RevalidateButton() {
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  function handleClick() {
    setDone(false);
    start(async () => {
      await revalidateAllCache();
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={pending}
      className="gap-2"
    >
      {done ? (
        <>
          <CheckCircle className="size-4 text-green-500" />
          Cache purgé !
        </>
      ) : (
        <>
          <RefreshCw className={`size-4 ${pending ? "animate-spin" : ""}`} />
          {pending ? "Purge en cours…" : "Actualiser le site"}
        </>
      )}
    </Button>
  );
}
