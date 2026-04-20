"use client";
import React, { useEffect, useState } from "react";
import { getFirebaseDb } from "@/lib/firebase";

type BannerConfig = {
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix: string;
  descriptionKo: string;
  descriptionEn: string;
  highlightColor: string;
};

const defaultConfig: BannerConfig = {
  titlePrefix: "우리는",
  titleHighlight: "포용",
  titleSuffix: "해야합니다",
  descriptionKo: "대한민국은 여러 불평등 문제로 점점 갈라져가고 있습니다.\n우리 모두가 서로가 다름을 인정하고 더욱 따뜻한 마음으로 서로를 보듬어줘야합니다.",
  descriptionEn: "South Korea is becoming increasingly divided due to various inequalities.\nWe all need to acknowledge each other's differences and embrace each other with warmer hearts.",
  highlightColor: "#FF961F",
};

export default function HomeBanner() {
  const [config, setConfig] = useState<BannerConfig>(defaultConfig);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const db = await getFirebaseDb();
        if (!db) return;

        const { doc, getDoc } = await import("firebase/firestore");
        const docRef = doc(db, "siteConfig", "main");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().banner) {
          setConfig({ ...defaultConfig, ...docSnap.data().banner });
        }
      } catch (e) {
        console.error("배너 설정 로드 실패:", e);
      }
    };
    loadConfig();
  }, []);

  return (
    <div className={`absolute top-1/2 -translate-y-1/2 z-1 bg-white/50 dark:bg-gray-800/50 min-h-[30rem] md:h-[40rem] left-4 right-4 md:left-[10rem] md:right-[10rem] 
                     rounded-3xl md:rounded-4xl flex flex-col justify-center items-center text-center px-4 overflow-hidden py-8 md:py-0`}>
      <div className="z-10">
        <h1 className="text-xl sm:text-3xl md:text-4xl font-semibold mb-2 flex flex-col md:flex-row items-center md:items-end justify-center gap-2">
          <p className="mb-2 md:mb-5 w-auto md:w-[10rem] text-center dark:text-white">{config.titlePrefix}</p>
          <span
            className="font-extrabold text-6xl md:text-[8rem] align-bottom leading-none"
            style={{ color: config.highlightColor }}
          >
            {config.titleHighlight}
          </span>
          <p className="mb-2 md:mb-5 w-auto md:w-[10rem] text-center dark:text-white">{config.titleSuffix}</p>
        </h1>
        <p className="text-gray-700 dark:text-gray-200 mt-4 whitespace-pre-line">
          {config.descriptionKo}
        </p>
        <div className="mt-10 text-sm sm:text-base text-black dark:text-white">
          <p className="font-semibold">
            we must <span className="font-bold" style={{ color: config.highlightColor }}>embrace</span>
          </p>
          <p className="mt-1 text-gray-800 dark:text-gray-200 whitespace-pre-line">
            {config.descriptionEn}
          </p>
        </div>
      </div>
    </div>
  );
}
