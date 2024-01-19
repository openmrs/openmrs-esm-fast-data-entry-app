import { Concept, SpecificQuestion } from "../../types";

export const getSpecificQuestionsByForm = (
  specificQuestions: Array<SpecificQuestion>,
  formUuid: string
): Array<SpecificQuestion> =>
  specificQuestions.filter(({ forms }) => forms.includes(formUuid));

export const getConceptLabel = (
  concepts: Array<Concept>,
  uuid: string
): string =>
  concepts?.find(({ uuid: conceptUuid }) => conceptUuid === uuid)?.display ||
  "";

export const extractUUIDs = (
  specificQuestions: Array<SpecificQuestion>
): Array<string> =>
  specificQuestions?.flatMap(({ question, answers = [] }) => [
    question,
    ...answers,
  ]);
