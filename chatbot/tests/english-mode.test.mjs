import { afterEach, test, vi } from "vitest";
import assert from "node:assert/strict";

// The workbench follows the platform language switch (window.lfLang from
// web/i18n.js). Some labels are resolved at module load, so each case sets the
// language first and imports fresh modules.
async function loadInEnglish(path) {
  vi.resetModules();
  globalThis.window = globalThis.window || {};
  globalThis.window.lfLang = () => "en";
  return import(path);
}

afterEach(() => {
  if (globalThis.window) delete globalThis.window.lfLang;
  vi.resetModules();
});

test("t() follows the platform language", async () => {
  const { t, isEnglish } = await loadInEnglish("../src/i18n.js");
  assert.equal(isEnglish(), true);
  assert.equal(t("新对话", "New chat"), "New chat");
  globalThis.window.lfLang = () => "zh";
  assert.equal(isEnglish(), false);
  assert.equal(t("新对话", "New chat"), "新对话");
});

test("reply status labels are English when English is selected", async () => {
  const { sessionReplyStatus } = await loadInEnglish("../src/session-status.js");
  assert.equal(sessionReplyStatus({ id: "one", generationStatus: "completed" }).label, "Reply complete");
  assert.equal(sessionReplyStatus({ id: "one", generationStatus: "running" }).label, "Replying");
});

test("an activity round with no tool calls reads as English", async () => {
  const { activityGroupSummary } = await loadInEnglish("../src/activity.js");
  assert.equal(activityGroupSummary([], { active: true }), "Thinking");
  assert.equal(activityGroupSummary([], { active: false }), "Thought");
});
