"use client";

import React, { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [secret, setSecret] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first!");
      return;
    }

    // Prepare the form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', caption);
    formData.append('location', location);
    formData.append('date', date || new Date().toISOString());
    formData.append('secret', secret);

    try {
      const response = await fetch('/api/', {
        method: 'POST',
        body: formData,
      });
      console.log("Shivam")
      console.log(response)
      const data = await response.json();
  
      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage(`Upload failed: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Upload Your Photo</h1>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="border-2 border-gray-300 rounded-md p-2 mb-4 w-full max-w-md"
      />
      <input
        type="text"
        placeholder="Enter caption"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="border-2 border-gray-300 rounded-md p-2 mb-4 w-full max-w-md"
      />
      <input
        type="text"
        placeholder="Enter location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="border-2 border-gray-300 rounded-md p-2 mb-4 w-full max-w-md"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border-2 border-gray-300 rounded-md p-2 mb-4 w-full max-w-md"
      />
      <input
        type="text"
        placeholder="Enter secret key"
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
        className="border-2 border-gray-300 rounded-md p-2 mb-4 w-full max-w-md"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Upload
      </button>
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}
