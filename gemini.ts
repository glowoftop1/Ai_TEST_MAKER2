import { GoogleGenerativeAI } from "@google/genai";
import { FileData, QuizOptions, QuizData } from "./types";

// API 키를 꼭 따옴표 "" 안에 넣어주세요!
const genAI = new GoogleGenerativeAI("AIzaSyD92RG9DD-8Bs6uyPgfkZoHvMJnkw7QK5Y");

export async function generateQuestions(files: FileData[], options: QuizOptions): Promise<QuizData> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" } // JSON으로만 대답하도록 강제합니다.
    });

    // AI에게 줄 명령문(프롬프트)을 구체화했습니다.
    const prompt = `
      제공된 파일의 내용을 바탕으로 총 ${options.totalQuestions}개의 문제를 생성해줘.
      난이도 배분: 상(${options.difficultyDistribution.hard}), 중(${options.difficultyDistribution.medium}), 하(${options.difficultyDistribution.easy}).
      반드시 QuizData 형식의 JSON으로만 출력해줘.
    `;
    
    const parts = files.map(file => ({
      inlineData: {
        data: file.base64.split(',')[1],
        mimeType: file.type
      }
    }));

    const result = await model.generateContent([prompt, ...parts]);
    const response = await result.response;
    let text = response.text();

    // 혹시 모를 백틱 기호(```json)를 제거하는 안전장치입니다.
    text = text.replace(/```json|```/g, "").trim();

    return JSON.parse(text) as QuizData;

  } catch (error) {
    console.error("AI 요청 중 에러 발생:", error);
    // Vercel 환경에서는 에러 메시지가 HTML로 올 수 있었으나, 이제 직접 통신하므로 JSON 에러가 발생합니다.
    throw new Error("AI 문제 생성 중 오류가 발생했습니다. 파일이 너무 크거나 API 키 권한을 확인해주세요.");
  }
}
