import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AlertCircle } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Persistent Left Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        <Header collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* Prototype & Government Disclaimer Banner */}
        <div className="bg-blue-50/80 border-b border-blue-100 px-6 py-2 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              <strong>Administrative Monitoring Console:</strong> Restricted to authorized AICTE officials & Bureaus. Cross-Bureau Overlap Detection is active.
            </span>
          </div>
          <span className="hidden sm:inline bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            SIH 2026 Prototype · Demo Mode
          </span>
        </div>

        {/* Dynamic Route Content */}
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

