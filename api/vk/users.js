export default async function handler(req, res) {
  // Устанавливаем CORS заголовки
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Обрабатываем preflight запросы
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Проверяем метод
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { user_ids, fields, access_token, v } = req.query;

    // Проверяем обязательные параметры
    if (!user_ids || !access_token) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }

    // Формируем URL для VK API
    const vkUrl = new URL("https://api.vk.com/method/users.get");
    vkUrl.searchParams.set("user_ids", user_ids);
    vkUrl.searchParams.set(
      "fields",
      fields || "photo_200,photo_100,photo_50,screen_name,domain"
    );
    vkUrl.searchParams.set("access_token", access_token);
    vkUrl.searchParams.set("v", v || "5.131");

    console.log("VK API Request:", vkUrl.toString());

    // Делаем запрос к VK API
    const response = await fetch(vkUrl.toString());
    const data = await response.json();

    console.log("VK API Response:", data);

    // Возвращаем ответ
    res.status(200).json(data);
  } catch (error) {
    console.error("VK API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
