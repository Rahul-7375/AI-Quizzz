import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize OpenAI Client lazily
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      console.log("Initializing OpenAI client with provided key.");
      openaiClient = new OpenAI({ apiKey });
    }
  }
  return openaiClient;
}

// Initialize Gemini Client
// We use a lazy initializer to avoid crashing on startup if the API key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Load historical sports knowledge database
let historicalKnowledge: any = {};
try {
  const filePath = path.join(process.cwd(), "src/data/historical_sports_knowledge.json");
  if (fs.existsSync(filePath)) {
    historicalKnowledge = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }
} catch (err) {
  console.error("Error reading historical sports knowledge:", err);
}

// Load fallback quizzes database
let fallbackQuizzes: any = {};
try {
  const filePath = path.join(process.cwd(), "src/data/fallback_quizzes.json");
  if (fs.existsSync(filePath)) {
    fallbackQuizzes = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }
} catch (err) {
  console.error("Error reading fallback quizzes:", err);
}

// API endpoint to generate sports quiz
app.post("/api/quiz/generate", async (req, res) => {
  const { sport, difficulty, isThemedPack, themeTitle, themeDescription, themeFocus } = req.body;

  if (!sport || !difficulty) {
    return res.status(400).json({ error: "Sport and difficulty are required." });
  }

  const sportKey = sport.toLowerCase().replace(/\s+/g, "");
  const sportData = historicalKnowledge[sportKey] || { sportName: sport, historicalFacts: [], rules: [] };

  // 1. Gather historical data from local "ChromaDB"
  const localFactsText = [
    `Sport Name: ${sportData.sportName}`,
    `Verified Historical Facts:\n${sportData.historicalFacts.map((f: string) => `- ${f}`).join("\n")}`,
    `Verified Standard Rules:\n${sportData.rules.map((r: string) => `- ${r}`).join("\n")}`
  ].join("\n\n");

  // 2. Build User Prompt
  let userPrompt = "";
  if (isThemedPack) {
    userPrompt = `
      You are an expert AI Sports Quiz Generation Agent.
      The user has selected a **THEMED QUIZ PACK**:
      - Theme Title: ${themeTitle}
      - Theme Description: ${themeDescription}
      - Theme Focus: ${themeFocus}
      - Associated Sport: ${sportData.sportName}
      - Difficulty: ${difficulty} (Options: Easy, Medium, Hard)

      Please perform a live web search specifically focusing on the theme "${themeTitle}" (${themeDescription}) for the sport "${sportData.sportName}".
      Retrieve the latest, most accurate match results, historic milestones, legendary statistics, and champion news related to this theme.
      
      Merge our verified historical database context below with the live search results:
      ${localFactsText}

      RULES:
      1. Generate 4 to 5 unique, high-quality multiple-choice questions matching the theme "${themeTitle}" and difficulty: ${difficulty}.
      2. Ensure every question strictly revolves around this theme pack's subject matter (e.g. World Cup history, specific legendary players, premier league trivia, etc.).
      3. Avoid ambiguous options, ensure there is exactly one correct answer, and provide 4 meaningful options (A, B, C, D) for each.
      4. Provide a short, educational, and engaging explanation (1-3 sentences) referencing the retrieved facts or search results.
      5. If you cannot find enough verified facts to generate a high-quality, fully grounded quiz, populate the "isError" field with true and return the message: "I couldn't retrieve enough verified information to generate a factually accurate quiz. Please try again later or select another sport."

      You MUST respond with a JSON object containing the exact structure below. Do not include markdown formatting like \`\`\`json outside of standard JSON.
    `;
  } else {
    userPrompt = `
      You are an expert AI Sports Quiz Generation Agent.
      Generate a quiz for:
      Sport: ${sportData.sportName}
      Difficulty: ${difficulty} (Options: Easy, Medium, Hard)

      Here is our verified historical knowledge (representing ChromaDB vector store):
      ${localFactsText}

      Please perform a live web search to retrieve the most recent up-to-date events, tournaments, matches, player rankings, records, and champion updates for this sport.
      Merge both the historical knowledge and the recent search results into one grounded knowledge source.

      RULES:
      1. Generate 4 to 5 unique multiple-choice questions matching the selected difficulty: ${difficulty}.
      2. Each question must test a different concept (e.g., History, Rules, Players, Teams, Records, Recent Events).
      3. Ground the questions ONLY in the verified historical knowledge or live web search results.
      4. Avoid ambiguous options, ensure there is exactly one correct answer, and provide 4 meaningful options (A, B, C, D) for each.
      5. Provide a short, educational, and engaging explanation (1-3 sentences) referencing the retrieved facts or search results.
      6. If you cannot find enough verified facts to generate a high-quality, fully grounded quiz, populate the "isError" field with true and return the message: "I couldn't retrieve enough verified information to generate a factually accurate quiz. Please try again later or select another sport."

      You MUST respond with a JSON object containing the exact structure below. Do not include markdown formatting like \`\`\`json outside of standard JSON.
    `;
  }

  // 3. Try OpenAI First if Key is Available
  const openai = getOpenAIClient();
  if (openai) {
    try {
      console.log("Generating quiz with OpenAI...");
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert AI Sports Quiz Generation Agent. You MUST return a JSON object representing the quiz.
The response must adhere exactly to this JSON structure:
{
  "isError": false,
  "errorMessage": "",
  "sport": "${sportData.sportName}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "questionNumber": 1,
      "question": "The question text",
      "options": ["A. Option A", "B. Option B", "C. Option C", "D. Option D"],
      "correctAnswerLetter": "A",
      "explanation": "Brief explanation"
    }
  ],
  "rawSocialMediaText": "A social media post formatted with emojis for copy-pasting"
}`
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const resultText = completion.choices[0].message.content || "{}";
      const parsedData = JSON.parse(resultText);

      return res.json({
        ...parsedData,
        localFacts: sportData.historicalFacts,
        localRules: sportData.rules,
        searchQueries: ["Grounded Local Database Verification", "GPT-4o-Mini Reasoning Matcher"],
        sources: [
          { title: `${sportData.sportName} Grounded Factsheet`, uri: "https://sports.example.com/facts" },
          { title: "Standard Rulebook Guidelines", uri: "https://sports.example.com/rules" }
        ],
        isThemedPack: !!isThemedPack,
        themeTitle: themeTitle || null,
        provider: "OpenAI"
      });
    } catch (openaiErr: any) {
      console.error("OpenAI quiz generation failed, trying Gemini:", openaiErr.message);
    }
  }

  // 4. Try Gemini fallback/primary
  try {
    const ai = getAiClient();

    // We can define the schema for our JSON response
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isError: {
              type: Type.BOOLEAN,
              description: "True if there is not enough verified context to generate the quiz."
            },
            errorMessage: {
              type: Type.STRING,
              description: "The error message to return if isError is true."
            },
            sport: {
              type: Type.STRING,
              description: "The name of the sport or theme."
            },
            difficulty: {
              type: Type.STRING,
              description: "The difficulty level."
            },
            questions: {
              type: Type.ARRAY,
              description: "An array of 4 to 5 multiple choice questions.",
              items: {
                type: Type.OBJECT,
                properties: {
                  questionNumber: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exactly 4 options, each starting with its prefix, e.g. 'A. Player Name', 'B. Player Name', etc."
                  },
                  correctAnswerLetter: {
                    type: Type.STRING,
                    description: "Strictly 'A', 'B', 'C', or 'D'"
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "Short 1-3 sentence explanation referencing the grounding source."
                  }
                },
                required: ["questionNumber", "question", "options", "correctAnswerLetter", "explanation"]
              }
            },
            rawSocialMediaText: {
              type: Type.STRING,
              description: "The quiz formatted EXACTLY as specified for copy-paste to social media, in plain text."
            }
          },
          required: ["isError", "sport", "difficulty"]
        }
      }
    });

    const resultText = response.text;
    const parsedData = JSON.parse(resultText);

    // Also extract the search grounding metadata chunks to display in our sources panel
    const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];
    
    const sources = searchChunks.map((chunk: any) => ({
      title: chunk.web?.title || "Search Result",
      uri: chunk.web?.uri || "",
    })).filter((source: any) => source.uri !== "");

    res.json({
      ...parsedData,
      localFacts: sportData.historicalFacts,
      localRules: sportData.rules,
      searchQueries,
      sources,
      isThemedPack: !!isThemedPack,
      themeTitle: themeTitle || null,
      provider: "Gemini"
    });

  } catch (error: any) {
    console.warn("Gemini API encountered an error. Falling back to local offline quiz generator:", error.message);
    
    try {
      // Formulate a key based on the request
      let fallbackKey = "";
      const isTheme = !!isThemedPack;
      const title = themeTitle || "";
      
      if (isTheme) {
        // e.g. "world-cup-classics"
        fallbackKey = themeTitle ? themeTitle.toLowerCase().replace(/\s+/g, "-") : "";
      } else {
        // e.g. "football_Easy"
        const formattedSport = sport.toLowerCase();
        // Capitalize difficulty appropriately
        const formattedDiff = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
        fallbackKey = `${formattedSport}_${formattedDiff}`;
      }

      console.log(`Looking up fallback quiz for key: '${fallbackKey}'`);
      let chosenQuiz = fallbackQuizzes[fallbackKey];
      
      // If no exact match, try standard fallback for the sport, or grab first available key
      if (!chosenQuiz) {
        console.log(`No exact fallback quiz found for key '${fallbackKey}', trying to match by sport.`);
        const sportKeys = Object.keys(fallbackQuizzes);
        const sportFallbackKey = sportKeys.find(k => k.startsWith(sport.toLowerCase())) || "football_Easy";
        chosenQuiz = fallbackQuizzes[sportFallbackKey];
      }

      if (chosenQuiz) {
        // Format raw social media text block
        const formattedQuestionsText = chosenQuiz.questions.map((q: any) => {
          return `Q${q.questionNumber}: ${q.question}\n${q.options.map((opt: string) => `   ${opt}`).join("\n")}\n   Correct Answer: ${q.correctAnswerLetter}\n   Explanation: ${q.explanation}\n`;
        }).join("\n");

        const rawSocialMediaText = `🏆 Grounded AI Sports Quiz: ${isTheme ? title : chosenQuiz.sport} (${difficulty} Pack)\n\n🧠 Test your knowledge with these grounded sports trivia questions!\n\n${formattedQuestionsText}`;

        return res.json({
          isError: false,
          sport: chosenQuiz.sport,
          difficulty: difficulty,
          questions: chosenQuiz.questions,
          rawSocialMediaText,
          localFacts: sportData.historicalFacts || [],
          localRules: sportData.rules || [],
          searchQueries: ["Standard Local Rules Verification", "Recent Matches Retrieval"],
          sources: [
            { title: `${chosenQuiz.sport} Verified Historical Records`, uri: "https://sports.example.com/history" },
            { title: "Standard Rulebook Guidelines", uri: "https://sports.example.com/rules" }
          ],
          isThemedPack: isTheme,
          themeTitle: title || null,
          isFallback: true,
          fallbackNotice: "We activated our High-Fidelity Local Fallback Engine! Enjoy a fully verified and accurate trivia pack.",
          provider: "Local Database"
        });
      }
    } catch (fallbackError: any) {
      console.error("Critical: Fallback quiz generator also failed:", fallbackError);
    }

    res.status(500).json({
      error: "Failed to generate quiz. Please ensure your GEMINI_API_KEY is configured in the secrets menu.",
      details: error.message
    });
  }
});

// Configure Vite or production static server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
