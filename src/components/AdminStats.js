// frontend/components/AdminStats.js
import React from 'react';
import { Card, StatusIndicator } from './common';

const AdminStats = ({ clusterStats, sessionStats }) => {
  if (!clusterStats && !sessionStats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Cluster Stats */}
      {clusterStats && (
        <>
          <Card className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Total Clusters</p>
                <p className="text-2xl font-semibold text-gray-900">{clusterStats.totalClusters}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <StatusIndicator status="connected" size="lg" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Available</p>
                <p className="text-2xl font-semibold text-green-600">{clusterStats.availableClusters}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <StatusIndicator status="pending" size="lg" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Locked</p>
                <p className="text-2xl font-semibold text-yellow-600">{clusterStats.lockedClusters}</p>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Session Stats */}
      {sessionStats && (
        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Active Sessions</p>
              <p className="text-2xl font-semibold text-indigo-600">{sessionStats.totalSessions}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminStats;