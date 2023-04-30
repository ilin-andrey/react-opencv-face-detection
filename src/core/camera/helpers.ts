// inspired by https://unpkg.com/browse/scandit-sdk@4.6.1/src/lib/cameraAccess.ts
const backCameraKeywords: string[] = [
  "rear",
  "back",
  "rück",
  "arrière",
  "trasera",
  "trás",
  "traseira",
  "posteriore",
  "后面",
  "後面",
  "背面",
  "后置", // alternative
  "後置", // alternative
  "背置", // alternative
  "задней",
  "الخلفية",
  "후",
  "arka",
  "achterzijde",
  "หลัง",
  "baksidan",
  "bagside",
  "sau",
  "bak",
  "tylny",
  "takakamera",
  "belakang",
  "אחורית",
  "πίσω",
  "spate",
  "hátsó",
  "zadní",
  "darrere",
  "zadná",
  "задня",
  "stražnja",
  "belakang",
  "बैक",
];

export function isBackCameraLabel(label: string): boolean {
  const lowercaseLabel = label.toLowerCase();

  return backCameraKeywords.some((keyword) => lowercaseLabel.includes(keyword));
}
