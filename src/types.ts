export interface Concept {
  uuid: string;
  display: string;
}

export interface SpecificQuestion {
  forms: Array<string>;
  questionId: string;
  question: string;
  answers?: Array<string>;
}
