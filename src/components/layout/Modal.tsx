import React from 'react';
import "@/components/layout/animation.css"

export default function Modal({toggleModal, isOpen, children }: {
  isOpen: boolean,
  toggleModal : () => void,
  children: React.ReactNode
}) {
  if (!isOpen) return null;

  return (
    <div onClick={toggleModal} className="w-screen fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
      <div
        onClick={(e)=>e.stopPropagation()}
        className="w-[40%] min-h-[40%] modal-enter bg-white dark:bg-gray-800 p-12 rounded-xl shadow-lg relative"
      >
        {children}
      </div>
    </div>
  );
}