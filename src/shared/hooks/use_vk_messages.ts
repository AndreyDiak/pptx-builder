import { useCallback, useState } from "react";

interface VkMessageResponse {
  response: number; // message_id
}

interface VkErrorResponse {
  error: {
    error_code: number;
    error_msg: string;
    request_params: any[];
  };
}

interface SendMessageState {
  sending: boolean;
  error: string | null;
  success: boolean;
}

export function useVkMessages() {
  const [state, setState] = useState<SendMessageState>({
    sending: false,
    error: null,
    success: false,
  });

  const sendMessage = useCallback(async (userId: number, message: string) => {
    setState({ sending: true, error: null, success: false });

    try {
      const accessToken = import.meta.env.VITE_VK_ACCESS_TOKEN || 'vk1.a.EIdSTdwx-XXzwQS14tJA-JIRpGmsq94UC2QjeumQy-3Q9JP3-rEDBuo0RVcWHopthNFfkWsY5K8oXJhuREFhH0-XgXrWbDtLyfUDU9ttw1S-zPo7917tsx9jEJEplAwoV3a1lVRlt-zfF86gtzUUU6pdb5pNb9NexxwyPylMGB8Rcu4lukoYo_h1Lh0lXUii48-thWIcg4Hba7yZKAr6kQ';

      if (!accessToken) {
        throw new Error("VK access token не настроен");
      }

      console.log('VK Messages: Отправляем сообщение пользователю', userId);

      // Генерируем уникальный random_id (timestamp + случайное число)
      const randomId = Date.now() + Math.floor(Math.random() * 1000);
      console.log('VK Messages: random_id:', randomId);

          // Определяем базовый URL для API
          const baseUrl = import.meta.env.DEV 
            ? '' // Локально используем Vite proxy
            : window.location.origin; // На Vercel используем API routes
          
          const response = await fetch(`${baseUrl}/api/vk/messages?access_token=${accessToken}&v=5.131&user_id=${userId}&message=${encodeURIComponent(message)}&random_id=${randomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: VkMessageResponse | VkErrorResponse = await response.json();

      if ('error' in data) {
        throw new Error(`VK API Error: ${data.error.error_msg} (${data.error.error_code})`);
      }

      console.log('VK Messages: Сообщение отправлено, ID:', data.response);
      setState({ sending: false, error: null, success: true });
      
      return { success: true, messageId: data.response };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
      console.error('VK Messages: Ошибка при отправке:', error);
      setState({ sending: false, error: errorMessage, success: false });
      return { success: false, error: errorMessage };
    }
  }, []);

  const sendBulkMessages = useCallback(async (userIds: number[], message: string) => {
    setState({ sending: true, error: null, success: false });

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // VK API лимит: не более 20 сообщений в секунду
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      
      try {
        const result = await sendMessage(userId, message);
        results.push({ userId, ...result });
        
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }

        // Задержка между сообщениями (50ms = 20 сообщений в секунду)
        if (i < userIds.length - 1) {
          await delay(50);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
        results.push({ userId, success: false, error: errorMessage });
        errorCount++;
      }
    }

    setState({ 
      sending: false, 
      error: errorCount > 0 ? `Отправлено: ${successCount}, Ошибок: ${errorCount}` : null, 
      success: successCount > 0 
    });

    return {
      results,
      successCount,
      errorCount,
      totalCount: userIds.length
    };
  }, [sendMessage]);

  const resetState = useCallback(() => {
    setState({ sending: false, error: null, success: false });
  }, []);

  return {
    ...state,
    sendMessage,
    sendBulkMessages,
    resetState,
  };
}
