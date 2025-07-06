"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { encryptCsv } from "@/lib/encryptCsv";
import { useRouter } from "next/navigation";

export default function GenealogyUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"drop" | "password" | "processing">("drop");
  const [log, setLog] = useState<string[]>([]);
  const router = useRouter();

  function logStep(msg: string) {
    setLog((prev) => [...prev, msg]);
    console.log(msg);
  }

  function handleFileDrop(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    console.log("File dropped:", f?.name, "Type:", f?.type, "Size:", f?.size);
    if (f && (f.type === "text/plain" || f.type === "text/csv" || f.name.endsWith('.csv'))) {
      setFile(f);
      setStep("password");
      logStep(`File selected: ${f.name} (${f.type}) - ${(f.size / 1024).toFixed(1)}KB`);
    } else {
      logStep("Please upload a .txt or .csv file only.");
    }
  }

  function handleSkipUpload() {
    logStep("Skipping genealogy upload - proceeding to quiz");
    localStorage.setItem('worldtree_genealogy_uploaded', 'skipped');
    setTimeout(() => router.push("/quiz"), 500);
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) {
      logStep("Password required.");
      return;
    }
    if (!file) {
      logStep("No file selected.");
      return;
    }
    setStep("processing");
    logStep("Reading file...");
    try {
      const fullText = await file.text();
      let text = fullText;
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        const lines = fullText.split('\n');
        const limitedLines = lines.slice(0, 2000);
        text = limitedLines.join('\n');
        logStep(`File exceeded 10MB: ${(file.size / 1024 / 1024).toFixed(1)}MB. Only first 2000 lines will be encrypted and uploaded.`);
      } else {
        logStep(`File processed: ${fullText.split('\n').length} lines, size ${(file.size / 1024).toFixed(1)}KB`);
      }
      logStep("Encrypting file...");
      const encrypted = await encryptCsv(text, password);
      const response = await fetch(`https://publisher.testnet.walrus.atalma.io/v1/blobs?epochs=5`, {
        method: 'PUT',
        body: encrypted,
      });
      console.log(response)
      logStep("Upload successful! Redirecting to quiz...");
      localStorage.setItem('data', encrypted);
      setTimeout(() => router.push("/quiz"), 1200);
    } catch (err: any) {
      logStep(`Error: ${err.message || err}`);
      setStep("password");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-blue-900 to-black px-4">
      <div className="w-full max-w-lg bg-black/70 rounded-2xl shadow-xl p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Upload Your Genealogy Data</h1>
        <p className="text-gray-300 mb-8 text-center">Drop your genealogy .txt or .csv file (max 10MB, first 2000 lines) to securely encrypt and store your family data before starting the quiz. You can also skip this step and do it later.</p>
        {step === "drop" && (
          <>
            <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-xl py-12 cursor-pointer bg-black/30 hover:bg-blue-900/20 transition mb-6">
              <span className="text-lg text-blue-300 mb-2">Click or drag a .txt or .csv file here</span>
              <input type="file" accept=".txt,.csv" className="hidden" onChange={handleFileDrop} />
            </label>
            <div className="w-full flex flex-col gap-3">
              <div className="text-center text-gray-400 text-sm mb-2">or</div>
              <button
                onClick={handleSkipUpload}
                className="w-full py-3 rounded-lg bg-gray-700 text-gray-300 font-semibold text-lg hover:bg-gray-600 transition border border-gray-600"
              >
                Do it later
              </button>
            </div>
          </>
        )}
        {step === "password" && file && (
          <form onSubmit={handlePasswordSubmit} className="w-full flex flex-col items-center">
            <div className="mb-4 w-full">
              <label className="block text-gray-200 mb-2 text-left" htmlFor="password">Encryption Password</label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-blue-400"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter a password to encrypt your data"
                required
              />
            </div>
            <div className="w-full flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep("drop");
                  setFile(null);
                  setPassword("");
                }}
                className="flex-1 py-3 rounded-lg bg-gray-700 text-gray-300 font-semibold text-lg hover:bg-gray-600 transition border border-gray-600"
              >
                Back
              </button>
              <button type="submit" className="flex-1 py-3 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold text-lg hover:from-green-600 hover:to-blue-600 transition">Encrypt & Upload</button>
            </div>
          </form>
        )}
        {step === "processing" && (
          <div className="flex flex-col items-center mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <span className="text-blue-300">Processing your file...</span>
          </div>
        )}
        <div className="mt-8 w-full">
          <h2 className="text-lg text-white mb-2">Logs</h2>
          <div className="bg-gray-900 rounded-lg p-3 text-xs text-gray-400 h-32 overflow-y-auto">
            {log.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
} 
