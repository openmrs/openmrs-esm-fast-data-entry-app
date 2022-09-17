import React, { useEffect, useReducer } from "react";
import { SkeletonIcon, SkeletonText } from "@carbon/react";
import { Events } from "@carbon/react/icons";
import styles from "./compact-group-result.scss";
import { useTranslation } from "react-i18next";
import useKeyPress from "../../hooks/useKeyPress";

const reducer = (state, action) => {
  switch (action.type) {
    case "arrowUp":
      return { selectedIndex: Math.max(state.selectedIndex - 1, 0) };
    case "arrowDown":
      return {
        selectedIndex: Math.min(state.selectedIndex + 1, action.listLength - 1),
      };
    case "select":
      return { selectedIndex: action.payload };
    default:
      return state;
  }
};

const CompactGroupResults = ({ groups, selectGroupAction }) => {
  const arrowUpPressed = useKeyPress("ArrowUp");
  const arrowDownPressed = useKeyPress("ArrowDown");
  const enterPressed = useKeyPress("Enter");
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(reducer, { selectedIndex: 0 });

  useEffect(() => {
    if (arrowUpPressed) {
      dispatch({ type: "arrowUp" });
    }
  }, [arrowUpPressed]);

  useEffect(() => {
    if (arrowDownPressed) {
      dispatch({ type: "arrowDown", listLength: groups.length });
    }
  }, [arrowDownPressed, groups.length]);

  useEffect(() => {
    if (enterPressed && groups.length) {
      selectGroupAction(groups[state.selectedIndex]);
    }
  }, [enterPressed, selectGroupAction, groups, state.selectedIndex]);

  return (
    <>
      {groups.map((group, index) => (
        <div
          onClick={() => {
            dispatch({ type: "select", payload: index });
            selectGroupAction(group);
          }}
          key={group.uuid}
          className={`${styles.patientSearchResult} ${
            index === state.selectedIndex && styles.patientSearchResultSelected
          }`}
          role="button"
          aria-pressed={index === state.selectedIndex}
          tabIndex={0}
        >
          <div className={styles.patientAvatar} role="img">
            <Events size={24} />
          </div>
          <div>
            <h2 className={styles.patientName}>{group.name}</h2>
            <p className={styles.demographics}>
              {group.cohortMembers?.length ?? 0} {t("members", "members")}
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
