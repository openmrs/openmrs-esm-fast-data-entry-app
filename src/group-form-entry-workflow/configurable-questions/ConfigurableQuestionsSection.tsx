import React from "react";
import { TextInput, Select, SelectItem } from "@carbon/react";
import { FieldValues, UseFormRegister } from "react-hook-form";
import { SpecificQuestion } from "../../types";

interface ConfigurableQuestionsSectionProps {
  specificQuestions: Array<SpecificQuestion>;
  register?: UseFormRegister<FieldValues>;
}

const ConfigurableQuestionsSection: React.FC<
  ConfigurableQuestionsSectionProps
> = ({ register, specificQuestions }) => {
  return (
    <>
      {specificQuestions?.map((specificQuestion) => (
        <div key={specificQuestion.question.id}>
          {specificQuestion?.answers?.length > 0 ? (
            <Select
              {...register(specificQuestion.question.id, { required: false })}
              id={specificQuestion.question.id}
              labelText={specificQuestion.question.display}
            >
              <SelectItem value="" text="" />
              {specificQuestion.answers.map((answer) => (
                <SelectItem
                  key={answer.value}
                  value={answer.value}
                  text={answer.display}
                />
              ))}
            </Select>
          ) : (
            <TextInput
              id={specificQuestion.question.id}
              {...register(specificQuestion.question.id, { required: false })}
              type="text"
              labelText={specificQuestion.question.display}
            />
          )}
        </div>
      ))}
    </>
  );
};

export default ConfigurableQuestionsSection;
