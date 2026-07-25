"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Logged-in customers do their shopping inside the /conta dashboard now —
// storefront pages like /cardapio, /sobre and /revenda bounce them there.
export function useCustomerGate(redirectTo: string = "/conta") {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "CUSTOMER") {
      router.replace(redirectTo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, router]);
}
