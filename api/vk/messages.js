module.exports = async function handler(req, res) {
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
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { access_token, v, user_id, message, random_id } = req.query;

    // Проверяем обязательные параметры
    if (!user_id || !message || !access_token || !random_id) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }

    // Формируем URL для VK API
    const vkUrl = new URL("https://api.vk.com/method/messages.send");
    vkUrl.searchParams.set("user_id", user_id);
    vkUrl.searchParams.set("message", message);
    vkUrl.searchParams.set("random_id", random_id);
    vkUrl.searchParams.set("access_token", access_token);
    vkUrl.searchParams.set("v", v || "5.131");

    console.log("VK Messages API Request:", vkUrl.toString());

    // Делаем запрос к VK API
    const response = await fetch(vkUrl.toString());
    const data = await response.json();

    console.log("VK Messages API Response:", data);

    // Возвращаем ответ
    res.status(200).json(data);
  } catch (error) {
    console.error("VK Messages API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
