export const EventLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-screen flex items-center justify-center p-2 md:p-4 lg:p-8 gradient-bg-rainbow relative">
      <div className="flex w-full md:w-11/12 h-full md:h-11/12 bg-white rounded-lg shadow-lg">
        {children}
      </div>
    </div>
  );
};
