"use client";
import { useState, useEffect } from "react";
import { RolloutLinkProvider, CredentialsManager } from "@rollout/link-react";
import "@rollout/link-react/style.css";

// Components
import ResourceTabs, { ResourceType } from "./components/ResourceTabs";
import PeopleTable from "./components/people/PeopleTable";
import CreatePersonModal from "./components/people/CreatePersonModal";
import TasksTable from "./components/tasks/TasksTable";
import CreateTaskModal from "./components/tasks/CreateTaskModal";
import EmailsTable from "./components/emails/EmailsTable";

// Types
import type {
  Person,
  CreatePersonInput,
  Task,
  CreateTaskInput,
  ClozeMessage,
} from "@/types/resources";

export default function Home() {
  // Core state
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [credentialId, setCredentialId] = useState<string | null>(null);
  const [clozeApiKey, setClozeApiKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ResourceType>("people");

  // People state
  const [people, setPeople] = useState<Person[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [peopleError, setPeopleError] = useState<string | null>(null);
  const [isPeopleModalOpen, setIsPeopleModalOpen] = useState(false);

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);

  // Emails state
  const [emails, setEmails] = useState<ClozeMessage[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [emailsError, setEmailsError] = useState<string | null>(null);

  // Initialize user on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = crypto.randomUUID();
      localStorage.setItem('userId', newUserId);
      setUserId(newUserId);
    }

    // Load Cloze API key from localStorage
    const storedClozeApiKey = JSON.parse(localStorage.getItem("cloze-api-key"))?.[0].data.apiKey;
    if (storedClozeApiKey) {
      setClozeApiKey(storedClozeApiKey);
    }
  }, []);

  // Get token when user changes
  useEffect(() => {
    if (userId) {
      getToken();
    }
  }, [userId]);

  // Fetch credentials when token is ready
  useEffect(() => {
    if (userId && token) {
      fetchCredentials();
    }
  }, [token, userId]);

  // Fetch active tab data when credentialId and tab changes
  useEffect(() => {
    if (credentialId && token) {
      fetchActiveTabData();
    }
  }, [credentialId, token, activeTab]);

  async function getToken() {
    if (!userId) return;

    try {
      const response = await fetch(`/api/rollout-token?userId=${userId}`);
      const data = await response.json();
      setToken(data.token || data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch rollout token");
      setLoading(false);
    }
  }

  async function fetchCredentials() {
    if (!token) return;

    try {
      const response = await fetch("https://universal.rollout.com/api/credentials", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data && data.length > 0) {
        const lastCredential = data[0];
        if (lastCredential && lastCredential.id) {
          setCredentialId(lastCredential.id);
        }
      }
    } catch (error) {
      console.error("Error fetching credentials:", error);
    }
  }

  function fetchActiveTabData() {
    switch (activeTab) {
      case "people":
        fetchPeople();
        break;
      case "tasks":
        fetchTasks();
        break;
      case "timeline":
        fetchEmails();
        break;
    }
  }

  // People handlers
  async function fetchPeople(retryCount = 0, maxRetries = 3) {
    setPeopleLoading(true);
    setPeopleError(null);

    try {
      const response = await fetch("/api/people", {
        headers: {
          "Content-Type": "application/json",
          "X-Rollout-Token": token!,
          "X-Credential-Id": credentialId!,
        },
      });

      if (response.status === 409 && retryCount < maxRetries) {
        setPeopleError("Data not ready. Retrying...");
        await new Promise(resolve => setTimeout(resolve, 30000));
        return fetchPeople(retryCount + 1, maxRetries);
      }

      if (!response.ok) {
        throw new Error("Failed to fetch people data");
      }

      const data = await response.json();
      setPeople(data.people || []);
    } catch (err: any) {
      setPeopleError(err.message);
    } finally {
      if (retryCount === 0) {
        setPeopleLoading(false);
      }
    }
  }

  async function createPerson(data: CreatePersonInput) {
    try {
      const response = await fetch("/api/people", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Rollout-Token": token!,
          "X-Credential-Id": credentialId!,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        fetchPeople();
      }
    } catch (error) {
      console.error("Error creating person:", error);
    }
  }

  // Tasks handlers
  async function fetchTasks(retryCount = 0, maxRetries = 3) {
    setTasksLoading(true);
    setTasksError(null);

    try {
      const response = await fetch("/api/tasks", {
        headers: {
          "Content-Type": "application/json",
          "X-Rollout-Token": token!,
          "X-Credential-Id": credentialId!,
        },
      });

      if (response.status === 409 && retryCount < maxRetries) {
        setTasksError("Data not ready. Retrying...");
        await new Promise((resolve) => setTimeout(resolve, 30000));
        return fetchTasks(retryCount + 1, maxRetries);
      }

      if (!response.ok) {
        throw new Error("Failed to fetch tasks data");
      }

      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err: any) {
      setTasksError(err.message);
    } finally {
      if (retryCount === 0) {
        setTasksLoading(false);
      }
    }
  }

  async function createTask(data: CreateTaskInput) {
    try {
      const apiData = JSON.parse(localStorage.getItem("cloze-api-key"))?.[0].data;
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Rollout-Token": token!,
          "X-Credential-Id": credentialId!,
          "X-CLOZE-API-Key": apiData.apiKey,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  }

  // Emails handlers
  async function fetchEmails() {
    if (!clozeApiKey) {
      setEmailsError("No Cloze API key available. Please connect your Cloze account.");
      return;
    }

    setEmailsLoading(true);
    setEmailsError(null);

    try {
      const response = await fetch("/api/emails", {
        headers: {
          "Content-Type": "application/json",
          "X-Rollout-Token": token!,
          "X-Cloze-Api-Key": clozeApiKey,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch emails");
      }

      const data = await response.json();
      // Extract messages array from the response
      const messages = data.messages || [];
      // Map messages to add id field for the table
      const messagesWithId = messages.map((msg: any) => ({
        ...msg,
        id: msg.message, // Use message field as id
      }));
      setEmails(messagesWithId);
    } catch (err: any) {
      setEmailsError(err.message);
    } finally {
      setEmailsLoading(false);
    }
  }

  const handleCredentialAdded = async ({ id, appKey }: any) => {
    console.log({id, appKey});
    setCredentialId(id);

    // Fetch credential details
    if (token && appKey) {
      try {
        const response = await fetch(`/api/credentials?appKey=${appKey}&includeData=true`, {
          headers: {
            "Content-Type": "application/json",
            "X-Rollout-Token": token,
          },
        });

        if (response.ok) {
          const credentialData = await response.json();
          localStorage.setItem(appKey, JSON.stringify(credentialData));

          // If it's Cloze, extract and store the API key
          if (appKey.includes("cloze-api-key") && credentialData && credentialData.length > 0) {
            const apiKey = credentialData[0]?.data?.apiKey;
            if (apiKey) {
              setClozeApiKey(apiKey);
              localStorage.setItem("cloze-api-key", apiKey);
            }
          }
        } else {
          console.error("Failed to fetch credential details");
        }
      } catch (error) {
        console.error("Error fetching credential details:", error);
      }
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <p className="text-gray-500">Loading token...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <p className="text-red-500">No token available</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Rollout Universal API Demo</h1>
        </div>

        {/* Rollout Link Provider */}
        <RolloutLinkProvider token={token}>
          <CredentialsManager
            apiCategories={{ crm: true }}
            onCredentialAdded={handleCredentialAdded}
          />
        </RolloutLinkProvider>

        {credentialId && (
          <>
            {/* Resource Tabs */}
            <div className="mt-8">
              <ResourceTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* Tab Content */}
            <div className="mt-8">
              {activeTab === "people" && (
                <>
                  <PeopleTable
                    people={people}
                    loading={peopleLoading}
                    error={peopleError}
                    onCreateClick={() => setIsPeopleModalOpen(true)}
                  />
                  <CreatePersonModal
                    isOpen={isPeopleModalOpen}
                    onClose={() => setIsPeopleModalOpen(false)}
                    onSubmit={createPerson}
                  />
                </>
              )}

              {activeTab === "tasks" && (
                <>
                  <TasksTable
                    tasks={tasks}
                    loading={tasksLoading}
                    error={tasksError}
                    onCreateClick={() => setIsTasksModalOpen(true)}
                  />
                  <CreateTaskModal
                    isOpen={isTasksModalOpen}
                    onClose={() => setIsTasksModalOpen(false)}
                    onSubmit={createTask}
                  />
                </>
              )}

              {activeTab === "timeline" && (
                <>
                  <EmailsTable
                    emails={emails}
                    loading={emailsLoading}
                    error={emailsError}
                  />
                  <TasksTable
                    tasks={tasks}
                    loading={tasksLoading}
                    error={tasksError}
                    onCreateClick={() => setIsTasksModalOpen(true)}
                  />
                  <CreateTaskModal
                    isOpen={isTasksModalOpen}
                    onClose={() => setIsTasksModalOpen(false)}
                    onSubmit={createTask}
                  />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
