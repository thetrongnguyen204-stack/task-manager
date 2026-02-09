
import { GoogleGenAI, Type } from "@google/genai";
import { Project, Priority, FeasibilityResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const checkFeasibility = async (project: Project, files: { data: string, mimeType: string }[]): Promise<FeasibilityResponse> => {
  const { name, goal, background, startDate, endDate, dailyWorkTime } = project;

  const prompt = `As a project management expert, evaluate if this goal is realistic:
    Goal: ${goal}
    Target: ${name}
    Available Daily Time: ${dailyWorkTime} hours
    Duration: ${startDate} to ${endDate}
    Background context: ${background}

    If the project seems overly ambitious or impossible given the constraints, provide 3 distinct adjustment options:
    1. Adjust Daily Work Hours (increase).
    2. Adjust End Date (extend).
    3. Adjust Goal (simplify).

    Return JSON format only.`;

  const parts: any[] = [{ text: prompt }];
  files.forEach(f => {
    parts.push({ inlineData: { data: f.data.split(',')[1], mimeType: f.mimeType } });
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isFeasible: { type: Type.BOOLEAN },
            reasoning: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "hours, deadline, or goal" },
                  description: { type: Type.STRING },
                  suggestedValue: { type: Type.STRING }
                },
                required: ["type", "description", "suggestedValue"]
              }
            }
          },
          required: ["isFeasible", "reasoning"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Feasibility check failed", error);
    return { isFeasible: true, reasoning: "Error checking feasibility, proceeding anyway." };
  }
};

export const generateTaskRoadmap = async (project: Project, files: { data: string, mimeType: string }[]) => {
  const { name, goal, background, startDate, endDate, dailyWorkTime, priority } = project;

  let bufferLogic = "";
  if (priority === Priority.ON_TIME) {
    bufferLogic = "Plan tasks within 90% of available time. Reserve 10% for 'Review' tasks. Each day must include a 'Daily Check' task.";
  } else if (priority === Priority.IN_TIME) {
    bufferLogic = "Plan tasks within 98% of available time. Reserve 2% for 'Review' tasks. Each day must include a 'Daily Check' task.";
  } else {
    bufferLogic = "Spread out planning. Actual tasks can extend the deadline by 20% if needed. Focus on a relaxed pace.";
  }

  const prompt = `You are a project management expert. Generate a daily task roadmap.
    Project: ${name}
    Goal: ${goal}
    Duration: ${startDate} to ${endDate}
    Daily Hours: ${dailyWorkTime}
    Priority Strategy: ${priority} (${bufferLogic})
    Context: ${background}

    Break down into a JSON array of daily entries with specific actionable tasks.`;

  const parts: any[] = [{ text: prompt }];
  files.forEach(f => {
    parts.push({ inlineData: { data: f.data.split(',')[1], mimeType: f.mimeType } });
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    content: { type: Type.STRING },
                    type: { type: Type.STRING },
                    isBuffer: { type: Type.BOOLEAN }
                  },
                  required: ["content", "type"]
                }
              }
            },
            required: ["date", "tasks"]
          }
        }
      }
    });

    return JSON.parse(response.text?.trim() || "[]");
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
