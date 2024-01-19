import { openmrsFetch } from "@openmrs/esm-framework";
import useSWR from "swr";
import { Concept, SpecificQuestion } from "../types";

const conceptUrl = "/ws/rest/v1/concept?references=";

export function useConcepts(conceptUuids: Array<string> = []) {
  const { data, error } = useSWR<{ data: { results: Array<Concept> } }, Error>(
    `${conceptUrl}${conceptUuids.toString()}&v=custom:(uuid,display)`,
    openmrsFetch
  );

  return {
    concepts: data ? data.data.results : null,
    isError: error,
    isLoading: !data && !error,
  };
}

export const conceptLabelsMapper = (
  specificQuestions: Array<SpecificQuestion>,
  concepts: Array<Concept>
) => {
  const conceptLabels = {};

  specificQuestions.forEach(({ answers, question }) => {
    answers.forEach((conceptUuid) => {
      const matchingConcept = concepts.find((c) => c.uuid === conceptUuid);
      conceptLabels[conceptUuid] = matchingConcept?.display;
    });

    const matchingQuestionConcept = concepts.find((c) => c.uuid === question);
    conceptLabels[question] = matchingQuestionConcept?.display;
  });

  return conceptLabels;
};

export default useConcepts;
