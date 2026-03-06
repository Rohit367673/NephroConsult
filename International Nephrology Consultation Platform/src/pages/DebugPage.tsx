import React, { useEffect, useState } from 'react';

const DebugPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [cookies, setCookies] = useState<string>('');
  const [localStorageData, setLocalStorageData] = useState<any>({});
  const [sessionStorageData, setSessionStorageData] = useState<any>({});

  useEffect(() => {
    // Get debug logs from sessionStorage
    try {
      const debugLogs = JSON.parse(sessionStorage.getItem('nephro_debug_logs') || '[]');
      setLogs(debugLogs);
    } catch {
      setLogs([]);
    }

    // Get cookies
    setCookies(document.cookie);

    // Get localStorage
    const ls: any = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        ls[key] = localStorage.getItem(key);
      }
    }
    setLocalStorageData(ls);

    // Get sessionStorage
    const ss: any = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        ss[key] = sessionStorage.getItem(key);
      }
    }
    setSessionStorageData(ss);
  }, []);

  const clearAll = () => {
    sessionStorage.removeItem('nephro_debug_logs');
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Logs</h1>
      
      <div className="mb-4">
        <button 
          onClick={clearAll}
          className="bg-red-500 px-4 py-2 rounded mr-2"
        >
          Clear Logs
        </button>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-blue-500 px-4 py-2 rounded"
        >
          Go Home
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Debug Logs (survives redirect)</h2>
        {logs.length === 0 ? (
          <p className="text-gray-400">No logs found</p>
        ) : (
          <div className="bg-gray-800 p-4 rounded overflow-auto max-h-60">
            {logs.map((log, i) => (
              <div key={i} className="border-b border-gray-700 py-1">
                <span className="text-gray-400 text-sm">{log.time}</span>
                <span className="text-yellow-400 ml-2">{log.key}:</span>
                <span className="text-green-400 ml-2">{JSON.stringify(log.value)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Cookies</h2>
        <div className="bg-gray-800 p-4 rounded overflow-auto max-h-40">
          <pre className="text-sm">{cookies || 'No cookies'}</pre>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">localStorage</h2>
        <div className="bg-gray-800 p-4 rounded overflow-auto max-h-40">
          <pre className="text-sm">{JSON.stringify(localStorageData, null, 2)}</pre>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">sessionStorage</h2>
        <div className="bg-gray-800 p-4 rounded overflow-auto max-h-40">
          <pre className="text-sm">{JSON.stringify(sessionStorageData, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;
