import { isEnglish, t } from "./i18n.js";

export const actionNames = {
  runs_start: "启动 SOP",
  runs_approve: "批准节点",
  runs_reject: "退回节点",
  runs_retry: "重试节点",
  runs_cancel: "取消运行",
  runs_pause: "暂停运行",
  runs_resume: "继续运行",
  issues_dispatch: "派发 SOP",
  issues_save: "保存需求",
  issues_import_tapd: "导入 TAPD 需求",
  issues_clarify: "保存需求澄清",
  issues_chat_clarify: "发起 AI 需求澄清",
  issues_clarification_save: "保存并回写需求澄清",
  issues_delete: "删除需求",
  issues_comments_add: "添加需求评论",
  issues_reopen: "重新打开需求",
  workflows_save: "保存 SOP",
  workflows_clone: "复制 SOP",
  workflows_publish: "发布 SOP",
  agents_save: "保存角色",
  assistant_tasks_save: "保存定时任务",
};
const entities = {
  agents: "角色",
  workflows: "SOP",
  projects: "项目",
  repositories: "仓库",
  rules: "规则",
  skills: "技能",
  mcp_servers: "MCP 服务",
  schedule_jobs: "平台定时任务",
  assistant_tasks: "助手定时任务",
  runs: "运行",
  issues: "需求",
  environments: "环境",
  sandboxes: "沙箱",
  dockerfiles: "Dockerfile",
  executors: "执行器",
};
const verbs = {
  save: "保存",
  delete: "删除",
  publish: "发布",
  clone: "复制",
  start: "启动",
  cancel: "取消",
  retry: "重试",
  pause: "暂停",
  resume: "继续",
  run: "执行",
  import: "导入",
  restore: "恢复",
};
const actionNamesEn = {
  runs_start: "Start SOP",
  runs_approve: "Approve node",
  runs_reject: "Reject node",
  runs_retry: "Retry node",
  runs_cancel: "Cancel run",
  runs_pause: "Pause run",
  runs_resume: "Resume run",
  issues_dispatch: "Dispatch SOP",
  issues_save: "Save requirement",
  issues_import_tapd: "Import TAPD requirement",
  issues_clarify: "Save requirement clarification",
  issues_chat_clarify: "Start AI requirement clarification",
  issues_clarification_save: "Save and sync requirement clarification",
  issues_delete: "Delete requirement",
  issues_comments_add: "Add requirement comment",
  issues_reopen: "Reopen requirement",
  workflows_save: "Save SOP",
  workflows_clone: "Copy SOP",
  workflows_publish: "Publish SOP",
  agents_save: "Save role",
  assistant_tasks_save: "Save scheduled task",
};
const entitiesEn = {
  agents: "role",
  workflows: "SOP",
  projects: "project",
  repositories: "repository",
  rules: "rule",
  skills: "skill",
  mcp_servers: "MCP server",
  schedule_jobs: "platform schedule",
  assistant_tasks: "assistant schedule",
  runs: "run",
  issues: "requirement",
  environments: "environment",
  sandboxes: "sandbox",
  dockerfiles: "Dockerfile",
  executors: "executor",
};
const verbsEn = {
  save: "Save",
  delete: "Delete",
  publish: "Publish",
  clone: "Copy",
  start: "Start",
  cancel: "Cancel",
  retry: "Retry",
  pause: "Pause",
  resume: "Resume",
  run: "Run",
  import: "Import",
  restore: "Restore",
};
export const actionName = (tool) => {
  const en = isEnglish();
  const names = en ? actionNamesEn : actionNames;
  if (names[tool]) return names[tool];
  const match = tool?.match(/^(.*)_([^_]+)$/);
  if (match && entities[match[1]] && verbs[match[2]])
    return en
      ? `${verbsEn[match[2]]} ${entitiesEn[match[1]]}`
      : verbs[match[2]] + entities[match[1]];
  return tool
    ? t(`执行 ${tool}`, `Run ${tool}`)
    : t("未指定操作", "No action specified");
};
export const visibleSidebarArtifact = (a) =>
  !a.draft ||
  !!definitionTarget(a) ||
  (!a.draft.saved && !a.draft.resolved && !a.draft.inherited);

export function definitionTarget(artifact, projectId = "") {
  if (!["sop", "role"].includes(artifact?.kind)) return null;
  if (artifact.draft && !artifact.draft.saved) return null;
  const saved =
    artifact.draft?.savedResult?.data || artifact.draft?.savedResult;
  const asset = artifact.asset || saved;
  if (!asset?.id) return null;
  const project =
    asset.projectId || artifact.draft?.body?.projectId || projectId;
  return {
    id: asset.id,
    href: `/${project ? `?projectId=${encodeURIComponent(project)}` : ""}#/${artifact.kind === "sop" ? "flow" : "agents"}/${encodeURIComponent(asset.id)}`,
    label: artifact.kind === "sop" ? "打开 SOP 编排" : "打开角色定义",
  };
}

// After a new project is created from a chat the user wants to keep working in
// it, but the chat stays bound to its own project and the assistant cannot
// switch it. Link to the Studio with the new project selected.
export function projectEntryTarget(draft, currentProjectId = "") {
  if (draft?.tool !== "projects_save" || !draft.saved) return null;
  const saved = draft.savedResult?.data || draft.savedResult || {};
  const id = saved.id || draft.body?.id;
  if (!id || id === currentProjectId) return null;
  return {
    href: `/?projectId=${encodeURIComponent(id)}#/collaboration`,
    label: t(
      `进入项目「${saved.name || draft.body?.name || id}」继续对话`,
      `Open project "${saved.name || draft.body?.name || id}" to continue`,
    ),
  };
}

// A historical approval draft may already have been approved in a later turn.
// Derive its current display state without rewriting its execution receipt.
export function reconcileOperation(artifact, runs) {
  const draft = artifact.draft;
  if (!draft || draft.saved || draft.inherited || draft.tool !== "runs_approve")
    return artifact;
  const run = runs.find((r) => r.id === draft.path?.id);
  const node = run?.nodes?.[draft.body?.nodeId];
  if (!["succeeded", "skipped"].includes(node?.status)) return artifact;
  return { ...artifact, source: "已完成", draft: { ...draft, resolved: true } };
}
