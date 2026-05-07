"use client";
import ResourceTable from "../ResourceTable";
import { Person } from "@/types/resources";

interface PeopleTableProps {
  people: Person[];
  loading: boolean;
  error: string | null;
  onCreateClick: () => void;
}

export default function PeopleTable({
  people,
  loading,
  error,
  onCreateClick,
}: PeopleTableProps) {
  return (
    <ResourceTable
      data={people}
      columns={[
        {
          key: "firstName",
          label: "Name",
          render: (person) => `${person.firstName} ${person.lastName}`,
        },
        { key: "stage", label: "Stage" },
        { key: "source", label: "Source" },
        {
          key: "emails",
          label: "Email",
          render: (person) => person.emails?.[0]?.value || "N/A",
        },
        {
          key: "addresses",
          label: "Location",
          render: (person) =>
            person.addresses?.[0]
              ? `${person.addresses[0].city}, ${person.addresses[0].state}`
              : "N/A",
        },
      ]}
      loading={loading}
      error={error}
      onCreateClick={onCreateClick}
      createButtonLabel="Create New Lead"
      emptyMessage="No people records found."
    />
  );
}
