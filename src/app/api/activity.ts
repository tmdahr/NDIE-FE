import { getFirebaseDb, getFirebaseStorage, getFirebaseAuth } from "@/lib/firebase";

export const CreateActivity = async (data: { title: string, content: string, image: string }) => {
  console.log('[CreateActivity] 시작:', data);

  try {
    // Firestore 연결 확인
    const db = await getFirebaseDb();
    if (!db) {
      console.error('[CreateActivity] Firestore 초기화 안됨');
      return {
        status: 500 as const,
        message: 'Firebase가 초기화되지 않았습니다. 페이지를 새로고침해주세요.'
      };
    }

    // Firebase Auth 상태 확인
    const auth = await getFirebaseAuth();
    const currentUser = auth?.currentUser;
    console.log('[CreateActivity] Firebase Auth 상태:', currentUser ? `로그인됨 (${currentUser.email})` : '로그인 안됨');
    
    if (!currentUser) {
      return {
        status: 401 as const,
        message: '로그인이 필요합니다. 다시 로그인해주세요.'
      };
    }

    console.log('[CreateActivity] Firestore 연결 확인 완료');

    const docData = {
      ...data,
      uid: currentUser.uid,
      createdAt: new Date().toISOString()
    };

    console.log('[CreateActivity] addDoc 호출 시작...');
    const { collection, addDoc } = await import("firebase/firestore");
    const docRef = await addDoc(collection(db, "activity"), docData);
    
    console.log('[CreateActivity] 문서 생성 성공:', docRef.id);
    return { status: 200 as const };
  } catch (e) {
    console.error('[CreateActivity] 오류:', e);

    let message = '활동 작성에 실패했습니다.';
    if (e instanceof Error) {
      message = e.message;

      if ('code' in e) {
        const firebaseError = e as { code: string };
        switch (firebaseError.code) {
          case 'permission-denied':
            message = '권한이 없습니다. 관리자 권한을 확인해주세요.';
            break;
          case 'unavailable':
            message = 'Firebase 서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.';
            break;
          case 'unauthenticated':
            message = '인증되지 않았습니다. 다시 로그인해주세요.';
            break;
        }
      }
    }

    return { status: 500 as const, message };
  }
};

export const uploadImg = async (data: FormData) => {
  console.log('[uploadImg] 시작');

  try {
    // Storage 연결 확인
    const storage = await getFirebaseStorage();
    if (!storage) {
      console.error('[uploadImg] Storage 초기화 안됨');
      return {
        url: null,
        message: 'Firebase Storage가 초기화되지 않았습니다. 페이지를 새로고침해주세요.'
      };
    }

    const file = data.get('file') as File;
    if (!file) {
      console.error('[uploadImg] 파일 없음');
      throw new Error("파일이 선택되지 않았습니다.");
    }

    console.log('[uploadImg] 파일 업로드 시작:', file.name);

    const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
    const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);

    // 타임아웃 60초 (이미지 업로드는 시간이 더 걸릴 수 있음)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => {
        console.error('[uploadImg] 타임아웃 발생');
        reject(new Error("이미지 업로드 시간이 초과되었습니다."));
      }, 60000)
    );

    const uploadPromise = uploadBytes(storageRef, file)
      .then((snapshot) => {
        console.log('[uploadImg] 업로드 완료, URL 가져오기');
        return getDownloadURL(snapshot.ref);
      })
      .then((downloadURL) => {
        console.log('[uploadImg] 다운로드 URL 생성 완료:', downloadURL);
        return downloadURL;
      });

    const downloadURL = await Promise.race([uploadPromise, timeoutPromise]);

    return { url: downloadURL };
  } catch (e) {
    console.error('[uploadImg] 오류:', e);

    let message = '이미지 업로드에 실패했습니다.';
    if (e instanceof Error) {
      message = e.message;

      if ('code' in e) {
        const firebaseError = e as { code: string };
        switch (firebaseError.code) {
          case 'storage/unauthorized':
            message = '이미지 업로드 권한이 없습니다.';
            break;
          case 'storage/canceled':
            message = '이미지 업로드가 취소되었습니다.';
            break;
          case 'storage/unknown':
            message = '알 수 없는 오류가 발생했습니다.';
            break;
        }
      }
    }

    return { url: null, message };
  }
};

export const DeleteActivity = async (id: string) => {
  try {
    const db = await getFirebaseDb();
    if (!db) {
      return { status: 500, message: 'Firebase가 초기화되지 않았습니다.' };
    }

    const { doc, deleteDoc } = await import("firebase/firestore");
    await deleteDoc(doc(db, "activity", id));
    
    return { status: 200 };
  } catch (e: any) {
    console.error('[DeleteActivity] 오류:', e);
    let message = '활동 삭제에 실패했습니다.';
    if (e.code === 'permission-denied') {
      message = '삭제 권한이 없습니다.';
    }
    return { status: 500, message };
  }
};
