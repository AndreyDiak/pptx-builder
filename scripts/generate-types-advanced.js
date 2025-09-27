import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Продвинутый генератор типов для Supabase
async function generateTypesFromSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('⚠️  Supabase URL или ключ не найдены в переменных окружения');
    console.log('📝 Создаю базовые типы...');
    generateBasicTypes();
    return;
  }

  try {
    console.log('🔄 Подключение к Supabase...');
    
    // Здесь можно добавить логику для получения схемы из Supabase
    // Пока что используем базовые типы
    generateBasicTypes();
    
  } catch (error) {
    console.error('❌ Ошибка при генерации типов:', error);
    console.log('📝 Создаю базовые типы...');
    generateBasicTypes();
  }
}

function generateBasicTypes() {
  const typesContent = `// Автоматически сгенерированные типы для Supabase
// Сгенерировано: ${new Date().toISOString()}

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: 'in-progress' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          status?: 'in-progress' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          status?: 'in-progress' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      slides: {
        Row: {
          id: string;
          project_id: string;
          title: string | null;
          content: any;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title?: string | null;
          content?: any;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string | null;
          content?: any;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "slides_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      projects_with_stats: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: 'in-progress' | 'completed';
          created_at: string;
          updated_at: string;
          slide_count: number;
          last_activity: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_project_with_slides: {
        Args: {
          project_uuid: string;
        };
        Returns: {
          project_id: string;
          project_name: string;
          project_description: string | null;
          project_status: string;
          project_created_at: string;
          project_updated_at: string;
          slide_id: string | null;
          slide_title: string | null;
          slide_content: any;
          slide_order_index: number | null;
          slide_created_at: string | null;
          slide_updated_at: string | null;
        }[];
      };
      get_project_slide_count: {
        Args: {
          project_uuid: string;
        };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Типы для удобства использования
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Типы для связанных данных
export type ProjectWithSlides = Tables<'projects'> & {
  slides: Tables<'slides'>[];
};

export type SlideWithProject = Tables<'slides'> & {
  project: Tables<'projects'>;
};

// Типы для вставки с автоматическими полями
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type SlideInsert = Database['public']['Tables']['slides']['Insert'];

// Типы для обновления
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
export type SlideUpdate = Database['public']['Tables']['slides']['Update'];
`;

  const outputPath = path.join(__dirname, '../src/types/supabase.ts');
  fs.writeFileSync(outputPath, typesContent);
  console.log('✅ Types generated successfully at:', outputPath);
}

// Запускаем генерацию
generateTypesFromSupabase();
