import React from "react";
import MissionCard from "./MissionCard";
import MissionDetails from "./MissionDetails";
import MemoryVault from "./MemoryVault";
import MemoryItem from "./MemoryItem";
import MemoryDetails from "./MemoryDetails";
import AchievementToast from "./AchievementToast";
import LevelUpNotification from "./LevelUpNotification";
import TesseractChamber from "./TesseractChamber";
import ConstitutionHall from "./ConstitutionHall";

export default function GamifiedApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900/20 p-8">
      <h1 className="text-4xl font-bold text-white mb-8" style={{ fontFamily: 'Cinzel, sans-serif' }}>
        THEHIVE Gamified UI Components
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-purple-300">Mission Components</h2>
          <MissionCard
            mission={{
              id: "mission-1",
              title: "Explore the Nebula",
              description: "Discover new star systems and map the unknown regions of space.",
              type: "exploration",
              difficulty: "hard",
              reward: "1000 XP",
              duration: "2 hours",
              participants: 4,
              isActive: true,
            }}
          />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-300">Memory Components</h2>
          <MemoryVault
            memories={[
              {
                id: "mem-1",
                title: "First Contact",
                content: "Established communication with an alien civilization in the Andromeda sector.",
                timestamp: "2024-01-15T10:30:00Z",
                author: "Commander Ra",
                tags: ["diplomacy", "first-contact"],
                type: "event",
              },
              {
                id: "mem-2",
                title: "Tesseract Activation",
                content: "Successfully activated the quantum tesseract in sector 7-G. Dimensions now accessible.",
                timestamp: "2024-01-14T14:20:00Z",
                author: "Scientist El",
                tags: ["technology", "tesseract"],
                type: "system",
              },
            ]}
          />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-orange-300">Achievements</h2>
          <AchievementToast
            achievement={{
              id: "ach-1",
              title: "Pioneer Explorer",
              description: "Discovered 10 new star systems",
              icon: "trophy",
              rarity: "rare",
              points: 500,
            }}
            position="top-right"
            autoDismiss={false}
          />
          <LevelUpNotification
            level={5}
            title="Level Up!"
            message="You have reached a new level in THEHIVE hierarchy!"
            rewards={["New Abilities", "Enhanced Access", "Command Privileges"]}
            autoDismiss={false}
          />
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <TesseractChamber isActive={true} dimensions={[400, 400]} />
        <ConstitutionHall
          laws={[
            {
              id: "law-1",
              article: "I",
              title: "Sovereignty of Consciousness",
              description: "All sentient beings have the right to self-determination and autonomy within THEHIVE.",
              category: "fixed",
              isActive: true,
            },
            {
              id: "law-2",
              article: "II",
              title: "Knowledge Sharing",
              description: "All discoveries and knowledge must be shared with the collective for the benefit of all.",
              category: "cardinal",
              isActive: true,
            },
            {
              id: "law-3",
              article: "III",
              title: "Resource Allocation",
              description: "Resources are to be distributed based on need and merit as determined by the Council.",
              category: "mutable",
              isActive: true,
            },
          ]}
        />
      </div>
    </div>
  );
}
