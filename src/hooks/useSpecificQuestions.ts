import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type SpecificQuestion, type SpecificQuestionConfig } from '../types';
import { useMemo } from 'react';

const formUrl = `${restBaseUrl}/o3/forms`;

export const useSpecificQuestions = (formUuid: string, specificQuestionConfig: Array<SpecificQuestionConfig>) => {
  const specificQuestionsToLoad = useMemo(
    () => getQuestionByFormId(formUuid, specificQuestionConfig),
    [formUuid, specificQuestionConfig],
  );

  const { data, error } = useSWR<FetchResponse, Error>(
    specificQuestionsToLoad ? `${formUrl}/${formUuid}` : null,
    openmrsFetch,
  );

  const specificQuestions = getQuestions(specificQuestionsToLoad, data?.data);

  return {
    questions: specificQuestions || null,
    isError: error,
    isLoading: !data && !error,
  };
};

function getQuestionByFormId(formUuid: string, specificQuestionConfig: Array<SpecificQuestionConfig>) {
  return specificQuestionConfig.filter((question) => question.forms.includes(formUuid));
}

function getQuestions(specificQuestions: Array<SpecificQuestionConfig>, formSchema): Array<SpecificQuestion> {
  if (!formSchema || specificQuestions.length <= 0) {
    return [];
  }

  const specificQuestionsMap = new Map<string, SpecificQuestionConfig>(
    specificQuestions.map((sq) => [sq.questionId, sq]),
  );

  const questionIds = new Set(specificQuestionsMap.keys());
  const conceptLabels = formSchema.conceptReferences;

  return formSchema.pages.flatMap((page) =>
    page.sections.flatMap((section) =>
      section.questions
        .filter((question) => questionIds.has(question.id))
        .map((question) => {
          const specificQuestion = specificQuestionsMap.get(question.id) || {};

          return {
            question: {
              display: question.label ?? conceptLabels[question.questionOptions.concept]?.display,
              id: question.id,
              disabled: (specificQuestion as SpecificQuestionConfig).disabled,
              defaultAnswer: (specificQuestion as SpecificQuestionConfig).defaultAnswer,
            },
            answers: (question.questionOptions.answers ?? []).map((answer) => ({
              value: answer.concept,
              display: answer.label ?? conceptLabels[answer.concept]?.display,
            })),
          };
        }),
    ),
  );
}

export default useSpecificQuestions;
