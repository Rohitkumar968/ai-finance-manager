const axios = require("axios");

const BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

const isConfigured = () => Boolean(process.env.OPENROUTER_API_KEY);

const generateContent = async (prompt, options = {}) => {
  if (!isConfigured()) {
    const err = new Error("OPENROUTER_API_KEY is missing.");
    err.code = "AI_NOT_CONFIGURED";
    throw err;
  }

  const {
    temperature = 0.7,
    maxOutputTokens = 1024,
  } = options;

  const response = await axios.post(
    BASE_URL,
    {
      model: process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat-v3-0324",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature,
      max_tokens: maxOutputTokens,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const content = response.data?.choices?.[0]?.message?.content;

if (!content) {
  console.log("===== OPENROUTER CHAT RESPONSE =====");
  console.log(JSON.stringify(response.data, null, 2));
  throw new Error("OpenRouter returned empty content.");
}

return content.trim();o

};

const generateChatReply = async (
  history = [],
  message,
  options = {}
) => {
  if (!isConfigured()) {
    const err = new Error("OPENROUTER_API_KEY is missing.");
    err.code = "AI_NOT_CONFIGURED";
    throw err;
  }

  const {
    temperature = 0.7,
    maxOutputTokens = 800,
    systemContext = "",
  } = options;

  const messages = [];

  if (systemContext) {
    messages.push({
      role: "system",
      content: systemContext,
    });
  }

  history.forEach((item) => {
    messages.push({
      role:
        item.role === "assistant" || item.role === "model"
          ? "assistant"
          : "user",
      content: item.content,
    });
  });

  messages.push({
    role: "user",
    content: message,
  });

  const response = await axios.post(
    BASE_URL,
    {
      model: process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat-v3-0324",
      messages,
      temperature,
      max_tokens: maxOutputTokens,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message.content.trim();
};

const extractJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch (_) {}

  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Failed to parse AI response as JSON.");
  }

  return JSON.parse(cleaned.substring(start, end + 1));
};

module.exports = {
  isConfigured,
  generateContent,
  generateChatReply,
  extractJSON,
};