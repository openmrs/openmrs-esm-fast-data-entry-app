import {
  type FetchResponse,
  openmrsFetch,
  restBaseUrl,
} from "@openmrs/esm-framework";
import useSWR from "swr";
import { type SpecificQuestion, type SpecificQuestionConfig } from "../types";
import { useMemo } from "react";

const formUrl = `${restBaseUrl}/o3/forms`;

export const useSpecificQuestions = (
  formUuid: string,
  specificQuestionConfig: Array<SpecificQuestionConfig>
) => {
  const specificQuestionsToLoad = useMemo(
    () => getQuestionIdsByFormId(formUuid, specificQuestionConfig),
    [formUuid, specificQuestionConfig]
  );

  const { data, error } = useSWR<FetchResponse, Error>(
    specificQuestionsToLoad ? `${formUrl}/${formUuid}` : null,
    openmrsFetch
  );

  const specificQuestions = getQuestionsByIds(
    specificQuestionsToLoad,
    data?.data
  );

  return {
    questions: specificQuestions || null,
    isError: error,
    isLoading: !data && !error,
  };
};

function getQuestionIdsByFormId(
  formUuid: string,
  specificQuestionConfig: Array<SpecificQuestionConfig>
) {
  const matchingQuestions = specificQuestionConfig.filter((question) =>
    question.forms.includes(formUuid)
  );
  return matchingQuestions.map((question) => question.questionId);
}

function getQuestionsByIds(questionIds, formSchema): Array<SpecificQuestion> {
  if (!formSchema || questionIds.lenght <= 0) {
    return [];
  }
  const conceptLabels = formSchema.conceptReferences;
  return formSchema.pages.flatMap((page) =>
    page.sections.flatMap((section) =>
      section.questions
        .filter((question) => questionIds.includes(question.id))
        .map((question) => ({
          question: {
            display:
              question.label ??
              conceptLabels[question.questionOptions.concept]?.display,
            id: question.id,
          },
          answers: (question.questionOptions.answers ?? []).map((answer) => ({
            value: answer.concept,
            display: answer.label ?? conceptLabels[answer.concept]?.display,
          })),
        }))
    )
  );
}

export default useSpecificQuestions;
