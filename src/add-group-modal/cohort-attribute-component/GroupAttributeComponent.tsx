import React from "react";
import { TextInput, Checkbox } from "@carbon/react";
import { useTranslation } from "react-i18next";
import styles from "./styles.scss";

interface GroupAttributeComponentProps {
  cohortAttributeTypes: CohortAttribute[];
  onChange: any;
}
const GroupAttributeComponent: React.FC<GroupAttributeComponentProps> = (
  props
) => {
  const { cohortAttributeTypes, onChange } = props;
  const { t } = useTranslation();

  return (
    <>
      {cohortAttributeTypes.map((attribute) => {
        switch (attribute.attributeType.type) {
          case "org.openmrs.customdatatype.datatype.FreeTextDatatype":
            return (
              <TextInput
                id={attribute.attributeType.uuid}
                labelText={t(attribute.labelCode, attribute.attributeType.name)}
                value={attribute.value}
                type="text"
                onChange={(event) => {
                  onChange(event.target.id, event.target.value);
                }}
              />
            );
          case "org.openmrs.customdatatype.datatype.BooleanDatatype":
            return (
              <Checkbox
                id={attribute.attributeType.uuid}
                labelText={t(attribute.labelCode, attribute.attributeType.name)}
                checked={attribute.value} // Set to true for a pre-checked checkbox
                onChange={(event) => {
                  onChange(event.target.id, event.target.checked);
                }}
              />
            );
          default:
            break;
        }
      })}
    </>
  );
};
export default GroupAttributeComponent;

export type CohortAttribute = {
  uuid?: string;
  labelCode?: string;
  value?: any;
  attributeType: {
    uuid: string;
    name: string;
    type: string;
  };
};
