import { WorkoutPlan } from './ai';

// Mapeamento de IDs de vídeos do DeltaBolic (Exemplos para demonstração)
// Para um sistema completo, seria ideal preencher isso com os IDs reais de todos os exercícios
export const DELTABOLIC_VIDEO_MAP: Record<string, string> = {
    "Supino Reto com Halteres": "VmB1G1K7v94", // Exemplo (ID real precisaria ser buscado)
    "Supino Inclinado com Halteres": "0G2_Hj5qj8E",
    "Crucifixo": "eozdVDA78K0",
    "Elevação Lateral": "3VcKaXpzqRo",
    "Tríceps Corda": "6yHuuyj-Ex0",
    "Puxada Alta": "CAwf7n6Luuc",
    "Remada Curvada": "G8x-_ac_keo",
    "Agachamento Livre": "UltWZb7TIx8",
    "Leg Press": "IZxyjW7MPJQ",
    "Cadeira Extensora": "YyvSfVjQeL0",
    "Stiff": "1Tq3QdYUuHs",
    "Rosca Direta": "i1xrPS-lEkI",
    "Rosca Martelo": "zC3nLlEpq4w",
    "Desenvolvimento Militar": "QAQ64hK4Xxs"
};

export const WORKOUT_DATABASE: Record<string, Record<string, WorkoutPlan>> = {
    "Iniciante": {
        "2": {
            id: "adaptacao-ab",
            title: "Adaptação Muscular (AB)",
            level: "Iniciante",
            frequency: "2x/semana",
            notes: "Foco em aprender o movimento. Cargas leves, amplitude máxima.",
            createdAt: new Date().toISOString(),
            schedule: [
                {
                    dayName: "Treino A - Superiores",
                    exercises: [
                        { name: "Supino Reto Máquina ou Halteres", sets: 3, reps: "12-15", rest: "60s" },
                        { name: "Puxada Alta Frente", sets: 3, reps: "12-15", rest: "60s" },
                        { name: "Desenvolvimento Máquina", sets: 3, reps: "12-15", rest: "60s" },
                        { name: "Rosca Direta Halteres", sets: 3, reps: "12-15", rest: "60s" },
                        { name: "Tríceps Pulley", sets: 3, reps: "12-15", rest: "60s" },
                        { name: "Abdominal Supra", sets: 3, reps: "15-20", rest: "45s" }
                    ]
                },
                {
                    dayName: "Treino B - Inferiores",
                    exercises: [
                        { name: "Leg Press 45", sets: 3, reps: "12-15", rest: "90s" },
                        { name: "Cadeira Extensora", sets: 3, reps: "12-15", rest: "60s" },
                        { name: "Mesa Flexora", sets: 3, reps: "12-15", rest: "60s" },
                        { name: "Panturrilha Sentado", sets: 3, reps: "15-20", rest: "45s" },
                        { name: "Prancha Abdominal", sets: 3, reps: "30-45s", rest: "60s" }
                    ]
                }
            ]
        },
        "3": {
            id: "adaptacao-fullbody",
            title: "Adaptação Full Body",
            level: "Iniciante",
            frequency: "3x/semana",
            notes: "Treino de corpo inteiro para adaptação neural e metabólica.",
            createdAt: new Date().toISOString(),
            schedule: [
                {
                    dayName: "Dia 1 - Full Body A",
                    exercises: [
                        { name: "Agachamento Livre (ou Goblet)", sets: 3, reps: "12", rest: "90s" },
                        { name: "Supino Reto", sets: 3, reps: "12", rest: "60s" },
                        { name: "Remada Curvada", sets: 3, reps: "12", rest: "60s" },
                        { name: "Desenvolvimento Militar", sets: 2, reps: "12", rest: "60s" }
                    ]
                },
                {
                    dayName: "Dia 2 - Full Body B",
                    exercises: [
                        { name: "Leg Press", sets: 3, reps: "12", rest: "90s" },
                        { name: "Puxada Alta", sets: 3, reps: "12", rest: "60s" },
                        { name: "Flexão de Braço", sets: 3, reps: "Max", rest: "60s" },
                        { name: "Elevação Lateral", sets: 2, reps: "15", rest: "45s" }
                    ]
                },
                {
                    dayName: "Dia 3 - Full Body C",
                    exercises: [
                        { name: "Levantamento Terra (ou Stiff)", sets: 3, reps: "10", rest: "90s" },
                        { name: "Supino Inclinado", sets: 3, reps: "12", rest: "60s" },
                        { name: "Rosca Direta", sets: 2, reps: "15", rest: "45s" },
                        { name: "Tríceps Corda", sets: 2, reps: "15", rest: "45s" }
                    ]
                }
            ]
        }
    },
    "Intermediário": {
        "4": {
            id: "abcd-intermediario",
            title: "Divisão ABCD (4x)",
            level: "Intermediário",
            frequency: "4x/semana",
            notes: "Intensidade moderada a alta. Foco na falha concêntrica.",
            createdAt: new Date().toISOString(),
            schedule: [
                {
                    dayName: "A - Peito e Tríceps",
                    exercises: [
                        { name: "Supino Reto com Halteres", sets: 4, reps: "8-12", rest: "90s" },
                        { name: "Supino Inclinado com Halteres", sets: 3, reps: "10-12", rest: "60s" },
                        { name: "Crucifixo na Polia", sets: 3, reps: "12-15", rest: "60s" },
                        { name: "Tríceps Corda", sets: 4, reps: "12-15", rest: "45s" },
                        { name: "Tríceps Testa", sets: 3, reps: "10-12", rest: "60s" }
                    ]
                },
                {
                    dayName: "B - Costas e Bíceps",
                    exercises: [
                        { name: "Puxada Alta Frente", sets: 4, reps: "8-12", rest: "90s" },
                        { name: "Remada Curvada", sets: 4, reps: "8-10", rest: "90s" },
                        { name: "Pulldown", sets: 3, reps: "12-15", rest: "60s" },
                        { name: "Rosca Direta", sets: 3, reps: "10-12", rest: "60s" },
                        { name: "Rosca Martelo", sets: 3, reps: "12", rest: "60s" }
                    ]
                },
                {
                    dayName: "C - Pernas Completo",
                    exercises: [
                        { name: "Agachamento Livre", sets: 4, reps: "8-10", rest: "120s" },
                        { name: "Leg Press 45", sets: 4, reps: "10-12", rest: "90s" },
                        { name: "Cadeira Extensora", sets: 3, reps: "12-15", rest: "60s" },
                        { name: "Mesa Flexora", sets: 4, reps: "12", rest: "60s" },
                        { name: "Panturrilha em Pé", sets: 4, reps: "15-20", rest: "45s" }
                    ]
                },
                {
                    dayName: "D - Ombros e Trapézio",
                    exercises: [
                        { name: "Desenvolvimento Militar", sets: 4, reps: "8-12", rest: "90s" },
                        { name: "Elevação Lateral", sets: 4, reps: "12-15", rest: "45s" },
                        { name: "Crucifixo Inverso", sets: 3, reps: "12-15", rest: "45s" },
                        { name: "Encolhimento com Halteres", sets: 4, reps: "12-15", rest: "60s" }
                    ]
                }
            ]
        }
    },
    "Avançado": {
        "5": {
            id: "abcde-avancado",
            title: "Divisão ABCDE (5x)",
            level: "Avançado",
            frequency: "5x/semana",
            notes: "Volume alto por grupo muscular. Recuperação é chave.",
            createdAt: new Date().toISOString(),
            schedule: [
                {
                    dayName: "A - Peito",
                    exercises: [
                        { name: "Supino Inclinado com Halteres", sets: 4, reps: "8-10", rest: "90s" },
                        { name: "Supino Reto Máquina", sets: 4, reps: "10-12", rest: "60s" },
                        { name: "Crucifixo Reto", sets: 3, reps: "12-15", rest: "60s" },
                        { name: "Crossover Polia Alta", sets: 3, reps: "15", rest: "45s", technique: "Drop-set" }
                    ]
                },
                {
                    dayName: "B - Costas",
                    exercises: [
                        { name: "Barra Fixa (ou Graviton)", sets: 4, reps: "Falha", rest: "90s" },
                        { name: "Remada Curvada Pegada Supinada", sets: 4, reps: "8-10", rest: "90s" },
                        { name: "Remada Unilateral (Serrote)", sets: 3, reps: "10-12", rest: "60s" },
                        { name: "Puxada Triângulo", sets: 3, reps: "12", rest: "60s" },
                        { name: "Hiperextensão Lombar", sets: 3, reps: "15", rest: "60s" }
                    ]
                },
                {
                    dayName: "C - Pernas (Foco Quadríceps)",
                    exercises: [
                        { name: "Agachamento Livre", sets: 4, reps: "6-8", rest: "120s" },
                        { name: "Leg Press 45", sets: 4, reps: "10-12", rest: "90s" },
                        { name: "Afundo com Halteres", sets: 3, reps: "12", rest: "60s" },
                        { name: "Cadeira Extensora", sets: 4, reps: "15", rest: "45s", technique: "Isometria 2s" }
                    ]
                },
                {
                    dayName: "D - Ombros",
                    exercises: [
                        { name: "Desenvolvimento com Halteres", sets: 4, reps: "8-10", rest: "90s" },
                        { name: "Elevação Lateral", sets: 5, reps: "12-15", rest: "45s" },
                        { name: "Elevação Frontal Corda", sets: 3, reps: "12", rest: "60s" },
                        { name: "Face Pull", sets: 4, reps: "15", rest: "60s" }
                    ]
                },
                {
                    dayName: "E - Braços e Posterior",
                    exercises: [
                        { name: "Rosca Direta Barra W", sets: 4, reps: "10", rest: "60s" },
                        { name: "Tríceps Testa", sets: 4, reps: "10", rest: "60s" },
                        { name: "Rosca Scott", sets: 3, reps: "12", rest: "45s" },
                        { name: "Tríceps Corda", sets: 3, reps: "12", rest: "45s" },
                        { name: "Mesa Flexora", sets: 4, reps: "12", rest: "60s" },
                        { name: "Stiff com Halteres", sets: 3, reps: "10-12", rest: "90s" }
                    ]
                }
            ]
        }
    }
};

export const getPredefinedWorkout = (level: string, days: string): WorkoutPlan | null => {
    // Fallback logic to find the closest match if exact match doesn't exist
    const levelData = WORKOUT_DATABASE[level];
    if (!levelData) return null;

    if (levelData[days]) return levelData[days];

    // If requested days not found, return the closest one
    const availableDays = Object.keys(levelData);
    if (availableDays.length > 0) {
        return levelData[availableDays[0]];
    }

    return null;
};