import LiveRoomsHome from "@/components/live-intelligence-rooms/LiveRoomsHome";
import DecisionJourneyHero from "@/components/experience/DecisionJourneyHero";

export default function LiveRoomsPage() {
  return (
    <div className="mx-auto max-w-[100rem] space-y-6">
      <DecisionJourneyHero variant="collaboration" />
      <LiveRoomsHome />
    </div>
  );
}
