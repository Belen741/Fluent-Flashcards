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
    name: "Patient Admission",
    description: "Phrases for receiving and registering patients",
    icon: ClipboardList,
    color: "#18A874",
    hasContent: true,
  },
  {
    id: "m02",
    deckId: "mazo_02_sintomas",
    order: 2,
    name: "Symptoms and Pain",
    description: "Questions about symptoms and pain assessment",
    icon: HeartPulse,
    color: "#E74C3C",
    hasContent: true,
  },
  {
    id: "m03",
    deckId: "mazo_03_signos",
    order: 3,
    name: "Vital Signs",
    description: "Vocabulary for taking vital signs",
    icon: Activity,
    color: "#3498DB",
    hasContent: true,
  },
  {
    id: "m04",
    deckId: "mazo_04_medicamentos",
    order: 4,
    name: "Medications",
    description: "Instructions about medicines and dosages",
    icon: Pill,
    color: "#9B59B6",
    hasContent: true,
  },
  {
    id: "m05",
    deckId: "mazo_05_indicaciones",
    order: 5,
    name: "Basic Instructions",
    description: "Simple instructions for the patient",
    icon: MessageSquare,
    color: "#F39C12",
    hasContent: true,
  },
  {
    id: "m06",
    deckId: "mazo_06_procedimientos",
    order: 6,
    name: "Common Procedures",
    description: "Explaining basic medical procedures",
    icon: Stethoscope,
    color: "#1ABC9C",
    hasContent: true,
  },
  {
    id: "m07",
    deckId: "mazo_07_higiene",
    order: 7,
    name: "Hygiene and Personal Care",
    description: "Helping with patient hygiene and grooming",
    icon: ShowerHead,
    color: "#00BCD4",
    hasContent: true,
  },
  {
    id: "m08",
    deckId: "mazo_08_movilidad",
    order: 8,
    name: "Mobility and Fall Prevention",
    description: "Safe movement instructions",
    icon: PersonStanding,
    color: "#FF9800",
    hasContent: true,
  },
  {
    id: "m09",
    deckId: "mazo_09_alimentacion",
    order: 9,
    name: "Nutrition and Fasting",
    description: "Instructions about meals and restrictions",
    icon: UtensilsCrossed,
    color: "#8BC34A",
    hasContent: true,
  },
  {
    id: "m10",
    deckId: "mazo_10_empatia",
    order: 10,
    name: "Empathetic Communication",
    description: "Emotional support phrases",
    icon: Heart,
    color: "#E91E63",
    hasContent: true,
  },
  {
    id: "m11",
    deckId: "mazo_11_emergencias",
    order: 11,
    name: "Emergencies",
    description: "Vocabulary for urgent situations",
    icon: Siren,
    color: "#F44336",
    hasContent: true,
  },
  {
    id: "m12",
    deckId: "mazo_12_preoperatorio",
    order: 12,
    name: "Preoperative Instructions",
    description: "Preparing the patient for surgery",
    icon: ClipboardCheck,
    color: "#607D8B",
    hasContent: true,
  },
  {
    id: "m13",
    deckId: "mazo_13_postoperatorio",
    order: 13,
    name: "Postoperative Care",
    description: "Care after surgery",
    icon: Bandage,
    color: "#795548",
    hasContent: false,
  },
  {
    id: "m14",
    deckId: "mazo_14_alta",
    order: 14,
    name: "Discharge",
    description: "Hospital discharge instructions",
    icon: LogOut,
    color: "#4CAF50",
    hasContent: false,
  },
  {
    id: "m15",
    deckId: "mazo_15_familiares",
    order: 15,
    name: "Family Members and Caregivers",
    description: "Communication with patient's family",
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
