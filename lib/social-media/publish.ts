// Publish adapter — the single seam where a composed post reaches a platform.
//
// Live platform-API posting (Facebook Graph API, LinkedIn UGC API, …) is wired
// in LATER. Today this layer validates that an account is connected and records
// the publish, returning the account's profile URL as the external link. Each
// platform branch has a clearly-marked TODO for the real API call so swapping in
// live posting is a localized change — nothing else in the app needs to know.

import type { SocialAccount } from "./types";
import { composePostText } from "./render";

export class SocialNotConnectedError extends Error {
  constructor(platform: string) {
    super(`${platform} isn't connected yet. Add your credentials in Social Media → Settings, then mark the account connected.`);
    this.name = "SocialNotConnectedError";
  }
}

export type PublishInput = {
  account: SocialAccount;
  bodyText: string;
  hashtags: string[];
  mediaUrls: string[];
  linkUrl: string | null;
};

export type PublishResult = { externalPostId: string; externalUrl: string | null; simulated: boolean };

export async function publishToPlatform(input: PublishInput): Promise<PublishResult> {
  const { account } = input;
  if (!account.is_active || account.status !== "connected") {
    throw new SocialNotConnectedError(account.platform);
  }

  const text = composePostText(input.bodyText, input.hashtags);

  switch (account.platform) {
    case "facebook":
      // TODO(live): POST https://graph.facebook.com/{page_id}/feed (or /photos for media)
      //   with access_token = account.credentials.page_access_token; message = text.
      return simulated(account, text);
    case "linkedin":
      // TODO(live): POST https://api.linkedin.com/v2/ugcPosts with author = organization_urn,
      //   Authorization: Bearer account.credentials.access_token; text = text.
      return simulated(account, text);
    default:
      // TODO(live): per-platform implementation.
      return simulated(account, text);
  }
}

// Records a publish without a live API call yet — keeps the content hub usable.
function simulated(account: SocialAccount, _text: string): PublishResult {
  const stamp = Math.random().toString(36).slice(2, 10);
  return {
    externalPostId: `sim_${account.platform}_${stamp}`,
    externalUrl: account.profile_url ?? null,
    simulated: true,
  };
}
