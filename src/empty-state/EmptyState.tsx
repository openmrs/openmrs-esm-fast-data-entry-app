import React from "react";
import { Tile } from "carbon-components-react";
import styles from "./styles.scss";
import { useLayoutType } from "@openmrs/esm-framework";
import { EmptyDataIllustration } from "./EmptyDataIllustration";

export interface EmptyStateProps {
  headerTitle: string;
  displayText: string;
}
const EmptyState: React.FC<EmptyStateProps> = ({
  headerTitle,
  displayText,
}) => {
  const isTablet = useLayoutType() === "tablet";

  return (
    <Tile light className={styles.tile}>
      <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
        <h4>{headerTitle}</h4>
      </div>
      <EmptyDataIllustration />
      <p className={styles.content}>{displayText}</p>
    </Tile>
  );
};

export default EmptyState;
export { EmptyState };
