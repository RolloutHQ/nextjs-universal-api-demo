"use client";
import { useState } from "react";
import CreateModal from "../CreateModal";
import { CreatePersonInput } from "@/types/resources";

interface CreatePersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePersonInput) => Promise<void>;
}

export default function CreatePersonModal({
  isOpen,
  onClose,
  onSubmit,
}: CreatePersonModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const personData: CreatePersonInput = {
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
    };

    await onSubmit(personData);

    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
    });
    onClose();
  };

  return (
    <CreateModal isOpen={isOpen} onClose={onClose} title="Create New Lead">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="First Name"
            className="w-full p-2 border rounded"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            className="w-full p-2 border rounded"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Street Address"
            className="w-full p-2 border rounded"
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="City"
            className="w-full p-2 border rounded"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="State"
            className="w-full p-2 border rounded"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="ZIP Code"
            className="w-full p-2 border rounded"
            value={formData.zipCode}
            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
            required
          />
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            onClick={onClose}
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
    </CreateModal>
  );
}
