"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function Signup() {
  const router = useRouter();
  const { uid, isInitialized } = useAuthStore();
  const isProcessing = useRef(false);

  const next = () => {
    router.push("/signupagree");
  };

  // 이미 로그인되어 있으면 홈으로
  useEffect(() => {
    if (isInitialized && uid) {
      router.replace("/");
    }
  }, [isInitialized, uid, router]);

  const applyUserSession = async (user: { uid: string; displayName?: string | null; email?: string | null }) => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    try {
      const { doc, getDoc, setDoc } = await import("firebase/firestore");
      const { getFirebaseDb } = await import("@/lib/firebase");

      const db = await getFirebaseDb();
      if (!db) throw new Error("Firestore not initialized");

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          name: user.displayName || "Google 사용자",
          email: user.email || "",
          role: "USER",
          createdAt: new Date().toISOString(),
        });
      }

      // AuthProvider가 onAuthStateChanged로 자동 처리
      router.replace("/");
    } catch (error) {
      console.error("세션 적용 중 오류:", error);
      isProcessing.current = false;
    }
  };

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const { getFirebaseAuth } = await import("@/lib/firebase");
        const { getRedirectResult } = await import("firebase/auth");

        const auth = await getFirebaseAuth();
        if (!auth) return;

        // Google redirect 로그인 처리
        const redirectResult = await getRedirectResult(auth);
        if (redirectResult?.user) {
          await applyUserSession(redirectResult.user);
        }
      } catch (error: unknown) {
        const err = error as { code?: string };
        console.error("인증 확인 중 오류:", error);
        if (err?.code === "auth/invalid-credential") {
          const { getFirebaseAuth } = await import("@/lib/firebase");
          const { signOut } = await import("firebase/auth");
          const auth = await getFirebaseAuth();
          if (auth) await signOut(auth);
          alert("구글 인증 정보를 확인할 수 없습니다.");
        }
        isProcessing.current = false;
      }
    };
    checkAuthAndRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const { GoogleAuthProvider, signInWithRedirect, setPersistence, browserLocalPersistence } = await import("firebase/auth");
      const { getFirebaseAuth } = await import("@/lib/firebase");

      const auth = await getFirebaseAuth();
      if (!auth) {
        alert("Firebase 인증이 초기화되지 않았습니다.");
        return;
      }

      await setPersistence(auth, browserLocalPersistence);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      await signInWithRedirect(auth, provider);
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error(err);
      let message = err?.message || "구글 로그인 중 오류가 발생했습니다.";
      if (err?.code === "auth/popup-blocked") {
        message = "팝업이 차단되었습니다.";
      }
      alert(message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900 space-y-6 px-4">
      <button
        onClick={handleGoogleLogin}
        className="cursor-pointer relative flex w-full max-w-[980px] py-[19px] px-0 justify-center items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-black dark:text-white rounded shadow-md hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <span className="absolute left-4 w-[36px] h-[36px] flex items-center justify-center rounded-full border border-gray-200 bg-white dark:bg-gray-700 text-[#4285F4] font-black text-lg">
          G
        </span>
        Google로 시작하기
      </button>
      <div className="flex items-center justify-center space-x-4 w-full max-w-[1300px]">
        <div className="w-[333px] h-[2px] bg-[#E2E1E1] dark:bg-gray-700" />
        <button
          onClick={() => {
            window.location.href =
              "https://observant-agreement-17f.notion.site/20abd5ffe3fa805ca553d136e71891a3?source=copy_link";
          }}
          className="cursor-pointer text-[18px] font-normal text-[#335CFF] font-['Inter'] whitespace-nowrap"
        >
          회원가입하는 방법 3초만에 알아보기
        </button>
        <div className="w-[333px] h-[2px] bg-[#E2E1E1] dark:bg-gray-700" />
      </div>

      <button
        onClick={next}
        className="hover:bg-[#ededed] dark:hover:bg-gray-700 cursor-pointer relative flex w-full max-w-[980px] py-[19px] px-0 justify-center items-center bg-white dark:bg-gray-800 text-black dark:text-white rounded shadow-md"
      >
        ID/PW 회원가입
      </button>
    </div>
  );
}
