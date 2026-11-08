import React from "react";
import HarnessIcon from "./HarnessIcon";
import { t } from "./i18n.js";

export function SidebarSection({
  title,
  icon,
  count,
  children,
  expanded,
  onToggle,
  className = "",
}) {
  return (
    <section
      className={`sidebar-project-section ${className}`.trim()}
      aria-label={t(`${title}的会话`, `Conversations in ${title}`)}
    >
      <button
        type="button"
        className="sidebar-section-heading"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        {icon ? <HarnessIcon name={icon} size={14} /> : null}
        <span title={title} data-i18n-data>{title}</span>
        <HarnessIcon name={expanded ? "chevron-down" : "chevron-right"} size={12} />
        <small>{count}</small>
      </button>
      <div
        className={`sidebar-section-collapse ${expanded ? "is-open" : ""}`}
        aria-hidden={!expanded || undefined}
        inert={!expanded}
      >
        <div className="sidebar-section-items">{children}</div>
      </div>
    </section>
  );
}
