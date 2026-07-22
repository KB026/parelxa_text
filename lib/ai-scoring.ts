import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const subScore = {
    type: "object",
    properties: {
        score: { type: "number", description: "0-10" },
        reason: {
            type: "string",
            description:
                "one short sentence, plain language, written TO the vendor (e.g. 'Your description doesn't explain who this tool is for')",
        },
    },
    required: ["score", "reason"],
};

const scoreSchema = {
    type: "object",
    properties: {
        clarity: subScore, // does the description explain the problem + who it's for
        credibility: subScore, // does this read as a real, professional business
        visual: subScore, // UI/UX quality from the screenshot, if provided
    },
    required: ["clarity", "credibility", "visual"],
};

type SubScore = { score: number; reason: string };

export type AiScoreResult = {
    ai_score: number;
    ai_scores: {
        clarity: SubScore;
        credibility: SubScore;
        visual: SubScore;
    };
};

export async function scoreToolWithAI(agent: {
    summary: string | null;
    website: string | null;
    screenshots: string[] | null;
}): Promise<AiScoreResult> {
    const hasScreenshot = !!(agent.screenshots && agent.screenshots.length > 0);

    // Don't burn a Gemini call scoring nothing.
    if (!agent.summary) {
        return {
            ai_score: 0,
            ai_scores: {
                clarity: { score: 0, reason: "No description was provided." },
                credibility: { score: 0, reason: "No description was provided." },
                visual: { score: 5, reason: "No screenshot provided." },
            },
        };
    }

    const promptParts: any[] = [
        {
            text: `You're reviewing a tool submitted to a B2B AI marketplace. Score it on
3 dimensions, 0-10 each. Write each reason as a short sentence spoken directly
TO THE VENDOR, plain language, specific enough that they know what to fix.

1. clarity — does the description clearly explain the problem it solves and
   who it's for? Vague/generic descriptions score low.
2. credibility — does this read as a real, professional business (clear
   website, coherent description, not spammy)?
3. visual — UI/UX quality from the screenshot. If no screenshot is provided,
   score this 5 (neutral, not penalized) and say
   "No screenshot provided — add one for a visual quality review."

Tool description: ${agent.summary}
Website: ${agent.website || "(none provided)"}`,
        },
    ];

    if (hasScreenshot) {
        try {
            const imgRes = await fetch(agent.screenshots![0]);
            if (imgRes.ok) {
                const buf = Buffer.from(await imgRes.arrayBuffer());
                promptParts.push({
                    inlineData: { mimeType: "image/png", data: buf.toString("base64") },
                });
            }
            // if the fetch fails (broken URL, etc.) we silently continue text-only —
            // the prompt's own "if no screenshot" instruction still applies to Gemini's
            // reasoning since it only received text parts.
        } catch {
            // network hiccup fetching the screenshot — fall back to text-only scoring
        }
    }

    const result = await genai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: promptParts }],
        config: {
            responseMimeType: "application/json",
            responseSchema: scoreSchema,
        },
    });

    const parsed = JSON.parse(result.text || '{}');
    const clamp = (n: number) => Math.max(0, Math.min(10, Number(n) || 0));

    const scores = {
        clarity: { score: clamp(parsed.clarity.score), reason: parsed.clarity.reason },
        credibility: { score: clamp(parsed.credibility.score), reason: parsed.credibility.reason },
        visual: { score: clamp(parsed.visual.score), reason: parsed.visual.reason },
    };

    const avg = (scores.clarity.score + scores.credibility.score + scores.visual.score) / 3;

    return {
        ai_score: Math.round(avg * 10) / 10,
        ai_scores: scores,
    };
}