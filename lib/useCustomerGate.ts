"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Logged-in customers do their shopping inside the /conta dashboard now —
// storefront pages like /cardapio, /bolos, /sobre and /revenda bounce them there.
export function useCustomerGate() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "CUSTOMER") {
      router.replace("/conta");
    }
  }, [status, session, router]);
}
