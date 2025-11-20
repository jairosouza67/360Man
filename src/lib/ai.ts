/**
 * AI Service Module - OpenRouter Integration
 * 
 * Features:
 * - Robust JSON parsing (handles markdown code blocks)
 * - Mock data fallback (works without API key)
 * - Type-safe interfaces
 */

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:3000';
const SITE_NAME = 'Respect Pill';

// Modelo gratuito e rápido para testes via OpenRouter
const AI_MODEL = "google/gemini-2.0-flash-lite-preview-02-05:free";

// --- Interfaces ---

export interface DietPlan {
    id: string;
    title: string;
    strategy: string;
    calories: number;
    macros: {
        protein: string;
        carbs: string;
        fats: string;
    };
    meals: {
        name: string;
        items: string[];
    }[];
    createdAt: string;
}

export interface WorkoutPlan {
    id: string;
    title: string;
    level: string;
    frequency: string;
    notes: string;
    schedule: {
        dayName: string;
        exercises: {
            name: string;
            sets: number;
            reps: string;
            rest: string;
            technique?: string;
        }[];
    }[];
    createdAt: string;
}

export interface FinancialAudit {
    score: number;
    wasteDetection: string[];
    burnRateAnalysis: string;
    strategy: string;
}

export interface RelationalAudit {
    healthScore: number;
    diagnosis: string;
    actionPlan: string[];
    goldenClause: string;
}

export interface CognitiveAnalysis {
    distortion: string;
    analysis: string;
    reframe: string;
    action: string;
}

// --- Mock Data Generators (Fallback) ---

const getMockDietPlan = (goal: string): DietPlan => ({
    id: Date.now().toString(),
    title: `Protocolo ${goal} (Simulação)`,
    strategy: "Estratégia baseada em déficit calórico moderado e alta densidade nutricional.",
    calories: 2400,
    macros: { protein: "200g", carbs: "250g", fats: "70g" },
    meals: [
        { name: "Desjejum", items: ["3 Ovos inteiros", "2 fatias de pão integral", "Café preto sem açúcar"] },
        { name: "Almoço", items: ["200g Peito de Frango grelhado", "150g Arroz Branco", "Brócolis e Cenoura à vontade"] },
        { name: "Lanche", items: ["1 scoop Whey Protein", "1 Banana", "30g Aveia"] },
        { name: "Jantar", items: ["200g Patinho Moído", "100g Batata Doce", "Salada de folhas verdes"] }
    ],
    createdAt: new Date().toISOString()
});

const getMockWorkoutPlan = (level: string): WorkoutPlan => ({
    id: Date.now().toString(),
    title: `Protocolo Híbrido ${level} (Simulação)`,
    level: level,
    frequency: "4x/semana",
    notes: "Foco total na fase excêntrica do movimento. Controle a carga.",
    schedule: [
        {
            dayName: "Dia 1 - Empurrar (Push)",
            exercises: [
                { name: "Supino Inclinado Halteres", sets: 4, reps: "8-12", rest: "90s", technique: "Pausa de 1s embaixo" },
                { name: "Desenvolvimento Militar", sets: 3, reps: "10-12", rest: "60s" },
                { name: "Elevação Lateral", sets: 4, reps: "15", rest: "45s", technique: "Drop-set na última" },
                { name: "Tríceps Corda", sets: 3, reps: "12-15", rest: "60s" }
            ]
        },
        {
            dayName: "Dia 2 - Puxar (Pull)",
            exercises: [
                { name: "Puxada Alta", sets: 4, reps: "10-12", rest: "90s" },
                { name: "Remada Curvada", sets: 3, reps: "8-10", rest: "90s" },
                { name: "Crucifixo Inverso", sets: 3, reps: "15", rest: "60s" },
                { name: "Rosca Direta", sets: 3, reps: "12", rest: "60s" }
            ]
        }
    ],
    createdAt: new Date().toISOString()
});

const getMockFinancialAudit = (): FinancialAudit => ({
    score: 65,
    wasteDetection: ["Assinaturas de streaming não utilizadas", "Pedidos frequentes de delivery", "Taxas bancárias evitáveis"],
    burnRateAnalysis: "Seu fluxo de caixa está positivo, mas a margem é estreita. 20% da renda está indo para gastos supérfluos não rastreados.",
    strategy: "Implementar regra dos 50/30/20 imediatamente. Cortar 2 assinaturas e cozinhar em casa durante a semana para liberar R$ 400,00 mensais para investimento."
});

const getMockRelationalAudit = (): RelationalAudit => ({
    healthScore: 72,
    diagnosis: "A dinâmica apresenta boa base de amizade, mas a polaridade sexual está diminuindo devido à rotina excessivamente doméstica e falta de mistério.",
    actionPlan: ["Restabelecer a noite do encontro semanal (sem celulares)", "Praticar escuta ativa por 10min diários", "Iniciar um hobby individual para gerar novidade"],
    goldenClause: "Nenhuma crítica será feita sem antes oferecer uma validação genuína. Proibido resolver conflitos via texto."
});

const getMockCognitiveAnalysis = (): CognitiveAnalysis => ({
    distortion: "Leitura Mental / Catastrofização",
    analysis: "Você está assumindo que sabe o que os outros estão pensando e prevendo o pior cenário possível sem evidências concretas.",
    reframe: "Não tenho como saber o que pensam a menos que pergunte. O fato de não ter recebido resposta ainda não significa rejeição, apenas que estão ocupados.",
    action: "Focar no que posso controlar: minha própria performance e atitude. Aguardar 24h antes de tirar qualquer conclusão."
});

// --- Helper: Clean JSON ---

