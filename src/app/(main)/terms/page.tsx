import React from 'react';
import ContentContainer from '@/containers/main/ContentContainer';
import { TERMS_OF_SERVICE } from '@/util/termsData';

export default function TermsPage() {
  return (
    <ContentContainer className="py-20 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-10 text-gray-900">이용약관</h1>
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {TERMS_OF_SERVICE}
          </div>
        </div>
      </div>
    </ContentContainer>
  );
}
