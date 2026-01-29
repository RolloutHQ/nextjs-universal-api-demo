"use client";

export type ResourceType =
  | "people"
  | "tasks"
  | "timeline";

interface Tab {
  id: ResourceType;
  label: string;
}

interface ResourceTabsProps {
  activeTab: ResourceType;
  onTabChange: (tab: ResourceType) => void;
}

const TABS: Tab[] = [
  { id: "people", label: "People" },
  // { id: "tasks", label: "Tasks" },
  { id: "timeline", label: "Timeline" },
];

export default function ResourceTabs({ activeTab, onTabChange }: ResourceTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-4 overflow-x-auto" aria-label="Tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
              ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
