"use client";


import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loading from '@/components/ui/loading';

type ListItem = {
  id: string | number;
  title: string;
  username?: string;
  views?: number;
  createdAt: string;
};

type ListboxProps = {
  item: ListItem[];
  datas: string;
  name: string;
};

export default function Listbox({ item, datas, name }: ListboxProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<ListItem[]>(item);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    setHasSearched(true);
    const filtered = item.filter((i) => i.title.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredItems(filtered);
  };

  function formatDate(dateStr: string) {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split('T')[0].split('-');
    return `${parseInt(year)}년 ${parseInt(month)}월 ${parseInt(day)}일`;
  }



  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredItems(item);
      setHasSearched(false);
    } else if (hasSearched) {
      setFilteredItems(item.filter((i) => i.title.toLowerCase().includes(searchTerm.toLowerCase())));
    }
  }, [searchTerm, item, hasSearched]);

  const deslist = (id: string | number) => {
    sessionStorage.setItem('name', name);
    // TODO: Increment view count in Firestore if needed

    let route = datas;
    if (datas === 'activity') route = 'act';
    else if (datas === 'QNA') route = 'qna';

    router.push(`/${route}/${id}`);
  };

  const hasResults = Array.isArray(filteredItems) && filteredItems.length > 0;

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">전체 {filteredItems.length} 건</p>

        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <input
            type="text"
            className="h-11 w-full rounded-lg border border-[#DCDCDC] dark:border-gray-600 bg-[#F7F7F7] dark:bg-gray-800 px-3 text-sm outline-none sm:w-64 dark:text-white"
            placeholder="제목 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="h-11 w-full rounded-lg bg-[#ED9735] px-4 text-sm font-semibold text-white sm:w-auto"
            onClick={handleSearch}
          >
            검색
          </button>
        </div>
      </div>

      <hr className="border border-black dark:border-gray-700 my-1" />
      {Array.isArray(filteredItems) ? (
        <>
          <div className="hidden md:grid md:grid-cols-5 md:text-center md:text-sm md:font-semibold md:py-2 md:border-b md:border-gray-400 dark:border-gray-600 dark:text-gray-300">
            <p>번호</p>
            <p>제목</p>
            <p>작성자</p>
            <p>등록일</p>
            <p>조회</p>
          </div>

          <div className="hidden md:block">
            {hasResults ? (
              filteredItems.map((i, index) => (
                <div
                  key={i.id}
                  className="grid grid-cols-5 cursor-pointer items-center border-b border-gray-200 dark:border-gray-700 py-3 text-center text-sm hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200"
                  onClick={() => deslist(i.id)}
                >
                  <p>{filteredItems.length - index}</p>
                  <p className="truncate">{i.title}</p>
                  <p>{i.username || '관리자'}</p>
                  <p>{formatDate(i.createdAt)}</p>
                  <p>{i.views || 0}</p>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-gray-500 dark:text-gray-400">검색 결과가 없습니다.</div>
            )}
          </div>

          <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700 md:hidden">
            {hasResults ? (
              filteredItems.map((i, index) => (
                <button
                  key={i.id}
                  className="flex flex-col items-start gap-2 py-3 text-left"
                  onClick={() => deslist(i.id)}
                >
                  <div className="flex w-full items-center justify-between gap-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">#{filteredItems.length - index}</span>
                    <span className="text-xs text-gray-400">{formatDate(i.createdAt)}</span>
                  </div>
                  <p className="w-full text-base font-semibold text-black dark:text-white">{i.title}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                    <span>{i.username || '관리자'}</span>
                    <span>조회 {i.views || 0}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="py-6 text-center text-gray-500 dark:text-gray-400">검색 결과가 없습니다.</div>
            )}
          </div>
        </>
      ) : hasSearched ? (
        <div className="py-4 text-center text-gray-500">검색 결과가 없습니다.</div>
      ) : (
        <Loading />
      )}
    </div>
  );
}
