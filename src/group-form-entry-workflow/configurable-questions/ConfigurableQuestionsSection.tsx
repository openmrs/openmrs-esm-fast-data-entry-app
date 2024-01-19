import { TextInput, Select, SelectItem, InlineLoading } from "@carbon/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useConcepts } from "../../hooks";
import { extractUUIDs, getConceptLabel } from "./helper";
import { SpecificQuestion } from "../../types";
import { FieldValues, UseFormRegister } from "react-hook-form";

interface ConfigurableQuestionsSectionProps {
  specificQuestions: Array<SpecificQuestion>;
  register?: UseFormRegister<FieldValues>;
}

const ConfigurableQuestionsSection: React.FC<
  ConfigurableQuestionsSectionProps
> = ({ register, specificQuestions }) => {
  const { t } = useTranslation();
  const { concepts, isLoading } = useConcepts(extractUUIDs(specificQuestions));

  return isLoading ? (
    <InlineLoading description={`${t("loading", "Loading")} ...`} />
  ) : (
    <>
      {specificQuestions?.map((specificQuestion) => (
        <div key={specificQuestion.questionId}>
          {specificQuestion?.answers?.length > 0 ? (
            <Select
              {...register(specificQuestion.questionId, { required: false })}
              id={specificQuestion.questionId}
              labelText={getConceptLabel(concepts, specificQuestion.question)}
            >
              <SelectItem value="" text="" />
              {specificQuestion.answers.map((answer) => (
                <SelectItem
                  key={answer}
                  value={answer}
                  text={getConceptLabel(concepts, answer)}
                />
              ))}
            </Select>
          ) : (
            <TextInput
              id={specificQuestion.questionId}
              {...register(specificQuestion.questionId, { required: false })}
              type="text"
              labelText={getConceptLabel(concepts, specificQuestion?.question)}
            />
          )}
        </div>
      ))}
    </>
  );
};

export default ConfigurableQuestionsSection;
