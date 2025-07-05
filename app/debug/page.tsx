'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [userFromLocalStorage, setUserFromLocalStorage] = useState<any>(null);
  const [userFromAPI, setUserFromAPI] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage
    const storedUserId = localStorage.getItem('worldcoin_user_id');
    const storedUsername = localStorage.getItem('worldcoin_username');
    
    setUserFromLocalStorage({
      userId: storedUserId,
      username: storedUsername
    });

    // Fetch user from API if we have an ID
    if (storedUserId) {
      fetchUserFromAPI(storedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserFromAPI = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        setUserFromAPI(userData);
      } else {
        setError(`API Error: ${response.status} ${response.statusText}`);
      }
    } catch (err: any) {
      setError(`Fetch Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetOnboarding = async () => {
    if (!userFromLocalStorage?.userId) {
      alert('No user ID found in localStorage');
      return;
    }

    try {
      const response = await fetch('/api/reset-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userFromLocalStorage.userId })
      });

      if (response.ok) {
        const result = await response.json();
        alert('Onboarding reset successfully!');
        // Refresh user data
        fetchUserFromAPI(userFromLocalStorage.userId);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LocalStorage Data */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">LocalStorage Data</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(userFromLocalStorage, null, 2)}
            </pre>
          </div>

          {/* API Data */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">API Data</h2>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(userFromAPI, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-4">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 mr-4"
          >
            Clear All localStorage & Reload
          </button>
          
          <button
            onClick={() => {
              localStorage.removeItem('worldtree_quiz_completed');
              localStorage.removeItem('worldtree_onboarding_completed');
              localStorage.removeItem('worldtree_onboarding_skipped');
              window.location.reload();
            }}
            className="bg-yellow-500 text-black px-6 py-2 rounded hover:bg-yellow-600 mr-4"
          >
            Reset Flow (Keep User Data)
          </button>
          
          <button
            onClick={resetOnboarding}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
            disabled={!userFromLocalStorage?.userId}
          >
            Reset Onboarding Status
          </button>
          
          <div className="space-x-4">
            <a 
              href="/quiz" 
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 inline-block"
            >
              Go to Quiz
            </a>
            <a 
              href="/landing" 
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 inline-block"
            >
              Go to Landing
            </a>
          </div>
        </div>

        {/* Console Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Debug Instructions</h3>
          <ol className="list-decimal list-inside space-y-1 text-yellow-700">
            <li>Open your browser&apos;s Developer Tools (F12)</li>
            <li>Go to the Console tab</li>
            <li>Navigate to the quiz page and check for any debug logs</li>
            <li>Look for errors or warnings in the console</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 