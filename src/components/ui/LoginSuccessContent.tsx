"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useToastStore } from "@/store/toast";

export default function LoginSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const API_BASE = "/api";

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      router.replace("/login");
      return;
    }

    const verifyLogin = async () => {
      try {
        const res = await fetch(`${API_BASE}/codeLogin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ code }),
        });

        const text = await res.text();
        let data;

        try {
          data = JSON.parse(text);
        } catch {
          data = null;
        }

        if (!res.ok) {
          const errorMessage = data?.message || "로그인 실패";
          throw new Error(errorMessage);
        }

        // Firebase Auth로 로그인 처리 (AuthProvider가 자동 감지)
        router.push("/");
      } catch (error) {
        useToastStore.getState().addToast(error instanceof Error ? error.message : "로그인 중 오류 발생", "error");
      }
    };
    verifyLogin();
  }, [API_BASE, router, searchParams]);

  return <p>카카오 로그인 처리 중...</p>;
}
