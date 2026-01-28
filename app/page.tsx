"use client";
import { useState, useEffect } from "react";
import { RolloutLinkProvider, CredentialsManager } from "@rollout/link-react";
import "@rollout/link-react/style.css";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [credentialId, setCredentialId] = useState(null);
  const [people, setPeople] = useState([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [peopleError, setPeopleError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = crypto.randomUUID();
      localStorage.setItem('userId', newUserId);
      setUserId(newUserId);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      getToken();
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetch('https://universal.rollout.com/api/credentials', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data && data.length > 0) {
            const lastCredential = data[0];
            if (lastCredential && lastCredential.id) {
              setCredentialId(lastCredential.id);
            }
          }
          // Handle the response data here
          console.log(data);
        })
        .catch(error => {
          console.error('Error fetching credentials:', error);
        });
    }
  }, [token]);


  useEffect(() => {
    if (credentialId && token) {
      fetchPeople();
    }
  }, [credentialId, token]);

  async function getToken() {
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

  async function fetchPeople(retryCount = 0, maxRetries = 3) {
    setPeopleLoading(true);
    setPeopleError(null);
    try {
      const response = await fetch("/api/people", {
        headers: {
          "Content-Type": "application/json",
          "X-Rollout-Token": token!, // Pass token as a custom header
          "X-Credential-Id": credentialId!, // Pass credentialId as a custom header
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
      setPeople(data.people);
    } catch (err) {
      setPeopleError(err.message);
    } finally {
      if (retryCount === 0) {
        setPeopleLoading(false);
      }
    }
  }

  const handleCredentialAdded = async ({ id, appKey }) => {
    console.log(id, appKey);
    setCredentialId(id);
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
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-[600px] w-full">
        <RolloutLinkProvider token={token}>
          <CredentialsManager
            apiCategories={{ crm: true }}
            onCredentialAdded={handleCredentialAdded}
          />
        </RolloutLinkProvider>

        {credentialId && (
          <>
            {/* Add this button above the table */}
            <div className="flex justify-end mt-16">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Create New Lead
              </button>
            </div>

            {/* Add the new lead modal */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h2 className="text-xl font-semibold mb-4">
                    Create New Lead
                  </h2>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        const response = await fetch("/api/people", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "X-Rollout-Token": token!,
                            "X-Credential-Id": credentialId!,
                          },
                          body: JSON.stringify({
                            firstName: formData.firstName,
                            lastName: formData.lastName,
                            emails: [{ value: formData.email }],
                            addresses: [
                              {
                                street: formData.street,
                                city: formData.city,
                                state: formData.state,
                                code: formData.zipCode,
                              },
                            ],
                          }),
                        });

                        if (response.ok) {
                          setIsModalOpen(false);
                          fetchPeople(); // Refresh the list
                        }
                      } catch (error) {
                        console.error("Error creating lead:", error);
                      }
                    }}
                  >
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="First Name"
                        className="w-full p-2 border rounded"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        required
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        className="w-full p-2 border rounded"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-2 border rounded"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                      <input
                        type="text"
                        placeholder="Street Address"
                        className="w-full p-2 border rounded"
                        value={formData.street}
                        onChange={(e) =>
                          setFormData({ ...formData, street: e.target.value })
                        }
                        required
                      />
                      <input
                        type="text"
                        placeholder="City"
                        className="w-full p-2 border rounded"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        required
                      />
                      <input
                        type="text"
                        placeholder="State"
                        className="w-full p-2 border rounded"
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                        required
                      />
                      <input
                        type="text"
                        placeholder="ZIP Code"
                        className="w-full p-2 border rounded"
                        value={formData.zipCode}
                        onChange={(e) =>
                          setFormData({ ...formData, zipCode: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Create Lead
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}


            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">People Records</h2>

              {peopleLoading && (
                <p className="text-gray-500">Loading people data...</p>
              )}

              {peopleError && (
                <p className="text-red-500">Error: {peopleError}</p>
              )}

              {!peopleLoading && !peopleError && people.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th className="p-2 text-left border border-gray-200">
                          Name
                        </th>
                        <th className="p-2 text-left border border-gray-200">
                          Stage
                        </th>
                        <th className="p-2 text-left border border-gray-200">
                          Source
                        </th>
                        <th className="p-2 text-left border border-gray-200">
                          Email
                        </th>
                        <th className="p-2 text-left border border-gray-200">
                          Location
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {people.map((person) => (
                        <tr
                          key={person.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="p-2 border border-gray-200">
                            {person.firstName} {person.lastName}
                          </td>
                          <td className="p-2 border border-gray-200">
                            {person.stage}
                          </td>
                          <td className="p-2 border border-gray-200">
                            {person.source}
                          </td>
                          <td className="p-2 border border-gray-200">
                            {person.emails?.[0]?.value || "N/A"}
                          </td>
                          <td className="p-2 border border-gray-200">
                            {person.addresses?.[0]
                              ? `${person.addresses[0].city}, ${person.addresses[0].state}`
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!peopleLoading && !peopleError && people.length === 0 && (
                <p className="text-gray-500">No people records found.</p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
