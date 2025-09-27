export const ProjectPendingDisplay = () => {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Загрузка проекта...</p>
      </div>
    </div>
  );
};
