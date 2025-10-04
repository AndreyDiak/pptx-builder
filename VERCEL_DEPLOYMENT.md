# 🚀 Инструкция по деплою на Vercel

## ✅ **Что уже готово:**

1. **Vercel API Routes** - настроены в папке `api/vk/`
2. **Переменные окружения** - используются в коде
3. **CORS заголовки** - настроены в API routes
4. **Адаптивные URL** - код автоматически переключается между dev/prod

## 🔧 **Настройка на Vercel:**

### **1. Переменные окружения**
В панели Vercel добавьте следующие переменные:

```
VITE_VK_ACCESS_TOKEN=vk1.a.EIdSTdwx-XXzwQS14tJA-JIRpGmsq94UC2QjeumQy-3Q9JP3-rEDBuo0RVcWHopthNFfkWsY5K8oXJhuREFhH0-XgXrWbDtLyfUDU9ttw1S-zPo7917tsx9jEJEplAwoV3a1lVRlt-zfF86gtzUUU6pdb5pNb9NexxwyPylMGB8Rcu4lukoYo_h1Lh0lXUii48-thWIcg4Hba7yZKAr6kQ

VITE_DB_PASS=Transformer200219690821

VITE_SUPABASE_URL=https://eufboojrcqcbreqkadvy.supabase.co

VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1ZmJvb2pyY3FjYnJlcWthZHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MzczNjcsImV4cCI6MjA3NDMxMzM2N30.gTQ-QBrS8_vg_yHafjy58xb9uabAC-OnOddatGCjSxo

VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1ZmJvb2pyY3FjYnJlcWthZHZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzM2NywiZXhwIjoyMDc0MzEzMzY3fQ.ybo184E9NZnHaBtlDOjtOCQ9yMDlhiKK-B0N1DbKf60
```

### **2. Деплой**
1. Подключите репозиторий к Vercel
2. Vercel автоматически определит настройки сборки
3. Дождитесь завершения деплоя

## 🔍 **Как это работает:**

### **Development (локально):**
- Vite proxy: `/api/vk/*` → `https://api.vk.com/method/*`
- Переменные из `.env` файла

### **Production (Vercel):**
- Прямые запросы к VK API: `https://api.vk.com/method/*`
- Переменные из Vercel Environment Variables
- Vercel API Routes для CORS (если понадобятся)

## ⚠️ **Потенциальные проблемы:**

### **1. CORS на Vercel**
Если возникнут CORS ошибки, можно использовать Vercel API Routes:
- `/api/vk/users` - для получения пользователей
- `/api/vk/messages` - для отправки сообщений

### **2. VK API токены**
- **Group Token** - работает для получения данных пользователей
- **User Token** - нужен для отправки сообщений (если Group Token не работает)

### **3. Supabase**
- Убедитесь, что Supabase проект настроен для внешних доменов
- Добавьте домен Vercel в настройки Supabase

## 🧪 **Тестирование после деплоя:**

1. **Проверьте загрузку данных** - должны загружаться проекты и мероприятия
2. **Проверьте VK аватары** - должны отображаться аватары пользователей
3. **Проверьте отправку уведомлений** - должна работать отправка сообщений

## 📞 **Поддержка:**

Если что-то не работает:
1. Проверьте логи в Vercel Dashboard
2. Проверьте переменные окружения
3. Проверьте права VK токена
4. Проверьте настройки Supabase
