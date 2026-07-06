import type { ReactNode } from "react";
import { KeycapMark } from "./Logo";

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty rise">
      <KeycapMark size={36} />
      <h3>{title}</h3>
      {children}
    </div>
  );
}
