import { ChallengeVideoPlayer } from "@/components/six-week-challenge/video-player";
import { getChallengeVideo } from "@/lib/six-week-challenge/videos";

// The 6-Week Challenge Invitation video, ready to drop into a PilotShell hero
// (`heroMedia`). Swap the source later by editing the "invitation" entry in videos.ts.
export function InvitationHeroVideo() {
  const v = getChallengeVideo("invitation");
  if (!v) return null;
  return (
    <div className="w-full">
      <ChallengeVideoPlayer
        youtubeId={v.youtubeId}
        driveId={v.driveId}
        embedDirect={v.embedDirect}
        videoUrl={v.videoUrl}
        posterEyebrow={v.posterEyebrow}
        posterTitle={v.posterTitle}
        thumbnailUrl={v.thumbnailUrl}
        thumbnailDark={v.thumbnailDark}
        title={v.title}
        badge={v.badge}
      />
    </div>
  );
}
