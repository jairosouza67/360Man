import { WorkoutPlan } from './ai';

// Mapa de tradução para melhorar a busca no canal DeltaBolic (que é em inglês)
export const EXERCISE_TRANSLATIONS: Record<string, string> = {
    "Supino Reto": "Flat Bench Press",
    "Supino Reto com Halteres": "Dumbbell Bench Press",
    "Supino Reto Máquina": "Machine Chest Press",
    "Supino Inclinado": "Incline Bench Press",
    "Supino Inclinado com Halteres": "Incline Dumbbell Press",
    "Crucifixo": "Chest Fly",
    "Crucifixo na Polia": "Cable Fly",
    "Crucifixo Reto": "Dumbbell Fly",
    "Crossover Polia Alta": "High Cable Crossover",
    "Flexão de Braço": "Push Up",
    
    "Puxada Alta": "Lat Pulldown",
    "Puxada Alta Frente": "Lat Pulldown",
    "Puxada Triângulo": "V-Bar Lat Pulldown",
    "Remada Curvada": "Barbell Bent Over Row",
    "Remada Curvada Pegada Supinada": "Reverse Grip Bent Over Row",
    "Remada Unilateral (Serrote)": "One Arm Dumbbell Row",
    "Pulldown": "Straight Arm Pulldown",
    "Barra Fixa": "Pull Up",
    "Graviton": "Assisted Pull Up",
    "Hiperextensão Lombar": "Back Extension",
    
    "Desenvolvimento Militar": "Overhead Press",
    "Desenvolvimento com Halteres": "Dumbbell Shoulder Press",
    "Desenvolvimento Máquina": "Machine Shoulder Press",
    "Elevação Lateral": "Lateral Raise",
    "Elevação Frontal": "Front Raise",
    "Elevação Frontal Corda": "Cable Front Raise",
    "Crucifixo Inverso": "Reverse Pec Deck",
    "Face Pull": "Face Pull",
    "Encolhimento com Halteres": "Dumbbell Shrug",
    
    "Rosca Direta": "Barbell Curl",
    "Rosca Direta Halteres": "Dumbbell Curl",
    "Rosca Direta Barra W": "EZ Bar Curl",
    "Rosca Martelo": "Hammer Curl",
    "Rosca Scott": "Preacher Curl",
    
    "Tríceps Corda": "Tricep Rope Pushdown",
    "Tríceps Pulley": "Tricep Pushdown",
    "Tríceps Testa": "Skullcrushers",
    
    "Agachamento Livre": "Barbell Squat",
    "Agachamento Goblet": "Goblet Squat",
    "Leg Press": "Leg Press",
    "Leg Press 45": "Leg Press",
    "Cadeira Extensora": "Leg Extension",
    "Mesa Flexora": "Leg Curl",
    "Afundo com Halteres": "Dumbbell Lunges",
    "Levantamento Terra": "Deadlift",
    "Stiff": "Stiff Leg Deadlift",
    "Stiff com Halteres": "Dumbbell Stiff Leg Deadlift",
    "Panturrilha Sentado": "Seated Calf Raise",
    "Panturrilha em Pé": "Standing Calf Raise",
    
    "Abdominal Supra": "Crunch",
    "Prancha Abdominal": "Plank"
};

// IDs REAIS do canal DeltaBolic para garantir carregamento
export const DELTABOLIC_VIDEO_MAP: Record<string, string> = {
    // Peito
    "Supino Reto com Halteres": "VmB1G1K7v94",
    "Supino Inclinado com Halteres": "8iPEnn-ltC8",
    "Supino Reto": "rT7DgCr-3pg", 
    "Supino Inclinado": "SrqOu55lrYU",
    "Crucifixo Reto": "eozdVDA78K0",
    "Crucifixo na Polia": "Iwe6AmxVf7o",
    "Crossover Polia Alta": "taI4XduLpTk",
    "Flexão de Braço": "IODxDxX7oi4",

    // Costas
    "Puxada Alta": "CAwf7n6Luuc",
    "Puxada Alta Frente": "CAwf7n6Luuc",
    "Remada Curvada": "6FZHJGzMFEc",
    "Remada Unilateral (Serrote)": "pYcpY20QaE8",
    "Barra Fixa": "eGo4IYlbE5g",
    "Pulldown": "JGeRYez5zen",
    
    // Ombros
    "Desenvolvimento Militar": "QAQ64hK4Xxs",
    "Desenvolvimento com Halteres": "qEwKCR5JCog",
    "Elevação Lateral": "3VcKaXpzqRo",
    "Elevação Frontal": "-t7fuZ0KRCY",
    "Face Pull": "V8dZqdIdeCc",
    "Encolhimento com Halteres": "g6qqin4skUA",
    "Crucifixo Inverso": "n1e412yqPWA", // Reverse Pec Deck

    // Braços
    "Tríceps Corda": "6yHuuyj-Ex0",
    "Tríceps Testa": "d_KZxkY_0cM",
    "Tríceps Pulley": "2-LAMcpzODU",
    "Rosca Direta": "i1xrPS-lEkI",
    "Rosca Direta Halteres": "sAq_ocpRh_I",
    "Rosca Martelo": "zC3nLlEpq4w",
    "Rosca Scott": "fIWP8RFNCN8",

    // Pernas
    "Agachamento Livre": "UltWZb7TIx8",
    "Agachamento Goblet": "MeIiIdhvXT4",
    "Leg Press": "IZxyjW7MPJQ",
    "Leg Press 45": "IZxyjW7MPJQ",
    "Cadeira Extensora": "YyvSfVjQeL0",
    "Mesa Flexora": "ELOCsoDSmrg",
    "Afundo com Halteres": "D7KaRcUTQeE",
    "Levantamento Terra": "op9kVnSso6Q",
    "Stiff": "1Tq3QdYUuHs",
    "Stiff com Halteres": "1Tq3QdYUuHs", // Usando similar
    "Panturrilha Sentado": "JbyjNymZOt0",
    "Panturrilha em Pé": "ymkhMbO-u6k",

    // Abdomen
    "Abdominal Supra": "Xyd_fa5zoEU",
    "Prancha Abdominal": "pSHjTRVQxqk"
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
                        { name: "Supino Reto com Halteres", sets: 3, reps: "12-15", rest: "60s" },
                        { name: "Puxada Alta Frente", sets: 3, reps: "12-15", rest: "60s" },
                        { name: "Desenvolvimento com Halteres", sets: 3, reps: "12-15", rest: "60s" },
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
                        { name: "Agachamento Livre", sets: 3, reps: "12", rest: "90s" },
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
                        { name: "Levantamento Terra", sets: 3, reps: "10", rest: "90s" },
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
                        { name: "Supino Reto com Halteres", sets: 4, reps: "10-12", rest: "60s" },
                        { name: "Crucifixo Reto", sets: 3, reps: "12-15", rest: "60s" },
                        { name: "Crossover Polia Alta", sets: 3, reps: "15", rest: "45s", technique: "Drop-set" }
                    ]
                },
                {
                    dayName: "B - Costas",
                    exercises: [
                        { name: "Barra Fixa", sets: 4, reps: "Falha", rest: "90s" },
                        { name: "Remada Curvada", sets: 4, reps: "8-10", rest: "90s" },
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
    const levelData = WORKOUT_DATABASE[level];
    if (!levelData) return null;

    if (levelData[days]) return levelData[days];

    const availableDays = Object.keys(levelData);
    if (availableDays.length > 0) {
        return levelData[availableDays[0]];
    }

    return null;
};