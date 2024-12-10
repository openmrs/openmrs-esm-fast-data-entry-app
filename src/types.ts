export interface Concept {
  uuid: string;
  display: string;
}

export interface SpecificQuestion {
  question: {
    id: string;
    display: string;
    defaultAnswer?: string;
    disabled?: boolean;
  };
  answers: Array<{
    value: string;
    display: string;
  }>;
}

export interface SpecificQuestionConfig {
  forms: Array<string>;
  questionId: string;
  answers?: Array<string>;
  defaultAnswer?: string;
  disabled?: boolean;
}
