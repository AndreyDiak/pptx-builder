import { Link } from "react-router-dom";

export const ProjectNoDataDisplay = () => {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Проект не найден
        </h2>
        <Link
          to="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Вернуться к проектам
        </Link>
      </div>
    </div>
  );
};
