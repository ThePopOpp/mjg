// Every editable content scope, by key. Add a page's scope here when the page
// is built; the editor and the MCP discover what can be changed from this map.

import type { ScopeDef } from "./kit";
import { pageAbout } from "./scopes/page-about";
import { pageContact } from "./scopes/page-contact";
import { pageMission } from "./scopes/page-mission";
import { pageResources } from "./scopes/page-resources";
import { globalFooter, globalFramework, globalJoinForm, globalNav } from "./scopes/global";
import { pageAssessments, pageCheckIn } from "./scopes/page-assessments";
import { pagePersonalBlueprint, pageStewardshipBlueprint } from "./scopes/page-blueprint";
import { pageBook } from "./scopes/page-book";
import { pageChurches } from "./scopes/page-churches";
import { pageHome } from "./scopes/page-home";
import { pageJoin } from "./scopes/page-join";
import { pageLeadAGroup } from "./scopes/page-lead-a-group";
import { pageLearn } from "./scopes/page-learn";
import { pageMeetSteward } from "./scopes/page-meet-steward";
import { pageStart } from "./scopes/page-start";
import { pageStudies } from "./scopes/page-studies";

export const SCOPES: Record<string, ScopeDef> = Object.fromEntries(
  [
    globalNav, globalFooter, globalFramework, globalJoinForm, pageHome, pageBook, pageStewardshipBlueprint, pagePersonalBlueprint, pageAssessments, pageCheckIn,
    pageStart, pageLearn, pageStudies, pageJoin, pageChurches, pageLeadAGroup, pageMeetSteward,
    pageAbout, pageMission, pageContact, pageResources,
  ].map((s) => [s.key, s as unknown as ScopeDef]),
);

export function getScope(key: string): ScopeDef | null {
  return SCOPES[key] ?? null;
}
