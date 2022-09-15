import {
  Button,
  Layer,
  Tile,
  TextInput,
  TextArea,
  DatePicker,
  DatePickerInput,
} from "@carbon/react";
import React, { useContext, useEffect, useState } from "react";
import styles from "./styles.scss";
import { useTranslation } from "react-i18next";
import GroupFormWorkflowContext from "../../context/GroupFormWorkflowContext";

import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import { CancelModal } from "../GroupFormEntryWorkflow";

const SessionDetails = () => {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext();

  return (
    <div className={styles.formSection}>
      <h4>{t("sessionDetails", "Session details")}</h4>
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
                invalidText={"This field is required"}
              />
              <TextInput
                id="text"
                type="text"
                labelText={t("practitionerName", "Practitioner Name")}
                {...register("practitionerName", { required: true })}
                invalid={errors.practitionerName}
                invalidText={"This field is required"}
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
                      invalidText={"This field is required"}
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
                invalidText={"This field is required"}
              />
            </div>
          </Layer>
        </Tile>
      </Layer>
    </div>
  );
};

const GroupIdField = () => {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext();
  const { activeGroupUuid } = useContext(GroupFormWorkflowContext);

  useEffect(() => {
    if (activeGroupUuid) setValue("groupUuid", activeGroupUuid);
  }, [activeGroupUuid, setValue]);

  return (
    <>
      <input
        hidden
        {...register("groupUuid", {
          value: activeGroupUuid,
          required: t("chooseGroupError", "Please choose a group."),
        })}
      />
      {errors.groupUuid && !activeGroupUuid && (
        <div className={styles.formError}>
          {errors.groupUuid.message as string}
        </div>
      )}
    </>
  );
};

const NewGroupWorkflowButtons = () => {
  const { t } = useTranslation();
  const { workflowState } = useContext(GroupFormWorkflowContext);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  if (workflowState !== "NEW_GROUP_SESSION") return null;

  return (
    <>
      <div className={styles.rightPanelActionButtons}>
        <Button kind="secondary" type="submit">
          {t("createNewSession", "Create New Session")}
        </Button>
        <Button
          kind="tertiary"
          onClick={() => {
            setCancelModalOpen(true);
          }}
        >
          {t("cancel", "Cancel")}
        </Button>
      </div>
      <CancelModal open={cancelModalOpen} setOpen={setCancelModalOpen} />
    </>
  );
};

const SessionMetaWorkspace = () => {
  const { t } = useTranslation();
  const { setSessionMeta } = useContext(GroupFormWorkflowContext);
  const methods = useForm();

  const onSubmit = (data) => {
    const { sessionDate, ...rest } = data;
    setSessionMeta({ ...rest, sessionDate: sessionDate[0] });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <div className={styles.workspace}>
          <div className={styles.formMainContent}>
            <div className={styles.formContainer}>
              <SessionDetails />
            </div>
            <div className={styles.rightPanel}>
              <h4>{t("newGroupSession", "New Group Session")}</h4>
              <GroupIdField />
              <hr style={{ width: "100%" }} />
              <NewGroupWorkflowButtons />
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default SessionMetaWorkspace;
export { SessionMetaWorkspace };
