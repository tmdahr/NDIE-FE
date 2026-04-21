'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TERMS_OF_SERVICE, PRIVACY_POLICY, MARKETING_CONSENT } from '@/util/termsData';

export default function Signupagree() {
  const [agreeAll, setAgreeAll] = useState(false);
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const router = useRouter();

  const toggleAll = () => {
    const newValue = !agreeAll;
    setAgreeAll(newValue);
    setTerms(newValue);
    setPrivacy(newValue);
    setMarketing(newValue);
  };

  const handleSignup = () => {
    if (terms && privacy) {
      router.push('/signupform');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 text-base">
      <h1 className="text-xl font-semibold mb-8">이용약관 동의</h1>

      <div className="space-y-8">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={agreeAll} 
            onChange={toggleAll} 
            className="w-4 h-4 mt-1" 
          />
          <span className="font-medium">
            이용약관, 개인정보 수집 및 이용에 모두 동의합니다.
          </span>
        </label>

        <div className="space-y-6">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={terms}
              className="w-4 h-4 mt-1 cursor-pointer"
              onChange={() => setTerms(!terms)}
            />
            <div className="flex-1">
              <span className="font-medium">이용약관 동의</span>
              <span className="text-red-500 ml-1">(필수)</span>
              <div className="border border-gray-200 p-4 mt-2 h-64 overflow-y-auto text-sm bg-gray-50 leading-relaxed whitespace-pre-wrap rounded-md">
                {TERMS_OF_SERVICE}
              </div>
            </div>
          </label>

          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              className="w-4 h-4 mt-1 cursor-pointer"
              checked={privacy}
              onChange={() => setPrivacy(!privacy)}
            />
            <div className="flex-1">
              <span className="font-medium">개인정보 수집 및 이용 동의</span>
              <span className="text-red-500 ml-1">(필수)</span>
              <div className="border border-gray-200 p-4 mt-2 h-64 overflow-y-auto text-sm bg-gray-50 leading-relaxed whitespace-pre-wrap rounded-md">
                {PRIVACY_POLICY}
              </div>
            </div>
          </label>

          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={marketing}
              className="w-4 h-4 mt-1 cursor-pointer"
              onChange={() => setMarketing(!marketing)}
            />
            <div className="flex-1">
              <span className="font-medium">마케팅 정보 수신 및 광고 수신 동의</span>
              <span className="text-gray-500 ml-1">(선택)</span>
              <div className="border border-gray-200 p-4 mt-2 h-40 overflow-y-auto text-sm bg-gray-50 leading-relaxed rounded-md">
                {MARKETING_CONSENT}
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className="flex justify-center mt-12 space-x-4">
        <button 
          onClick={() => router.push('/signup')} 
          className="px-8 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
        <button
          disabled={!(terms && privacy)}
          onClick={handleSignup}
          className={`px-8 py-2 rounded-md text-white font-medium transition-colors ${
            terms && privacy 
              ? 'bg-[#FF8200] hover:bg-[#e67500] cursor-pointer' 
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          가입하기
        </button>
      </div>
    </div>
  );
}
