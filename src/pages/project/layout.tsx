export const ProjectLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-screen flex items-center justify-center p-8 gradient-bg-rainbow relative">
      <div className="flex w-11/12 h-11/12 bg-white rounded-lg shadow-lg">
        {children}
      </div>
    </div>
  );
};
