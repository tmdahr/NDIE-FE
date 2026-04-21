import React from 'react';
import ContentContainer from '@/containers/main/ContentContainer';
import { PRIVACY_POLICY } from '@/util/termsData';

export default function PrivacyPage() {
  return (
    <ContentContainer className="py-20 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-10 text-gray-900">개인정보처리방침</h1>
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {PRIVACY_POLICY}
          </div>
        </div>
      </div>
    </ContentContainer>
  );
}
