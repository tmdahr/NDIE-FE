'use client'
import React, { useState } from 'react';

type InquiryFormState = {
  name: string;
  organization: string;
  email: string;
  selectedTag: string;
  content: string;
};

export default function InquiryForm() {
  const [formData, setFormData] = useState<InquiryFormState>({
    name: '',
    organization: '',
    email: '',
    selectedTag: '기타', // 기본값 설정
    content: '',
  });

  const tags = ['협업', '강의', '후원', '기타'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleTagClick = (tag: string) => {
    setFormData((prevData) => ({
      ...prevData,
      selectedTag: tag,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { collection, addDoc } = await import("firebase/firestore");
      const { getFirebaseDb } = await import("@/lib/firebase");

      const db = await getFirebaseDb();
      if (!db) {
        alert("Firebase가 초기화되지 않았습니다.");
        return;
      }

      await addDoc(collection(db, "inquiries"), {
        ...formData,
        createdAt: new Date().toISOString()
      });

      alert('문의가 접수되었습니다.'); // 성공 메시지 표시
      // 폼 초기화
      setFormData({
        name: '',
        organization: '',
        email: '',
        selectedTag: '기타',
        content: '',
      });
    } catch (e) {
      console.error(e);
      alert('문의 전송 중 알 수 없는 오류가 발생했습니다.');
    }
  };

  return (
    // 전체 컨테이너 스타일 변경
    // 이미지에 맞춰 배경색 제거, 중앙 정렬, 상단 패딩 추가
    <div className="absolute left-0 w-full h-full flex flex-col items-center bg-white dark:bg-gray-900 px-4 md:px-40">
      <div className="w-full h-full px-8 py-12"> {/* 내부 컨테이너 */}
        <h1 className="text-4xl font-bold mb-16 text-gray-800 dark:text-white">문의하기</h1> {/* 제목 스타일 */}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-0 md:gap-x-20 gap-y-12 w-full">
          {/* 왼쪽 섹션: 이름, 단체 또는 기관명, 이메일 */}
          <div className="flex flex-col gap-10"> {/* 섹션 간격 조정 */}
            <div>
              <label htmlFor="name" className="block text-xl font-medium text-gray-800 dark:text-white mb-4">
                이름
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="이름을 입력해주세요"
                // 입력 필드 스타일 변경: 하단 테두리만, 배경 투명, 그림자 없음, 패딩 조정
                className="w-full pb-3 border-b border-gray-300 bg-transparent text-xl text-gray-700 placeholder-gray-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="organization" className="block text-xl font-medium text-gray-800 dark:text-white mb-4">
                단체 또는 기관명
              </label>
              <input
                type="text"
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder="단체 또는 기관명을 입력해주세요"
                className="w-full pb-3 border-b border-gray-300 dark:border-gray-600 bg-transparent text-xl text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xl font-medium text-gray-800 dark:text-white mb-4">
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="보내는 분의 이메일을 입력해주세요"
                className="w-full pb-3 border-b border-gray-300 dark:border-gray-600 bg-transparent text-xl text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* 오른쪽 섹션: 태그, 내용 */}
          <div className="flex flex-col gap-10"> {/* 섹션 간격 조정 */}
            <div>
              <label className="block text-xl font-medium text-gray-800 dark:text-white mb-4">
                태그
              </label>
              <div className="flex space-x-3">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className={`px-6 py-2 rounded-full text-lg font-semibold transition-colors duration-200
                      ${formData.selectedTag === tag
                        ? 'border border-gray-400 text-gray-800 dark:text-gray-800 bg-white' // 선택됨
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600' // 선택 안됨
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="content" className="block text-xl font-medium text-gray-800 dark:text-white mb-4">
                내용
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="문의할 내용을 입력해주세요"
                rows={10}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent text-xl text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none resize-none"
                required
              ></textarea>
            </div>
          </div>

          {/* 발송 버튼 (폼의 전체 너비에 걸쳐 오른쪽 정렬) */}
          <div className="col-span-1 md:col-span-2 flex justify-end"> {/* col-span-2로 폼 전체 너비 사용 */}
            <button
              type="submit"
              className="px-8 py-3 bg-white dark:bg-gray-800 text-orange-500 dark:text-orange-400 border border-orange-500 dark:border-orange-400 text-xl font-semibold rounded-md shadow-sm hover:bg-orange-500 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 flex items-center"
            >
              <svg className="w-6 h-6 mr-3 -ml-1 transform rotate-45" fill="currentColor" viewBox="0 0 20 20" style={{ transformOrigin: 'center' }}>
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l.64-.213a1 1 0 00.108-.146l.75-1.5a1 1 0 00.08-.094l5-5a1 1 0 011.414 0l5 5a1 1 0 00.08.094l.75 1.5a1 1 0 00.108.146l.64.213a1 1 0 001.169-1.409l-7-14z"></path>
              </svg>
              발송
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}