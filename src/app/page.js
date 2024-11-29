"use client";

import React, { useState } from "react";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


const client = new S3Client({
  forcePathStyle: true,
  region: "us-west-1",
  endpoint: process.env.NEXT_PUBLIC_SUPABASE_BUCKET_URL,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_SUPABASE_BUCKET_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_SUPABASE_BUCKET_SECRET_ACCESS_KEY,
  },
});

export default function Home() {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first!");
      return;
    }

    try {
      // Prepare the upload command
      const command = new PutObjectCommand({
        Bucket: "photographs",
        Key: `uploads/${file.name}`,
        Body: file,
        ContentType: file.type,
      });

      // Execute the upload
      await client.send(command);
// 

      // Construct the file URL
      const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photographs/uploads/${file.name}`;

      // Store metadata in the Supabase database
      const { data, error } = await supabase
        .from('photos')
        .insert([
          {
            filename: file.name,
            caption,
            location,
            date: date || new Date().toISOString(),
            file_url: fileUrl,
          },
        ]);

      if (error) {
        throw new Error(error.message);
      }

      setMessage("File uploaded and metadata saved successfully!");
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
