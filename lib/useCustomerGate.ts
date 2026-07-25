"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Logged-in customers do their shopping inside the /conta dashboard now —
// storefront pages like /cardapio, /sobre and /revenda bounce them there.
//
// Returns true while the page should hold off rendering its real content:
// either the session is still resolving, or a customer redirect is about to
// fire. Callers should render a loading state instead of their content in
// that case, so the wrong page never flashes on screen before the redirect.
export function useCustomerGate(redirectTo: string = "/conta") {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isCustomer = status === "authenticated" && session?.user?.role === "CUSTOMER";

  useEffect(() => {
    if (isCustomer) router.replace(redirectTo);
  }, [isCustomer, redirectTo, router]);

  return status === "loading" || isCustomer;
}
