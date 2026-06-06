import config from "./config.json";

export function getTelegramToken(): string {
  return config.telegram_bot_token || "";
}

export function getChatId(): string {
  return config.chat_id || "";
}
