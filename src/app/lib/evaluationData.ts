export type QType = "input" | "dropdown" | "likert" | "checkbox";

export type Question = {
  id: string;
  type: QType;
  text: string;
  options?: string[];
  scale?: number;
};

export const dummyEvaluation = {
  id: "eval_demo_1",
  title: "Sample Course Evaluation",
  description: "This is a sample evaluation form with various question types.",
  questions: [
    { id: "q1", type: "input", text: "What is your name?" },
    { id: "q2", type: "dropdown", text: "Which section are you in?", options: ["A", "B", "C"] },
    { id: "q3", type: "likert", text: "Rate the course materials:", scale: 5 },
    { id: "q4", type: "checkbox", text: "Which tools did you use?", options: ["Zoom", "Moodle", "Slack"] },
  ] as Question[],
};

export default dummyEvaluation;
