import { 
  ClipboardList, 
  HeartPulse, 
  Activity, 
  Pill, 
  MessageSquare, 
  Stethoscope,
  ShowerHead,
  PersonStanding,
  UtensilsCrossed,
  Heart,
  Siren,
  ClipboardCheck,
  Bandage,
  LogOut,
  Users,
  type LucideIcon
} from "lucide-react";

export interface Module {
  id: string;
  deckId: string;
  order: number;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  hasContent: boolean;
}

export const modules: Module[] = [
  {
    id: "m01",
    deckId: "mazo_01_admision",
    order: 1,
    name: "Admisión del paciente",
    description: "Frases para recibir y registrar pacientes",
    icon: ClipboardList,
    color: "#18A874",
    hasContent: true,
  },
  {
    id: "m02",
    deckId: "mazo_02_sintomas",
    order: 2,
    name: "Síntomas y dolor",
    description: "Preguntas sobre síntomas y evaluación del dolor",
    icon: HeartPulse,
    color: "#E74C3C",
    hasContent: true,
  },
  {
    id: "m03",
    deckId: "mazo_03_signos",
    order: 3,
    name: "Signos vitales",
    description: "Vocabulario para tomar signos vitales",
    icon: Activity,
    color: "#3498DB",
    hasContent: false,
  },
  {
    id: "m04",
    deckId: "mazo_04_medicamentos",
    order: 4,
    name: "Medicamentos",
    description: "Instrucciones sobre medicinas y dosis",
    icon: Pill,
    color: "#9B59B6",
    hasContent: false,
  },
  {
    id: "m05",
    deckId: "mazo_05_indicaciones",
    order: 5,
    name: "Indicaciones básicas",
    description: "Instrucciones simples para el paciente",
    icon: MessageSquare,
    color: "#F39C12",
    hasContent: false,
  },
  {
    id: "m06",
    deckId: "mazo_06_procedimientos",
    order: 6,
    name: "Procedimientos comunes",
    description: "Explicar procedimientos médicos básicos",
    icon: Stethoscope,
    color: "#1ABC9C",
    hasContent: false,
  },
  {
    id: "m07",
    deckId: "mazo_07_higiene",
    order: 7,
    name: "Higiene y cuidado personal",
    description: "Ayudar con higiene y aseo del paciente",
    icon: ShowerHead,
    color: "#00BCD4",
    hasContent: false,
  },
  {
    id: "m08",
    deckId: "mazo_08_movilidad",
    order: 8,
    name: "Movilidad y prevención de caídas",
    description: "Instrucciones de movimiento seguro",
    icon: PersonStanding,
    color: "#FF9800",
    hasContent: false,
  },
  {
    id: "m09",
    deckId: "mazo_09_alimentacion",
    order: 9,
    name: "Alimentación y ayuno",
    description: "Indicaciones sobre comidas y restricciones",
    icon: UtensilsCrossed,
    color: "#8BC34A",
    hasContent: false,
  },
  {
    id: "m10",
    deckId: "mazo_10_empatia",
    order: 10,
    name: "Comunicación empática",
    description: "Frases de apoyo emocional",
    icon: Heart,
    color: "#E91E63",
    hasContent: false,
  },
  {
    id: "m11",
    deckId: "mazo_11_emergencias",
    order: 11,
    name: "Emergencias",
    description: "Vocabulario para situaciones urgentes",
    icon: Siren,
    color: "#F44336",
    hasContent: false,
  },
  {
    id: "m12",
    deckId: "mazo_12_preoperatorio",
    order: 12,
    name: "Instrucciones preoperatorias",
    description: "Preparar al paciente para cirugía",
    icon: ClipboardCheck,
    color: "#607D8B",
    hasContent: false,
  },
  {
    id: "m13",
    deckId: "mazo_13_postoperatorio",
    order: 13,
    name: "Cuidados postoperatorios",
    description: "Atención después de cirugía",
    icon: Bandage,
    color: "#795548",
    hasContent: false,
  },
  {
    id: "m14",
    deckId: "mazo_14_alta",
    order: 14,
    name: "Alta médica",
    description: "Instrucciones de salida del hospital",
    icon: LogOut,
    color: "#4CAF50",
    hasContent: false,
  },
  {
    id: "m15",
    deckId: "mazo_15_familiares",
    order: 15,
    name: "Familiares y acompañantes",
    description: "Comunicación con familia del paciente",
    icon: Users,
    color: "#673AB7",
    hasContent: false,
  },
];

export function getModuleById(id: string): Module | undefined {
  return modules.find((m) => m.id === id);
}

export function getModuleByDeckId(deckId: string): Module | undefined {
  return modules.find((m) => m.deckId === deckId);
}

export function getModuleByOrder(order: number): Module | undefined {
  return modules.find((m) => m.order === order);
}
