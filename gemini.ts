import { FileData, QuizOptions, QuizData } from "../types";

export async function generateQuestions(files: FileData[], options: QuizOptions): Promise<QuizData> {
  const response = await fetch('/api/generate-questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ files, options })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '문제 생성 중 서버 내부 오류가 발생했습니다.');
  }

  return data as QuizData;
}
