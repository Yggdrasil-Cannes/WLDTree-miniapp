"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

export default function Logout() {
  const router = useRouter();
  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <button className="text-gray-500 hover:text-indigo-500" onClick={() => router.back()}>
          <span className="text-2xl">&larr;</span>
        </button>
        <h2 className="text-lg font-bold flex-1 text-center">Log Out</h2>
      </div>
      <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
        <button className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold">Log Out</button>
      </div>
    </div>
  );
} 