function cleanAndParseJSON(content: string): any {
    try {
        // Remove markdown code blocks if present
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/);
        const cleanContent = jsonMatch ? jsonMatch[1] : content;
        return JSON.parse(cleanContent);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        console.log("Raw Content:", content);
        return null;
    }
}

// --- Core Function ---

async function callOpenRouter(systemPrompt: string, userPrompt: string): Promise<any> {
    if (!OPENROUTER_API_KEY) {
        console.warn("VITE_OPENROUTER_API_KEY não encontrada. Usando Mock Data.");
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        return null;
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": SITE_URL,
                "X-Title": SITE_NAME,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": AI_MODEL,
                "messages": [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": userPrompt }
                ],
                "temperature": 0.7,
                "max_tokens": 2000
            })
        });

        if (!response.ok) {
            console.error(`OpenRouter API Error: ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) return null;

        return cleanAndParseJSON(content);

    } catch (error) {
        console.error("Erro na chamada AI:", error);
        return null;
    }
}

// --- Tool Functions ---

export async function generateDietPlan(weight: string, height: string, goal: string, meals: string, preferences: string): Promise<DietPlan | null> {
    const systemPrompt = `
    Você é um nutricionista esportivo de elite.
    Gere um plano de dieta em JSON estrito (sem texto extra) com a seguinte estrutura:
    {
        "title": "Nome do Protocolo (ex: Protocolo Metabólico Agressivo)",
        "strategy": "Resumo da estratégia em 1 frase",
        "calories": number,
        "macros": { "protein": "Xg", "carbs": "Xg", "fats": "Xg" },
        "meals": [
            { "name": "Nome da Refeição", "items": ["item 1", "item 2"] }
        ]
    }
    `;
    const userPrompt = `Perfil: ${weight}kg, ${height}cm. Objetivo: ${goal}. Refeições/dia: ${meals}. Preferências: ${preferences}`;

    const data = await callOpenRouter(systemPrompt, userPrompt);

    if (!data) return getMockDietPlan(goal);

    return { id: Date.now().toString(), createdAt: new Date().toISOString(), ...data };
}

export async function generateWorkoutPlan(level: string, days: string): Promise<WorkoutPlan | null> {
    const systemPrompt = `
    Você é um treinador de força de elite. Crie um treino periodizado em JSON estrito (sem texto extra):
    {
        "title": "Nome do Treino (ex: Protocolo Híbrido 8-Core)",
        "level": "${level}",
        "frequency": "${days}x/semana",
        "notes": "Dica tática curta",
        "schedule": [
            {
                "dayName": "Dia X - Foco",
                "exercises": [
                    { "name": "Nome", "sets": number, "reps": "string", "rest": "string", "technique": "string (opcional)" }
                ]
            }
        ]
    }
    `;
    const userPrompt = `Nível: ${level}. Frequência: ${days} dias por semana. Foco: Hipertrofia e Força Funcional.`;

    const data = await callOpenRouter(systemPrompt, userPrompt);

    if (!data) return getMockWorkoutPlan(level);

    return { id: Date.now().toString(), createdAt: new Date().toISOString(), ...data };
}

export async function generateFinancialAudit(transactions: any[], goal: string): Promise<FinancialAudit | null> {
    const systemPrompt = `
    Você é um CFO implacável. Analise as finanças e retorne JSON estrito (sem texto extra):
    {
        "score": number (0-100),
        "wasteDetection": ["item 1", "item 2"],
        "burnRateAnalysis": "Análise curta e direta sobre o fluxo de caixa",
        "strategy": "Uma ação tática imediata para atingir o objetivo"
    }
    `;
    const userPrompt = `Transações: ${JSON.stringify(transactions)}. Objetivo: ${goal}`;

    const data = await callOpenRouter(systemPrompt, userPrompt);

    if (!data) return getMockFinancialAudit();

    return data;
}

export async function generateRelationshipAudit(comm: number, intimacy: number, vision: number, friction: string, gratitude: string): Promise<RelationalAudit | null> {
    const systemPrompt = `
    Você é um terapeuta de casais focado em dinâmica evolutiva. Retorne JSON estrito (sem texto extra):
    {
        "healthScore": number (0-100),
        "diagnosis": "Análise brutalmente honesta da dinâmica",
        "actionPlan": ["Passo 1", "Passo 2", "Passo 3"],
        "goldenClause": "Uma regra inegociável para os próximos 15 dias"
    }
    `;
    const userPrompt = `Comunicação: ${comm}/10, Intimidade: ${intimacy}/10, Visão: ${vision}/10. Atrito: ${friction}. Gratidão: ${gratitude}`;

    const data = await callOpenRouter(systemPrompt, userPrompt);

    if (!data) return getMockRelationalAudit();

    return data;
}

export async function analyzeThought(situation: string, thought: string): Promise<CognitiveAnalysis | null> {
    const systemPrompt = `
    Você é um especialista em TCC e Estoicismo. Analise o pensamento, identifique distorções e reestruture. JSON estrito (sem texto extra):
    {
        "distortion": "Nome da distorção cognitiva (ex: Catastrofização)",
        "analysis": "Explicação lógica do erro",
        "reframe": "A verdade estoica/objetiva sobre a situação",
        "action": "Uma ação física imediata para quebrar o padrão"
    }
    `;
    const userPrompt = `Situação: ${situation}. Pensamento Automático: ${thought}`;

    const data = await callOpenRouter(systemPrompt, userPrompt);

    if (!data) return getMockCognitiveAnalysis();

    return data;
}

export async function findExerciseVideo(_exerciseName: string): Promise<string | null> {
    // Mock implementation since we don't have YouTube API key
    // Returning null triggers the manual search fallback in the UI, which is safer/better UX than a broken video
    return null;
}

// Placeholder for legacy function support if needed
export async function generate90DayPlan(_profile: any) {
    return [];
}