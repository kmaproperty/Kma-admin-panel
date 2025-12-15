
export default function MainLayout({ children }) {
  return (
    <div className="">
        <div className="flex justify-center z-1 w-full">
          <div className="w-full flex">
            {children}
          </div>  
      </div>
    </div>
  );
}
