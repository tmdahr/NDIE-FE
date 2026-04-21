'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Loading from '@/components/ui/loading';
import { useToastStore } from '@/store/toast';
import makeDocument from "@/util/makeDocument";
import { DeleteQA } from '@/app/api/q&a';

type IndexType = {
  prevId: string | null;
  prevTitle: string | null;
  nextId: string | null;
  nextTitle: string | null;
};

type CommentType = {
  comment: string;
};

export default function DetailPage() {
  const [commentText, setCommentText] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [item, setItem] = useState<any>(null);
  const [indexs, setIndexs] = useState<IndexType | null>(null);
  const [isWritingComment, setIsWritingComment] = useState(false);
  const [comments, setComments] = useState<CommentType | null>(null);

  const params = useParams();
  const router = useRouter();
  const { datas, id } = params as { datas: string; id: string };

  const [name, setName] = useState('');

  useEffect(() => {
    setName(sessionStorage.getItem('name') || '');
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { getFirebaseAuth, getFirebaseDb } = await import("@/lib/firebase");
      const { onAuthStateChanged } = await import("firebase/auth");
      const { doc, getDoc } = await import("firebase/firestore");

      const auth = await getFirebaseAuth();
      const db = await getFirebaseDb();
      if (!auth || !db) return;

      onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUserId(user.uid);
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRole(userData.role || 'USER'); // Assuming role is stored in user doc
          }
        } else {
          setUserId(null);
          setRole(null);
        }
      });
    };
    fetchUser();
  }, []);

  // URL 경로를 Firestore 컬렉션 이름으로 매핑
  const getCollectionName = (path: string) => {
    const mapping: Record<string, string> = {
      'qna': 'QNA',
      'act': 'activity',
      'announcement': 'announcement',
    };
    return mapping[path] || path;
  };

  useEffect(() => {
    if (!datas || !id) return;

    const fetchData = async () => {
      try {
        const { doc, getDoc, collection, query, orderBy, limit, getDocs, startAfter } = await import("firebase/firestore");
        const { getFirebaseDb } = await import("@/lib/firebase");

        const db = await getFirebaseDb();
        if (!db) return;

        const collectionName = getCollectionName(datas);

        // Fetch Item
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setItem({ id: docSnap.id, ...data });

          // Fetch Comments (Answer)
          if (data.answer) {
            // Assuming answer field exists in the doc directly or in 'comment' field
            // Based on legacy logic, it updates 'comment' field.
          }
          if (data.comment) {
            setComments({ comment: data.comment });
          }

          // Fetch Prev/Next
          if (data.createdAt) {
            const colRef = collection(db, collectionName);
            // Prev (Newer)
            const prevQuery = query(colRef, orderBy("createdAt", "asc"), startAfter(data.createdAt), limit(1));
            const prevSnap = await getDocs(prevQuery);
            const prevdoc = prevSnap.empty ? null : prevSnap.docs[0];

            // Next (Older)
            const nextQuery = query(colRef, orderBy("createdAt", "desc"), startAfter(data.createdAt), limit(1));
            const nextSnap = await getDocs(nextQuery);
            const nextdoc = nextSnap.empty ? null : nextSnap.docs[0];

            setIndexs({
              prevId: prevdoc ? prevdoc.id : null,
              prevTitle: prevdoc ? prevdoc.data().title : null,
              nextId: nextdoc ? nextdoc.id : null,
              nextTitle: nextdoc ? nextdoc.data().title : null
            });
          }

        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [datas, id]);

  function formatDate(dateStr: string) {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split('T')[0].split('-');
    return `${parseInt(year)}년 ${parseInt(month)}월 ${parseInt(day)}일`;
  }

  async function comment(text: string) {
    if (!text) return;
    try {
      const { doc, updateDoc } = await import("firebase/firestore");
      const { getFirebaseDb } = await import("@/lib/firebase");

      const db = await getFirebaseDb();
      if (!db) return;

      const collectionName = getCollectionName(datas);
      await updateDoc(doc(db, collectionName, id), {
        comment: text
      });
      setComments({ comment: text });
      setCommentText("");
      setIsWritingComment(false);
    } catch (e) {
      useToastStore.getState().addToast("댓글 작성에 실패했습니다.", "error");
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("정말로 삭제하시겠습니까?")) return;

    if (datas === "QNA" || datas === "qna") {
      const result = await DeleteQA(id);
      if (result.status === 200) {
        useToastStore.getState().addToast("성공적으로 삭제되었습니다.", "success");
        router.push("/qna");
      } else {
        useToastStore.getState().addToast(result.message || "삭제에 실패했습니다.", "error");
      }
    } else {
      useToastStore.getState().addToast("이 메뉴에서는 삭제 기능을 제공하지 않습니다.", "error");
    }
  };

  if (!item) return (
    <div className="flex justify-center items-center min-h-[95vh]">
      <Loading />
    </div>
  );

  const backHref = `/${datas === "QNA" ? "qna" : datas === "activity" ? "act" : datas}`;

  return (
    <div className="flex flex-col items-center px-4 py-8 md:py-10">
      <div className="flex w-full max-w-5xl flex-col gap-6">
        <div className="space-y-2">
          <p className="text-lg font-semibold text-orange-500">
            <Link href={backHref}>{name || "목록"}</Link>
          </p>
          <hr className="border-[#CCCCCC] border-[1px] rounded-[5px]" />
        </div>

        {name === '활동' ? (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              {item.image && (
                <div className="w-full lg:w-2/5">
                  <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt="이미지" className="h-full w-full object-cover" />
                  </div>
                </div>
              )}

              <div className="flex flex-1 flex-col">
                <h1 className="text-2xl font-bold">{item.title}</h1>
                <p className="mt-1 text-sm text-gray-500">{formatDate(item.createdAt)}</p>

                <hr className="my-4 border-[#EBEBEB]" />
                <div className="rounded-xl border border-[#EAEAEA] bg-white p-4 text-base leading-relaxed">
                  {makeDocument(item.content)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold break-words">{name === 'QnA' ? 'Q. ' : ''}{item.title}</h1>
                <p className="text-sm text-gray-500">{formatDate(item.createdAt)}</p>
              </div>
              {(name === 'QnA' || datas === 'QNA') && (role === 'ADMIN' || userId === item.uid) && (
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 bg-red-50 text-red-500 border border-red-200 rounded hover:bg-red-100 transition-colors text-sm font-medium whitespace-nowrap"
                >
                  삭제
                </button>
              )}
            </div>
            <div className="rounded-xl border border-[#EAEAEA] bg-white p-4 text-base leading-relaxed">
              {makeDocument(item.content)}
            </div>
            {(name === 'QnA' || datas === 'QNA') && (comments?.comment || role === 'ROLE_ADMIN' || role === 'ADMIN') && (
              <div className="flex flex-col gap-4 rounded-xl border border-[#EAEAEA] bg-white p-4">
                {comments?.comment ? (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFD19C]">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF961F] text-sm font-semibold text-white">
                        A
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-800">{comments.comment}</p>
                  </div>
                ) : isWritingComment ? (
                  <>
                    <textarea
                      className="h-32 w-full resize-none rounded-lg border border-gray-300 p-3 text-sm focus:outline-none"
                      placeholder="답변을 입력하세요."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700"
                        onClick={() => setIsWritingComment(false)}
                      >
                        취소
                      </button>
                      <button
                        className="rounded-md bg-orange-400 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-500"
                        onClick={() => comment(commentText)}
                      >
                        댓글 올리기
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-center">
                    <button
                      className="m-2 rounded-md bg-orange-400 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-500"
                      onClick={() => setIsWritingComment(true)}
                    >
                      답변 작성
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 flex w-full max-w-5xl flex-col gap-3 border-t border-[#EAEAEA] pt-4 md:mt-10 md:flex-row md:items-center md:justify-between">
        {indexs?.prevId ? (
          <Link href={`/${datas}/${indexs.prevId}`} className="text-sm text-gray-700 hover:text-orange-500">
            이전글 - {indexs.prevTitle}
          </Link>
        ) : (
          <span className="text-sm text-gray-400">이전글이 없습니다</span>
        )}
        {indexs?.nextId ? (
          <Link href={`/${datas}/${indexs.nextId}`} className="text-sm text-gray-700 hover:text-orange-500">
            다음글 - {indexs.nextTitle}
          </Link>
        ) : (
          <span className="text-sm text-gray-400">다음글이 없습니다</span>
        )}
      </div>
    </div>
  );
}
