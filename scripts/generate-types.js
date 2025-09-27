import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Простой генератор типов для Supabase
function generateTypes() {
  const typesContent = `
// Автоматически сгенерированные типы для Supabase
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
      };
      slides: {
        Row: {
          id: string;
          presentation_id: string;
          content: any;
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          presentation_id: string;
          content: any;
          order: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          presentation_id?: string;
          content?: any;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
`;

  const outputPath = path.join(__dirname, '../src/types/supabase.ts');
  fs.writeFileSync(outputPath, typesContent);
  console.log('✅ Types generated successfully at:', outputPath);
}

generateTypes();
