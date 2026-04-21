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
    <div className="flex flex-col items-center py-4 w-full overflow-x-auto">
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

  const hasChildren = node.child && node.child.length > 0;

  return (
    <div className="flex flex-col items-center text-2xl">
      <div className={`w-[12.5rem] h-[5rem] border-2 ${node.level == 0 ? "bg-[#ED9735] border-[#BD894D]" : node.level == 1 ? "bg-[#F4AA55] border-[#ED9735]" : node.level == 2 ? "bg-[#FCC07C] border-[#F4AA55]" : "bg-[#FFFFFF] border-[#FCC07C]"} flex justify-center items-center rounded-md font-semibold`}>
        {node.name}
      </div>

      {hasChildren && (
        <div className="flex flex-col items-center">
          {/* 부모에서 내려오는 수직선 */}
          <div className="w-[2px] h-[16px] bg-gray-400" />

          {/* 자식들 컨테이너 */}
          <div className={`relative flex ${node.level == 2 ? 'flex-col' : 'items-start'}`}>
            {node.child!.map((child: OrgNode, index) => (
              <div key={index} className={`flex flex-col items-center relative ${node.level == 2 ? '' : 'px-3'}`}>
                {/* 수평 연결선 */}
                {node.level !== 2 && node.child!.length > 1 && (
                  <div className="absolute top-0 left-0 w-full flex h-[2px]">
                    <div className={`flex-1 ${index === 0 ? '' : 'border-t-2 border-gray-400'}`} />
                    <div className={`flex-1 ${index === node.child!.length - 1 ? '' : 'border-t-2 border-gray-400'}`} />
                  </div>
                )}
                {/* 각 자식으로 내려가는 수직선 */}
                {(node.level !== 2 || index > 0) && <div className="w-[2px] h-[16px] bg-gray-400" />}
                
                <OrgNodeComponent node={child} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}