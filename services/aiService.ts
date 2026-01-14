import { GoogleGenAI } from "@google/genai";

// --- API Configuration ---
const GEMINI_API_KEY = 'sk-61cPRlkHDLt1OtHQzOaKwiC4DAiBHLImjuL6dR9iRHIE13u7';
const GEMINI_BASE_URL = 'https://gaccodeapi.com/v1';
const GEMINI_MODEL = 'gemini-3-pro-preview';

const DEEPSEEK_API_KEY = 'sk-1d93dbb485264d3ba117424db123ad76';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';
const DEEPSEEK_MODEL = 'deepseek-chat';

// --- AI Models Configuration ---
export const AI_MODELS = [
  {
    id: 'gemini',
    name: 'Gemini Pro',
    icon: '✨',
    description: 'Google Gemini 3 Pro'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🧠',
    description: 'DeepSeek Chat'
  }
] as const;

export type AIModelId = typeof AI_MODELS[number]['id'];

// --- Gemini Client ---
const getGeminiClient = () => {
  return new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
    baseUrl: GEMINI_BASE_URL
  });
};

// --- DeepSeek Client (OpenAI-compatible) ---
const callDeepSeek = async (prompt: string, systemPrompt?: string): Promise<string> => {
  const messages: any[] = [];

  if (systemPrompt) {
    messages.push({
      role: 'system',
      content: systemPrompt
    });
  }

  messages.push({
    role: 'user',
    content: prompt
  });

  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API Error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No response";
};

// --- Unified AI Service ---
export const generateTextWithAI = async (
  prompt: string,
  modelId: AIModelId = 'gemini',
  systemPrompt?: string
): Promise<string> => {
  try {
    if (modelId === 'deepseek') {
      return await callDeepSeek(prompt, systemPrompt);
    } else {
      // Gemini
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: { parts: [{ text: prompt }] },
        config: systemPrompt ? { systemInstruction: systemPrompt } : undefined
      });
      return response.text || "No response";
    }
  } catch (error: any) {
    console.error(`AI Generation Error (${modelId}):`, error);
    throw new Error(error.message || `Failed to generate with ${modelId}`);
  }
};

// --- Prompt Enhancement System Instruction ---
export const PROMPT_ENHANCER_INSTRUCTION = `你是一位专业的AI提示词优化专家。你的任务是将用户的简短想法转化为详细、高质量的创意描述。

请遵循以下要求：
1. 保持创意的核心意图不变
2. 添加视觉细节、氛围、风格等描述
3. 使用生动的形容词和具体的场景描述
4. 输出应该适合用于AI图像/视频生成
5. 保持简洁，控制在150字以内
6. 使用中文输出

直接输出优化后的提示词，不要添加任何解释或前缀。`;
