"use client";
import ResourceTable from "../ResourceTable";
import { ClozeMessage } from "@/types/resources";

interface EmailsTableProps {
  emails: ClozeMessage[];
  loading: boolean;
  error: string | null;
}

// Helper to extract browser/device info from user agent
function getBrowserInfo(agent?: string): string {
  if (!agent) return "-";

  if (agent.includes("Chrome")) return "Chrome";
  if (agent.includes("Firefox")) return "Firefox";
  if (agent.includes("Safari")) return "Safari";
  if (agent.includes("Edge")) return "Edge";
  if (agent.includes("Mobile")) return "Mobile";
  if (agent.includes("GoogleImageProxy")) return "Gmail";

  return agent.substring(0, 30) + "...";
}

// Helper to get total number of individual opens
function getTotalOpens(email: ClozeMessage): number {
  if (!email.opens || email.opens.length === 0) return 0;

  return email.opens.reduce((total, open) => {
    return total + (open.breakdown?.length || 0);
  }, 0);
}

export default function EmailsTable({
  emails,
  loading,
  error,
}: EmailsTableProps) {
  return (
    <ResourceTable
      data={emails}
      columns={[
        {
          key: "message",
          label: "Message",
          render: (email) => (
            <a
              href={email.message}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View
            </a>
          )
        },
        {
          key: "date",
          label: "Sent",
          render: (email) => {
            if (!email.date) return "-";
            const date = new Date(email.date);
            return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
        },
        {
          key: "opens",
          label: "Opens",
          render: (email) => {
            const totalOpens = getTotalOpens(email);
            const recipients = email.opens?.length || 0;

            if (totalOpens === 0) return "Not opened";
            if (recipients === 1) return `${totalOpens} ${totalOpens === 1 ? 'time' : 'times'}`;
            return `${totalOpens} times by ${recipients} ${recipients === 1 ? 'recipient' : 'recipients'}`;
          }
        },
        {
          key: "lastOpen",
          label: "Last Opened",
          render: (email) => {
            if (!email.opens || email.opens.length === 0) return "-";

            const lastOpenTimestamp = email.opens[0]?.about?.last;
            if (!lastOpenTimestamp) return "-";

            const lastOpen = new Date(lastOpenTimestamp);
            const now = new Date();
            const diffMs = now.getTime() - lastOpen.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;

            return lastOpen.toLocaleDateString();
          }
        },
        {
          key: "device",
          label: "Device/Location",
          render: (email) => {
            if (!email.opens || email.opens.length === 0) return "-";

            const firstOpen = email.opens[0];
            const browser = getBrowserInfo(firstOpen?.about?.agent);
            const ip = firstOpen?.about?.ip;

            if (browser && ip) return `${browser} (${ip})`;
            if (browser) return browser;
            if (ip) return ip;

            return "-";
          }
        },
      ]}
      loading={loading}
      error={error}
      emptyMessage="No messages found."
      title="Mail Tracker"
    />
  );
}
