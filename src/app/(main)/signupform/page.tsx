"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function SignupForm() {
  const [year, setYear] = useState<number>(1999);
  const [month, setMonth] = useState<number>(1);
  const [day, setDay] = useState<number>(1);
  const [daysInMonth, setDaysInMonth] = useState<number[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRePassword] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");

  const router = useRouter();

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 1919 }, (_, i) => currentYear - i);
  };

  const generateMonths = () => Array.from({ length: 12 }, (_, i) => i + 1);

  const updateDaysInMonth = (year: number, month: number) => {
    const lastDay = new Date(year, month, 0).getDate();
    setDaysInMonth(Array.from({ length: lastDay }, (_, i) => i + 1));
  };

  useEffect(() => {
    updateDaysInMonth(year, month);
  }, [year, month]);

  const handleSubmit = async () => {
    if (password !== repassword) return alert("비밀번호가 일치하지 않습니다.");

    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      const { doc, setDoc } = await import("firebase/firestore");
      const { getFirebaseAuth, getFirebaseDb } = await import("@/lib/firebase");

      const auth = await getFirebaseAuth();
      const db = await getFirebaseDb();
      if (!auth || !db) {
        alert("Firebase가 초기화되지 않았습니다.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name,
      });

      const birthDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        gender,
        birthDate,
        activityArea: location,
        role: "USER",
        createdAt: new Date().toISOString(),
      });

      // AuthProvider가 onAuthStateChanged로 자동 처리
      alert("회원가입 성공!");
      router.replace("/");
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error(error);
      let message = error?.message || "회원가입 중 오류가 발생했습니다.";
      if (error?.code === "auth/email-already-in-use") {
        message = "이미 가입된 이메일입니다.";
        alert(message);
        router.push("/login");
        return;
      } else if (error?.code === "auth/weak-password") {
        message = "비밀번호가 너무 약합니다. 6자 이상으로 설정해주세요.";
      }
      alert(message);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4 dark:text-white">
      <h1 className="text-2xl font-bold mb-6 text-center">회원가입</h1>
      <div className="space-y-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="이름을 입력해주세요"
          className="w-full border dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-800"
        />

        <div className="flex">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-800"
          />
        </div>

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="비밀번호"
          className="w-full border dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-800"
        />
        <input
          value={repassword}
          onChange={(e) => setRePassword(e.target.value)}
          type="password"
          placeholder="비밀번호 확인"
          className="w-full border dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-800"
        />

        <div>
          <div className="font-medium mb-1">성별</div>
          <label className="mr-4">
            <input
              type="radio"
              name="gender"
              className="mr-1"
              value="남성"
              onChange={(e) => setGender(e.target.value)}
            />{" "}
            남성
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              className="mr-1"
              value="여성"
              onChange={(e) => setGender(e.target.value)}
            />{" "}
            여성
          </label>
        </div>

        <div>
          <div className="font-medium mb-1">생년월일</div>
          <div className="flex space-x-2">
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="border dark:border-gray-600 px-2 py-1 bg-white dark:bg-gray-800">
              {generateYears().map((y) => (
                <option key={y} value={y}>
                  {y}년
                </option>
              ))}
            </select>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="border dark:border-gray-600 px-2 py-1 bg-white dark:bg-gray-800">
              {generateMonths().map((m) => (
                <option key={m} value={m}>
                  {m}월
                </option>
              ))}
            </select>
            <select value={day} onChange={(e) => setDay(Number(e.target.value))} className="border dark:border-gray-600 px-2 py-1 bg-white dark:bg-gray-800">
              {daysInMonth.map((d) => (
                <option key={d} value={d}>
                  {d}일
                </option>
              ))}
            </select>
          </div>
        </div>

        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          type="text"
          placeholder="활동지역을 입력해주세요"
          className="w-full border dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-800"
        />

        <button
          onClick={handleSubmit}
          className="hover:bg-[#f78000] cursor-pointer w-full bg-[#F28C28] text-white py-3 rounded mt-6"
        >
          가입하기
        </button>
      </div>
    </div>
  );
}
