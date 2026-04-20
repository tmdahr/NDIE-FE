"use client";
import Logo from "@public/images/logo.svg";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { uid, isInitialized } = useAuthStore();

  // 이미 로그인되어 있으면 홈으로
  useEffect(() => {
    if (isInitialized && uid) {
      router.replace("/");
    }
  }, [isInitialized, uid, router]);

  const handleGoogleLogin = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const { getFirebaseAuth, getFirebaseDb } = await import("@/lib/firebase");
      const { doc, getDoc, setDoc } = await import("firebase/firestore");

      const auth = await getFirebaseAuth();
      if (!auth) {
        alert("Firebase 인증이 초기화되지 않았습니다.");
        return;
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Firestore에 사용자 문서 확인/생성
      const db = await getFirebaseDb();
      if (db) {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          // 새 사용자 - 기본 USER로 생성
          await setDoc(userRef, {
            name: user.displayName || "Google 사용자",
            email: user.email || "",
            role: "USER",
            createdAt: new Date().toISOString(),
          });
        }
      }

      // AuthProvider가 onAuthStateChanged로 자동 처리
      router.push("/");
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error("구글 로그인 오류:", err);
      if (err.code === "auth/popup-closed-by-user") {
        // 사용자가 팝업 닫음 - 무시
      } else {
        alert(err.message || "로그인 중 오류가 발생했습니다.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = async () => {
    if (isProcessing || !email || !password) return;
    setIsProcessing(true);

    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { getFirebaseAuth } = await import("@/lib/firebase");

      const auth = await getFirebaseAuth();
      if (!auth) {
        alert("Firebase 인증이 초기화되지 않았습니다.");
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error("이메일 로그인 오류:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        alert("이메일 또는 비밀번호를 확인해주세요.");
      } else {
        alert(err.message || "로그인 중 오류가 발생했습니다.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="flex justify-center -translate-y-1">
          <Image src={Logo} alt="Logo" width={250} height={150} className="dark-logo" />
        </div>

        <button
          className="relative flex cursor-pointer justify-center items-center w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-black dark:text-white font-bold py-2 rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          onClick={handleGoogleLogin}
          disabled={isProcessing}
        >
          <span className="absolute left-3 w-[30px] h-[30px] flex items-center justify-center rounded-full border border-gray-200 bg-white dark:bg-gray-700 text-[#4285F4] font-black dark:font-bold text-lg">
            G
          </span>
          {isProcessing ? "로그인 중..." : "Google로 시작하기"}
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
          <span className="mx-4 text-gray-500 text-sm">또는</span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
        </div>

        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 rounded px-4 py-2 mb-2 bg-white dark:bg-gray-800 text-black dark:text-white"
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 rounded px-4 py-2 bg-white dark:bg-gray-800 text-black dark:text-white"
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        <button
          onClick={handleLogin}
          disabled={isProcessing}
          className="hover:bg-[#f78000] cursor-pointer w-full bg-orange-400 text-white font-bold py-2 rounded mt-4 disabled:opacity-50"
        >
          {isProcessing ? "로그인 중..." : "로그인"}
        </button>

        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mt-2">
          <label className="flex items-center">
            <input type="checkbox" className="cursor-pointer mr-2" />
            로그인 상태 유지
          </label>
          <div className="space-x-3">
            <button className="hover:underline cursor-pointer">비밀번호 재설정</button>
            <button onClick={() => router.push("/signup")} className="hover:underline cursor-pointer">
              회원가입
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
