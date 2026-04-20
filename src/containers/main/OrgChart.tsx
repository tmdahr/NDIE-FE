"use client";
import React, { useState, useEffect } from "react";
import { getFirebaseDb } from "@/lib/firebase";

type OrgNode = {
  name: string;
  level: number;
  child?: OrgNode[];
};

const defaultData: OrgNode = {
  name: "root",
  level: 0,
  child: [{
    name: "child",
    level: 1,
    child: [
      { name: "child2", level: 2 },
      { name: "child2", level: 2 },
      {
        name: "child2",
        level: 2,
        child: [
          { name: "child3.1", level: 3 },
          { name: "child3.2", level: 3 },
          { name: "child3.3", level: 3 }
        ]
      }
    ]
  }]
};

export default function OrgChart() {
  const [orgTreeData, setOrgTreeData] = useState<OrgNode>(defaultData);

  useEffect(() => {
    const loadData = async () => {
      try {
        const db = await getFirebaseDb();
        if (!db) return;

        const { doc, getDoc } = await import("firebase/firestore");
        const docRef = doc(db, "organization", "chart");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrgTreeData(docSnap.data() as OrgNode);
        }
      } catch (e) {
        console.error("조직도 로드 실패:", e);
      }
    };
    loadData();
  }, []);
  return (
    <div className="flex flex-col items-center py-12 w-full overflow-x-auto">
      <div className="min-w-fit px-4">
        <OrgNodeComponent node={orgTreeData} />
      </div>
    </div>
  );
}
type orgNodeComponentProps = {
  node: OrgNode;
}
const OrgNodeComponent = ({ node }: orgNodeComponentProps) => {

  return (
    <div className="flex flex-col items-center gap-4 text-2xl">
      <div className={`w-[12.5rem] h-[5rem] border-2 ${node.level == 0 ? "bg-[#ED9735] border-[#BD894D]" : node.level == 1 ? "bg-[#F4AA55] border-[#ED9735]" : node.level == 2 ? "bg-[#FCC07C] border-[#F4AA55]" : "bg-[#FFFFFF] dark:bg-gray-800 border-[#FCC07C] dark:border-gray-600"} flex justify-center items-center rounded-md dark:text-white`}>
        {node.name}
      </div>
      <div className={`flex ${node.level == 2 ? 'flex-col' : 'flex-row gap-6'}`}>
        {node.child?.map((child: OrgNode, index) => {
          return <OrgNodeComponent key={index} node={child} />
        })}
      </div>
    </div>
  )
}