"use client";

import { useState, Suspense, lazy } from "react";
import { HiUserCircle, HiAdjustments } from "react-icons/hi";
import { MdDashboard } from "react-icons/md";
import { GroupChatProvider } from "../../Components/LoggedInHome/Contexts/GroupChatContext.tsx";
import ErrorBoundary from "../../Components/Common/ErrorBoundary.tsx";
import LoadingSpinner from "../../Components/Common/LoadingSpinner.tsx";
import { MembersTab } from "../../Components/LoggedInHome/Tabs/MembersTab.tsx";

// Lazy load tab components
const GroupChatTab = lazy(
  () => import("../../Components/LoggedInHome/Tabs/GroupChatTab.tsx"),
);

const PrivateChatTab = lazy(
  () => import("../../Components/LoggedInHome/Tabs/PrivateChatTab.tsx"),
);

type TabType = "group" | "members" | "private";

const Tabs = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}) => {
  const tabs = [
    {
      id: "group" as const,
      icon: <HiUserCircle className="mr-2" />,
      label: "Groups",
    },
    {
      id: "members" as const,
      icon: <MdDashboard className="mr-2" />,
      label: "Members",
    },
    {
      id: "private" as const,
      icon: <HiAdjustments className="mr-2" />,
      label: "Private",
    },
  ];

  return (
    <div className="mt-4 flex rounded-md border-b border-gray-200 bg-white">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          data-testid={`${tab.id}-tab-button`}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-1 items-center justify-center px-4 py-3 text-sm font-medium ${
            activeTab === tab.id
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          } transition-colors duration-200`}
        >
          {tab.icon}
          <span className="ml-2">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

const IsLoggedInHome = () => {
  const [activeTab, setActiveTab] = useState<TabType>("group");

  const renderTabContent = () => {
    switch (activeTab) {
      case "group":
        return <GroupChatTab />;
      case "members":
        return <MembersTab />;
      case "private":
        return <PrivateChatTab />;
      default:
        return null;
    }
  };

  return (
    <GroupChatProvider>
      <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-6xl flex-col">
        {/* Tabs Navigation Only */}
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content Area */}
        <div
          className={`flex-1 overflow-y-auto ${activeTab === "group" ? "p-0" : "p-6"}`}
        >
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center">
                  <LoadingSpinner message="Loading..." size="lg" />
                </div>
              }
            >
              {renderTabContent()}
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </GroupChatProvider>
  );
};

export default IsLoggedInHome;
