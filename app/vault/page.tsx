"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// Country to region mapping (partial, can be extended)
const countryRegionMap: Record<string, string> = {
  "France": "Europe",
  "Germany": "Europe",
  "United Kingdom": "Europe",
  "Nigeria": "Africa",
  "South Africa": "Africa",
  "United States": "North America",
  "USA": "North America",
  "Canada": "North America",
  "Brazil": "LATAM",
  "Argentina": "LATAM",
  "Vietnam": "SEA",
  "China": "Asia",
  "India": "Asia",
  "Japan": "Asia",
  // ... add more as needed
};

// List of countries (shortened for brevity, should be extended for production)
const countries = [
  "Select your country",
  "United States",
  "United Kingdom",
  "France",
  "Germany",
  "Nigeria",
  "South Africa",
  "Brazil",
  "Argentina",
  "Vietnam",
  "China",
  "India",
  "Japan",
  "Other"
];

export default function VaultPage() {
  const router = useRouter();
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setCountry(selected);
    setRegion(countryRegionMap[selected] || "World");
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
  };

  const canProceed = country && country !== "Select your country" && city;

  return (
    <motion.div
      className="p-4 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <motion.h2
        className="text-2xl font-bold mb-4 text-pink-600 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Customize Your AI Journey
      </motion.h2>
      <div className="text-xl font-semibold mb-6 text-center">Where do you live?</div>
      <div className="flex flex-col items-center gap-4">
        <select
          className="border rounded px-4 py-2 w-72"
          value={country}
          onChange={handleCountryChange}
        >
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          className="border rounded px-4 py-2 w-72"
          type="text"
          placeholder="Enter your city (optional)"
          value={city}
          onChange={handleCityChange}
        />
        {country && country !== "Select your country" && (
          <div className="mt-4 text-lg font-medium text-purple-700 text-center">
            {`Welcome to the ${region} AI Hunter Tribe!`}
          </div>
        )}
        <button
          className={`mt-6 px-6 py-2 bg-purple-500 text-white rounded-xl font-bold shadow transition-all focus:ring-2 focus:ring-purple-400 focus:outline-none w-72 ${canProceed ? 'hover:bg-purple-600' : 'opacity-50 cursor-not-allowed'}`}
          disabled={!canProceed}
          onClick={() => router.push('/dashboard')}
        >
          Next →
        </button>
      </div>
    </motion.div>
  );
} 