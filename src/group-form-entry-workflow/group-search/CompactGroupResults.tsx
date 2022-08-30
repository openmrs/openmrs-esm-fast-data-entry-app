import React from "react";
import { SkeletonIcon, SkeletonText } from "@carbon/react";
import { Events } from "@carbon/react/icons";
import styles from "./compact-group-result.scss";

const CompactGroupResults = ({ groups, selectGroupAction }) => {
  return (
    <>
      {groups.map((group) => (
        <div
          onClick={selectGroupAction}
          key={group.id}
          className={styles.patientSearchResult}
          role="button"
          tabIndex={0}
        >
          <div className={styles.patientAvatar} role="img">
            <Events size={24} />
          </div>
          <div>
            <h2 className={styles.patientName}>{group.name}</h2>
            <p className={styles.demographics}>
              {group.patients.length} members
              <span className={styles.middot}>&middot;</span>{" "}
              {group.description}
            </p>
          </div>
        </div>
      ))}
    </>
  );
};

export const SearchResultSkeleton = () => {
  return (
    <div className={styles.patientSearchResult}>
      <div className={styles.patientAvatar} role="img">
        <SkeletonIcon
          style={{
            height: "3rem",
            width: "3rem",
          }}
        />
      </div>
      <div>
        <h2 className={styles.patientName}>
          <SkeletonText />
        </h2>
        <span className={styles.demographics}>
          <SkeletonIcon /> <span className={styles.middot}>&middot;</span>{" "}
          <SkeletonIcon /> <span className={styles.middot}>&middot;</span>{" "}
          <SkeletonIcon />
        </span>
      </div>
    </div>
  );
};

export default CompactGroupResults;
