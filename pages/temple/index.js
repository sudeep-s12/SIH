// pages/temple/index.js
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function TempleIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/temple/dashboard");
  }, [router]);

  return null;
}
