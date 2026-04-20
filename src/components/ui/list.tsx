'use client'

import React, { useState, useEffect } from 'react';
import Listbox from '../layout/Listbox';


type ListProps = {
  name: string;
  data: string;
};




export function List({ name, data }: ListProps) {

  const [item, setitem] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { collection, getDocs } = await import("firebase/firestore");
        const { getFirebaseDb } = await import("@/lib/firebase");

        const db = await getFirebaseDb();
        if (!db) return;

        const querySnapshot = await getDocs(collection(db, data));
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setitem(items as any);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [data]);


  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pt-8 pb-12 md:gap-6 md:pb-16">
      <p className="text-xl font-semibold md:text-2xl dark:text-white">{name}</p>
      <hr className="border-[#CCCCCC] dark:border-gray-700 border-[1px] rounded-[5px]" />
      <div className="w-full">
        <Listbox item={item} datas={data} name={name} />
      </div>
    </div>

  );
}
