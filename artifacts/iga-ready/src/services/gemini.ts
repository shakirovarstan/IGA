import { GoogleGenAI, Type } from "@google/genai";
import { Question, Subject } from "../types";

let genAI: GoogleGenAI | null = null;

const getGenAI = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

export async function generateAIQuestion(subject: Subject, topicName: string, lang: 'ru' | 'ky'): Promise<Question> {
  const ai = getGenAI();

  const prompt = `
    Generate ONE educational question for a 9th-grade exam in Kyrgyzstan.
    Subject: ${subject}
    Topic: ${topicName}
    
    The response MUST be a valid JSON object matching this TypeScript interface:
    
    interface Question {
      id: string; // generate a random unique string like "ai-q-xxxxx"
      subject: "${subject}";
      part: 1 | 2 | 3; // 1 (multiple choice), 2 (short answer), 3 (detailed solution)
      topic: string; // should be the internal ID if known, otherwise the name
      text: { ru: string; ky: string }; // The question text in both Russian and Kyrgyz
      options?: { id: string; text: string | { ru: string; ky: string } }[]; // Only for part 1 (4 options: a, b, c, d)
      correctAnswer: string; // The correct option letter (a, b, c, d) for part 1, or the correct text/number for part 2/3
      hints?: { ru: string; ky: string }[]; // Optional hints for part 3
      solution?: { ru: string[]; ky: string[] }; // Step-by-step solution for part 3
    }

    Guidelines:
    - Use LaTeX for mathematical formulas (e.g., $x^2$, $\\frac{1}{2}$).
    - Ensure historical dates are accurate for Kyrgyzstan.
    - The translations between RU and KY must be accurate.
    - HINTS MUST BE CLUES: Do not give the answer. Remind formulas, explain concepts briefly, or give a starting step.
    - If subject is "russian", the question should focus on Russian grammar/orthography.
    - Return ONLY the JSON object, no markdown blocks or extra text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    const parsed = JSON.parse(text);
    
    return {
      ...parsed,
      topic: parsed.topic || topicName,
      subject: subject // Override to ensure safety
    };
  } catch (error) {
    console.error("AI Generation failed:", error);
    throw error;
  }
}
