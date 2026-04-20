import Image from "next/image";
import Logo from "@public/images/logo.svg"
import React from "react";

type FooterButtonProps = {
  children: React.ReactNode;
};

const FooterButton = ({children}:FooterButtonProps) => {
  return (
    <button className="bg-white dark:bg-gray-800 text-black dark:text-white px-4 py-3 rounded-md text-sm font-medium shadow-sm hover:shadow transition">
      {children}
    </button>
  )
}

export const Footer = () => {
  return (
    <footer className="w-full bg-[#001246] text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-8 lg:px-16 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-4 text-sm leading-relaxed">
          <ul className="space-y-1">
            <li>부산광역시 동래구 온천천로471번가길 40</li>
            <li>대표이사 이성철</li>
            <li>사무총장 박영민</li>
          </ul>

          <div className="flex flex-wrap gap-3 sm:gap-4">
            <FooterButton>국세청</FooterButton>
            <FooterButton>국민권익위원회</FooterButton>
            <FooterButton>서울시교육청</FooterButton>
          </div>

          <ul className="flex flex-wrap gap-3 text-sm">
            <li>연구</li>
            <li>교육</li>
            <li>소통</li>
            <li>회비/후원</li>
          </ul>

          <ul className="flex flex-wrap gap-6 text-sm">
            <li>이용약관</li>
            <li>개인정보처리방침</li>
          </ul>

          <div className="space-y-1 text-sm">
            <p>NDIE 디지털과 포용성 네트워크</p>
            <p>NDIE Network for Digital Inclusion and Empowerment</p>
          </div>
        </div>

        <div className="flex justify-start lg:justify-end">
          <Image src={Logo} alt={"Logo"} className="h-auto w-32 sm:w-40 lg:w-48 dark-logo" />
        </div>
      </div>
    </footer>
  )
}
