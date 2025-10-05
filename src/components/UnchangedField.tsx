import type { AppState } from "@/store/appState";
import { wasAppStateFieldChanged } from "@/store/appState";
import { classMerge } from "@/utils/classMerge";

type UnchangedFieldProps = {
  children: React.ReactNode;
  field: keyof AppState;
};

const UnchangedField = (props: UnchangedFieldProps) => {
  const isUnchanged = !wasAppStateFieldChanged[props.field];

  return (
    <div
      className={classMerge(
        "flex flex-row gap-x-2 items-center",
        isUnchanged
          ? "bg-accent/30 text-accent-content p-2 px-4 rounded-md"
          : ""
      )}
    >
      {props.children}
    </div>
  );
};

export default UnchangedField;
