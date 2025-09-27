# Сгенерировать типы из БД
npx supabase gen types typescript --project-id ${SUPABASE_PROJECT_REF} --schema public >.\supabase\types.ts
