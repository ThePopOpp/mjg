# Future features

Ideas parked for a later decision. Each one names who raised it, when, what happens today, and the open questions to settle with Mike before it's built.

## Church admin removal: Super Admin decides the person's new role

*Raised by Jeremy, 2026-11-03.*

**Today.** When a church admin is removed from their last church, the app automatically changes their role to Participant (`removeChurchAdmin` in `lib/churches/repository.ts`). Church admins now have every facilitator feature, so this also takes away their team, Facilitator Listing and Experiences.

**Wanted.** Removals will be rare. When one happens, MJG and the Super Admin should choose the person's new role, rather than the app choosing for them.

**To decide with Mike:**
- Should removal leave the role unchanged and alert the Super Admin to review it? Or should the Super Admin pick the new role as part of removing them, for example Facilitator, Participant, or keep Church Admin?
- What happens to the official church groups this person leads? Should they stay listed under the church, move to another approved facilitator, or come off the church?
- Should the person be told, and by whom?
