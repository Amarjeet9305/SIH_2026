// src/lib/ai.ts

// Define the expected JSON structure from the AI model
interface AIResponse {
    is_valid_hazard: boolean;
    severity_score: number; // 1-10
    reasoning: string;
    keywords: string[];
    language: string;
    confidence: number;
}

// Enhanced multilingual keywords for hazard detection
const HAZARD_KEYWORDS = {
    en: ['tsunami', 'flood', 'wave', 'tide', 'erosion', 'storm', 'cyclone', 'hurricane', 'damage', 'danger', 'warning', 'evacuate', 'emergency'],
    hi: ['सुनामी', 'बाढ़', 'लहर', 'ज्वार', 'कटाव', 'तूफान', 'चक्रवात', 'खतरा', 'चेतावनी', 'आपातकाल'],
    ta: ['சுனாமி', 'வெள்ளம்', 'அலை', 'ஓதம்', 'அரிப்பு', 'புயல்', 'சூறாவளி', 'ஆபத்து', 'எச்சரிக்கை'],
    te: ['సునామి', 'వరద', 'అల', 'ఓడ', 'కోత', 'తుఫాను', 'చక్రవాతం', 'ప్రమాదం', 'హెచ్చరిక'],
    bn: ['সুনামি', 'বন্যা', 'তরঙ্গ', 'জোয়ার', 'ক্ষয়', 'ঝড়', 'ঘূর্ণিঝড়', 'বিপদ', 'সতর্কতা']
};

// We'll use a free, fast model for our analysis
const AI_MODEL = "mistralai/mistral-7b-instruct:free";

export async function analyzeReport(description: string | null, language: string = 'en'): Promise<AIResponse> {
    // If there's no description, we can't analyze. Return a default.
    if (!description || description.trim().length < 10) {
        return {
            is_valid_hazard: false,
            severity_score: 1,
            reasoning: "No description provided or description too short for analysis.",
            keywords: [],
            language: language,
            confidence: 0
        };
    }

    // Quick keyword-based analysis for immediate response
    const keywords = detectKeywords(description, language);
    const keywordSeverity = calculateKeywordSeverity(keywords, language);

    // This is the enhanced prompt with multilingual support
    const prompt = `
        You are a disaster management analyst for INCOIS (Indian National Centre for Ocean Information Services). 
        Analyze this ocean hazard report in ${language} language and return a structured JSON object.
        
        Report: "${description}"
        
        Analysis criteria:
        1. Determine if this is a valid ocean hazard (tsunami, flooding, high waves, coastal erosion, unusual tides, etc.)
        2. Assess severity: 1 (minor) to 10 (critical/emergency)
        3. Extract relevant keywords
        4. Identify the primary language used
        5. Provide confidence score (0-1)
        
        Consider these hazard types:
        - Tsunami sightings or warnings
        - Coastal flooding or inundation
        - High waves or swell surge
        - Coastal erosion or damage
        - Unusual tide behavior
        - Storm surge or cyclone impacts
        
        Response format (JSON only):
        {
          "is_valid_hazard": boolean,
          "severity_score": number,
          "reasoning": "Brief explanation in English",
          "keywords": ["extracted", "keywords"],
          "language": "detected_language_code",
          "confidence": number
        }
    `;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: AI_MODEL,
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.3, // Lower temperature for more consistent analysis
            })
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API failed with status: ${response.status}`);
        }

        const data = await response.json();
        const aiJson = JSON.parse(data.choices[0].message.content);

        // Validate and enhance the response
        const result: AIResponse = {
            is_valid_hazard: Boolean(aiJson.is_valid_hazard),
            severity_score: Math.max(1, Math.min(10, Number(aiJson.severity_score) || keywordSeverity)),
            reasoning: String(aiJson.reasoning || "AI analysis completed"),
            keywords: Array.isArray(aiJson.keywords) ? aiJson.keywords : keywords,
            language: String(aiJson.language || language),
            confidence: Math.max(0, Math.min(1, Number(aiJson.confidence) || 0.7))
        };
        
        return result;

    } catch (error) {
        console.error("Error analyzing report:", error);
        // Enhanced fallback with keyword analysis
        return {
            is_valid_hazard: keywordSeverity > 3,
            severity_score: keywordSeverity,
            reasoning: "AI analysis failed, using keyword-based assessment.",
            keywords: keywords,
            language: language,
            confidence: 0.5
        };
    }
}

function detectKeywords(text: string, language: string): string[] {
    const detectedKeywords: string[] = [];
    const textLower = text.toLowerCase();
    
    const keywords = HAZARD_KEYWORDS[language as keyof typeof HAZARD_KEYWORDS] || HAZARD_KEYWORDS.en;
    
    keywords.forEach(keyword => {
        if (textLower.includes(keyword.toLowerCase())) {
            detectedKeywords.push(keyword);
        }
    });
    
    return detectedKeywords;
}

function calculateKeywordSeverity(keywords: string[], _language: string): number {
    const highSeverityKeywords = ['tsunami', 'सुनामी', 'சுனாமி', 'సునామి', 'সুনামি', 'emergency', 'evacuate'];
    const mediumSeverityKeywords = ['flood', 'बाढ़', 'வெள்ளம்', 'వరద', 'বন্যা', 'storm', 'cyclone'];
    
    let severity = 1;
    
    keywords.forEach(keyword => {
        if (highSeverityKeywords.some(high => keyword.toLowerCase().includes(high))) {
            severity = Math.max(severity, 8);
        } else if (mediumSeverityKeywords.some(med => keyword.toLowerCase().includes(med))) {
            severity = Math.max(severity, 5);
        } else {
            severity = Math.max(severity, 3);
        }
    });
    
    return Math.min(severity, 10);
}

// New function for analyzing social media posts
export async function analyzeSocialPost(postContent: string, language: string = 'en'): Promise<{
    is_relevant: boolean;
    hazard_type: string | null;
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    keywords: string[];
}> {
    const keywords = detectKeywords(postContent, language);
    const keywordSeverity = calculateKeywordSeverity(keywords, language);
    
    return {
        is_relevant: keywordSeverity > 2,
        hazard_type: keywordSeverity > 5 ? 'high-waves' : keywordSeverity > 3 ? 'unusual-tide' : null,
        sentiment: keywordSeverity > 6 ? 'negative' : keywordSeverity > 3 ? 'neutral' : 'positive',
        confidence: Math.min(keywordSeverity / 10, 1),
        keywords: keywords
    };
}