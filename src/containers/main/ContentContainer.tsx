import React from "react";

type ContainerProps = {
  children?: React.ReactNode;
  className?: string;
};

export default function ContentContainer({children, className}:ContainerProps) {
  return (
    <div className={`${className} min-h-[50rem] w-full overflow-hidden relative bg-[#F8F8F8] dark:bg-gray-900 px-4 md:px-40`}>
      {children}
    </div>
  )
}