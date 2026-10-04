import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
import path from "node:path";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    return;
  }
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.log("GEMINI_KEY_STATUS: missing");
  process.exit(1);
} else {
  console.log("GEMINI_KEY_STATUS: set");
}

const primaryModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const fallbackModel = process.env.GEMINI_MODEL_FALLBACK || "gemini-3.5-flash-lite";

async function testCall() {
  const ai = new GoogleGenAI({ apiKey });
  try {
    const res = await ai.models.generateContent({
      model: primaryModel,
      contents: "Respond with the single word: OK",
    });
    if (res.text) {
      console.log(`GEMINI_CALL_RESULT: SUCCESS (model: ${primaryModel})`);
      process.exit(0);
    }
  } catch (err) {
    const errMsg = err?.message || String(err);
    // Check if error is not-found or quota, attempt fallback
    console.log(`Primary model (${primaryModel}) encountered issue: ${errMsg.split("\n")[0].slice(0, 80)}`);
    try {
      // Attempt fallback
      const resFallback = await ai.models.generateContent({
        model: fallbackModel,
        contents: "Respond with the single word: OK",
      });
      if (resFallback.text) {
        console.log(`GEMINI_CALL_RESULT: SUCCESS (fallback model: ${fallbackModel})`);
        process.exit(0);
      }
    } catch (fallbackErr) {
      const fbMsg = fallbackErr?.message || String(fallbackErr);
      console.log(`GEMINI_CALL_RESULT: FAILED (${fbMsg.split("\n")[0].slice(0, 80)})`);
      process.exit(1);
    }
  }
}

testCall();
