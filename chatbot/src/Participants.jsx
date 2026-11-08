import React, { useEffect, useRef } from "react";
import { confirmationCaption } from "./api";
import { t } from "./i18n.js";
const MAX_FACES = 3;
export function authorFor(message, session, users = []) {
  const id = message.authorId || (!session?.shared ? session?.userId : 0);
  const user = users.find((u) => u.id === id);
  return {
    id,
    loginName:
      user?.loginName ||
      (message.authorName && !message.authorName.startsWith("用户 ")
        ? message.authorName
        : ""),
    name:
      user?.chineseName ||
      user?.loginName ||
      message.authorName ||
      (id ? t(`用户 ${id}`, `User ${id}`) : t("历史发言人未记录", "Unrecorded speaker")),
  };
}
export function Avatar({ person, className = "" }) {
  return (
    <span
      className={`human-avatar${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    >
      <span>{person.name?.[0]?.toUpperCase() || "?"}</span>
      {person.loginName ? (
        <img
          src={`/api/auth/photo/100/${encodeURIComponent(person.loginName)}.png`}
          alt=""
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : null}
    </span>
  );
}
export function peopleFor(session, users = []) {
  let rows = session?.participants;
  if (!rows) {
    const seen = new Set();
    rows = (session?.messages || []).flatMap((m, i, all) => {
      if (m.role !== "user" || m.trigger || confirmationCaption(m, all[i - 1]))
        return [];
      const p = authorFor(m, session, users);
      if (!p.id || seen.has(p.id)) return [];
      seen.add(p.id);
      return [{ id: p.id, name: m.authorName }];
    });
  }
  return rows.map((p) =>
    authorFor({ authorId: p.id, authorName: p.name }, session, users),
  );
}
export default function Participants({ session, users, compact = false }) {
  const popover = useRef(null);
  const people = peopleFor(session, users);
  const unknown = session?.unknownParticipants;
  const hasPeople = !!(people.length || unknown);
  useEffect(() => {
    const details = popover.current;
    if (compact || !details) return;

    const close = () => { details.open = false; };
    const outside = (event) => {
      if (!details.contains(event.target)) close();
    };
    const keydown = (event) => {
      if (event.key !== "Escape" || !details.open) return;
      event.preventDefault();
      event.stopPropagation();
      close();
      details.querySelector("summary")?.focus();
    };
    const documents = [document];
    try {
      if (window.parent !== window) documents.push(window.parent.document);
    } catch {}
    for (const ownerDocument of documents) {
      ownerDocument.addEventListener("pointerdown", outside, true);
      ownerDocument.addEventListener("click", outside, true);
      ownerDocument.addEventListener("focusin", outside, true);
      ownerDocument.addEventListener("keydown", keydown, true);
    }
    window.addEventListener("blur", close);
    return () => {
      close();
      for (const ownerDocument of documents) {
        ownerDocument.removeEventListener("pointerdown", outside, true);
        ownerDocument.removeEventListener("click", outside, true);
        ownerDocument.removeEventListener("focusin", outside, true);
        ownerDocument.removeEventListener("keydown", keydown, true);
      }
      window.removeEventListener("blur", close);
    };
  }, [compact, session?.id, hasPeople]);
  if (!hasPeople) return null;
  const label = t(
    `${people.length} 人发过言${unknown ? "，部分历史发言人未记录" : ""}`,
    `${people.length} ${people.length === 1 ? "person has" : "people have"} spoken${unknown ? "; some earlier speakers were not recorded" : ""}`,
  );
  const names = people.map((p) => p.name).join(t("、", ", "));
  const shown = people.length
    ? people.slice(0, MAX_FACES)
    : [{ id: 0, name: "?" }];
  const hidden = Math.max(0, people.length - shown.length);
  const faces = (
    <>
      {shown.map((p, index) => (
        <Avatar
          key={p.id ?? `face-${index}`}
          person={p}
          className={index ? "is-stacked" : ""}
        />
      ))}
      {hidden || unknown ? (
        <span className="participant-count">+{hidden || "?"}</span>
      ) : null}
    </>
  );
  if (compact)
    return (
      <span
        className="session-people"
        data-i18n-data
        title={`${label}${t("：", ": ")}${names}`}
        aria-label={`${label}${t("：", ": ")}${names}`}
      >
        {faces}
      </span>
    );
  return (
    <details ref={popover} className="conversation-people">
      <summary
        aria-label={t(`查看会话参与人，${label}`, `View participants, ${label}`)}
        title={label}
      >
        {faces}
      </summary>
      <div className="people-popover">
        <strong>{label}</strong>
        {people.map((p) => (
          <div key={p.id}>
            <Avatar person={p} />
            <span data-i18n-data>
              {p.name}
              {p.loginName && p.name !== p.loginName ? (
                <small>{p.loginName}</small>
              ) : null}
            </span>
          </div>
        ))}
        {unknown ? <p>部分历史消息没有记录发言人。</p> : null}
      </div>
    </details>
  );
}
