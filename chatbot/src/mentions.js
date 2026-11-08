import { t } from "./i18n.js";

export const referenceTypes = [
  { type: "agent", label: t("角色", "Role"), hint: t("派给角色去做", "Hand it to a role") },
  { type: "skill", label: t("技能", "Skill"), hint: t("用这个技能来做", "Do it with this skill") },
  { type: "issue", label: t("需求", "Requirement"), hint: t("查找需求与验收条件", "Find requirements and acceptance criteria") },
  { type: "sop", label: "SOP", hint: t("引用工作流程", "Reference a workflow") },
  { type: "run", label: t("运行", "Run"), hint: t("查看任务执行情况", "Check how a task is running") },
  { type: "repository", label: t("仓库", "Repository"), hint: t("添加代码仓库上下文", "Add code repository context") },
];
export function mentionAt(text, caret, references = []) {
  const before = text.slice(0, caret);
  const match = before.match(/@([^@\n]*)$/);
  if (!match || /[a-z0-9_.+-]/i.test(before[match.index - 1] || ""))
    return null;
  if (references.some((ref) => match[1].startsWith((ref.name || ref.id) + " ")))
    return null;
  return { start: match.index, end: caret, query: match[1] };
}
export function insertMention(text, range, reference) {
  const token = `@${reference.name || reference.id} `;
  return {
    text: text.slice(0, range.start) + token + text.slice(range.end),
    caret: range.start + token.length,
  };
}
