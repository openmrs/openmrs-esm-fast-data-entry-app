import {
  Layer,
  Tile,
  TextInput,
  TextArea,
  DatePicker,
  DatePickerInput,
} from "@carbon/react";
import React, { useContext } from "react";
import { useConfig } from "@openmrs/esm-framework";
import { useParams } from "react-router-dom";
import styles from "./styles.scss";
import { useTranslation } from "react-i18next";
import { Controller, useFormContext } from "react-hook-form";
import { AttendanceTable } from "./attendance-table";
import GroupFormWorkflowContext from "../context/GroupFormWorkflowContext";
import useGetPatients from "../hooks/useGetPatients";
import ConfigurableQuestionsSection from "./configurable-questions/ConfigurableQuestionsSection";
import useSpecificQuestions from "../hooks/useForm";

interface ParamTypes {
  formUuid?: string;
}

const SessionDetailsForm = () => {
  const { specificQuestions } = useConfig();
  const { formUuid } = useParams() as ParamTypes;
  const { questions } = useSpecificQuestions(formUuid, specificQuestions);

  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext();

  const { activeGroupMembers} = useContext(GroupFormWorkflowContext);
  const { patients, isLoading } = useGetPatients(activeGroupMembers);

  return (
    <div>
      {!isLoading && (
        <div className={styles.formSection}>
          <h4>{t("sessionDetails", "1. Session details")}</h4>
          <div>
            <p>
              {t(
                "allFieldsRequired",
                "All fields are required unless marked optional"
              )}
            </p>
          </div>
          <Layer>
            <Tile className={styles.formSectionTile}>
              <Layer>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    rowGap: "1.5rem",
                  }}
                >
                  <TextInput
                    id="text"
                    type="text"
                    labelText={t("sessionName", "Session Name")}
                    {...register("sessionName", { required: true })}
                    invalid={errors.sessionName}
                    invalidText={t("requiredField", "This field is required")}
                  />
                  <TextInput
                    id="text"
                    type="text"
                    labelText={t("practitionerName", "Practitioner Name")}
                    {...register("practitionerName", { required: true })}
                    invalid={errors.practitionerName}
                    invalidText={t("requiredField", "This field is required")}
                  />
                  <Controller
                    name="sessionDate"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <DatePicker
                        datePickerType="single"
                        size="md"
                        maxDate={new Date()}
                        {...field}
                      >
                        <DatePickerInput
                          id="session-date"
                          labelText={t("sessionDate", "Session Date")}
                          placeholder="mm/dd/yyyy"
                          size="md"
                          invalid={errors.sessionDate}
                          invalidText={t(
                            "requiredField",
                            "This field is required"
                          )}
                        />
                      </DatePicker>
                    )}
                  />
                  <TextArea
                    id="text"
                    type="text"
                    labelText={t("sessionNotes", "Session Notes")}
                    {...register("sessionNotes", { required: true })}
                    invalid={errors.sessionNotes}
                    invalidText={t("requiredField", "This field is required")}
                  />
                </div>
              </Layer>
            </Tile>
          </Layer>
          <h4>{t("sessionParticipants", "2. Session participants")}</h4>
          <div>
            <p>
              {t(
                "markAbsentPatients",
                "The patients in this group. Patients that are not present in the session should be marked as absent."
              )}
            </p>
          </div>
          <Layer>
            <Tile className={styles.formSectionTile}>
              <Layer>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    rowGap: "1.5rem",
                  }}
                >
                  <AttendanceTable patients={patients} />
                </div>
              </Layer>
            </Tile>
          </Layer>
          {questions?.length > 0 ? (
            <>
              <h4>{t("sessionSpecificDetails", "3. Specific details")}</h4>
              <div>
                <p>
                  {t(
                    "sessionSpecificDetailsDescription",
                    "They will be mapped to form responses for all patients as pre-filled data."
                  )}
                </p>
              </div>
              <Layer>
                <Tile className={styles.formSectionTile}>
                  <Layer>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        rowGap: "1.5rem",
                      }}
                    >
                      <ConfigurableQuestionsSection
                        register={register}
                        specificQuestions={questions}
                      />
                    </div>
                  </Layer>
                </Tile>
              </Layer>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SessionDetailsForm;
