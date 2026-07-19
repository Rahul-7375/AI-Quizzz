import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(express.json());
let openaiClient = null;
function getOpenAIClient() {
    if (!openaiClient) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (apiKey) {
            openaiClient = new OpenAI({ apiKey });
        }
    }
    return openaiClient;
}
let aiClient = null;
function getAiClient() {
    if (!aiClient) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY environment variable is required.");
        }
        aiClient = new GoogleGenAI({ apiKey });
    }
    return aiClient;
}
let historicalKnowledge = {};
try {
    const filePath = path.join(process.cwd(), "src/data/historical_sports_knowledge.json");
    if (fs.existsSync(filePath)) {
        historicalKnowledge = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
}
catch (err) {
    console.error("Error reading historical sports knowledge:", err);
}
let fallbackQuizzes = {};
try {
    const filePath = path.join(process.cwd(), "src/data/fallback_quizzes.json");
    if (fs.existsSync(filePath)) {
        fallbackQuizzes = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
}
catch (err) {
    console.error("Error reading fallback quizzes:", err);
}
app.post("/api/quiz/generate", async (req, res) => {
    const { sport, difficulty, isThemedPack, themeTitle, themeDescription, themeFocus, } = req.body;
    if (!sport || !difficulty) {
        return res
            .status(400)
            .json({ error: "Sport and difficulty are required." });
    }
    const sportKey = sport.toLowerCase().replace(/\s+/g, "");
    const sportData = historicalKnowledge[sportKey] || {
        sportName: sport,
        historicalFacts: [],
        rules: [],
    };
    const localFactsText = [
        `Sport Name: ${sportData.sportName}`,
        `Verified Historical Facts:\n${sportData.historicalFacts.map((f) => `- ${f}`).join("\n")}`,
        `Verified Standard Rules:\n${sportData.rules.map((r) => `- ${r}`).join("\n")}`,
    ].join("\n\n");
    let userPrompt = "";
    if (isThemedPack) {
        userPrompt = `You are an expert AI Sports Quiz Generation Agent.\nTheme: ${themeTitle}\nDescription: ${themeDescription}\nFocus: ${themeFocus}\nSport: ${sportData.sportName}\nDifficulty: ${difficulty}\n\nUse the following verified facts:\n${localFactsText}\n\nReturn JSON with isError, errorMessage, sport, difficulty, questions, rawSocialMediaText.`;
    }
    else {
        userPrompt = `You are an expert AI Sports Quiz Generation Agent.\nSport: ${sportData.sportName}\nDifficulty: ${difficulty}\n\nUse the following verified facts:\n${localFactsText}\n\nReturn JSON with isError, errorMessage, sport, difficulty, questions, rawSocialMediaText.`;
    }
    const openai = getOpenAIClient();
    if (openai) {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert AI Sports Quiz Generation Agent. Return JSON only.",
                    },
                    { role: "user", content: userPrompt },
                ],
                response_format: { type: "json_object" },
            });
            const resultText = completion.choices[0].message.content || "{}";
            const parsedData = JSON.parse(resultText);
            return res.json({
                ...parsedData,
                localFacts: sportData.historicalFacts,
                localRules: sportData.rules,
                provider: "OpenAI",
            });
        }
        catch (error) {
            console.warn("OpenAI failed, falling back:", error.message);
        }
    }
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: userPrompt,
            config: {
                responseMimeType: "application/json",
            },
        });
        const parsedData = JSON.parse(response.text);
        return res.json({
            ...parsedData,
            localFacts: sportData.historicalFacts,
            localRules: sportData.rules,
            provider: "Gemini",
        });
    }
    catch (error) {
        console.warn("Gemini failed, falling back to local data:", error.message);
        const fallbackKey = isThemedPack && themeTitle
            ? themeTitle.toLowerCase().replace(/\s+/g, "-")
            : `${sport.toLowerCase()}_${difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase()}`;
        const chosenQuiz = fallbackQuizzes[fallbackKey] || fallbackQuizzes["football_Easy"];
        if (chosenQuiz) {
            const formattedQuestionsText = chosenQuiz.questions
                .map((q) => {
                return `Q${q.questionNumber}: ${q.question}\n${q.options.map((opt) => `   ${opt}`).join("\n")}\n   Correct Answer: ${q.correctAnswerLetter}\n   Explanation: ${q.explanation}\n`;
            })
                .join("\n");
            const rawSocialMediaText = `🏆 Grounded AI Sports Quiz: ${chosenQuiz.sport} (${difficulty} Pack)\n\n🧠 ${formattedQuestionsText}`;
            return res.json({
                isError: false,
                sport: chosenQuiz.sport,
                difficulty,
                questions: chosenQuiz.questions,
                rawSocialMediaText,
                localFacts: sportData.historicalFacts || [],
                localRules: sportData.rules || [],
                provider: "Local Database",
            });
        }
        return res.status(500).json({ error: "Failed to generate quiz." });
    }
});
export const handler = async (event) => {
    const { httpMethod, path: reqPath, body, headers } = event;
    const req = {
        method: httpMethod,
        body: body ? JSON.parse(body) : {},
        headers,
    };
    const res = {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: "",
    };
    const expressReq = {
        ...req,
        body: req.body,
        method: req.method,
        path: reqPath.replace("/api", ""),
    };
    const expressRes = {
        statusCode: 200,
        setHeader(name, value) {
            res.headers[name] = value;
        },
        status(code) {
            res.statusCode = code;
            return this;
        },
        json(payload) {
            res.body = JSON.stringify(payload);
            return this;
        },
        send(payload) {
            res.body = payload;
            return this;
        },
    };
    const route = app._router.stack.find((layer) => layer.route && layer.route.path === "/quiz/generate");
    if (!route) {
        res.statusCode = 404;
        res.body = JSON.stringify({ error: "Not found" });
        return res;
    }
    await app.handle(expressReq, expressRes, () => { });
    return res;
};
