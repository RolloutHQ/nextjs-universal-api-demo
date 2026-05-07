"use client";
import { useState, useEffect } from "react";
import {
  getAllUsers,
  getActiveUser,
  setActiveUser,
  createUser,
  deleteUser,
} from "@/lib/userStorage";
import type { UserProfile } from "@/types/resources";

interface UserSelectorProps {
  onUserChange: (user: UserProfile) => void;
}

export default function UserSelector({ onUserChange }: UserSelectorProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeUser, setActiveUserState] = useState<UserProfile | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  function loadUsers() {
    const allUsers = getAllUsers();
    const active = getActiveUser();
    setUsers(allUsers);
    setActiveUserState(active);
  }

  function handleSwitchUser(userId: string) {
    setActiveUser(userId);
    loadUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      onUserChange(user);
    }
    setIsDropdownOpen(false);
  }

  function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    const newUser = createUser(newUserName, newUserEmail);
    loadUsers();
    onUserChange(newUser);
    setIsCreating(false);
    setNewUserName("");
    setNewUserEmail("");
  }

  function handleDeleteUser(userId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this user profile?")) {
      deleteUser(userId);
      loadUsers();
      const newActive = getActiveUser();
      if (newActive) {
        onUserChange(newActive);
      }
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        <span className="text-sm font-medium">
          {activeUser?.name || "No User Selected"}
        </span>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            {users.map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleSwitchUser(user.id)}
              >
                <div className="flex-1">
                  <div className="text-sm font-medium">{user.name}</div>
                  {user.email && <div className="text-xs text-gray-500">{user.email}</div>}
                </div>
                {user.id === activeUser?.id && (
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {users.length > 1 && (
                  <button
                    onClick={(e) => handleDeleteUser(user.id, e)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200">
            <button
              onClick={() => setIsCreating(true)}
              className="w-full px-4 py-2 text-sm text-left text-blue-600 hover:bg-gray-50"
            >
              + Add New User Profile
            </button>
          </div>
        </div>
      )}

      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create User Profile</h2>
            <form onSubmit={handleCreateUser}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Name *"
                  className="w-full p-2 border rounded"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  className="w-full p-2 border rounded"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
