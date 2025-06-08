// frontend/components/AdminSessionTable.js
import React, { useState } from 'react';
import { Card, Button, StatusIndicator, LoadingState, ConfirmationModal } from './common';

const AdminSessionTable = ({ sessions, isLoading, onDeleteSession }) => {
  const [deletingSessionId, setDeletingSessionId] = useState(null);
  const [confirmDeleteSession, setConfirmDeleteSession] = useState(null);

  if (isLoading) {
    return <LoadingState message="Loading sessions..." />;
  }

  if (!sessions || !sessions.sessions || sessions.sessions.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-gray-500">No active sessions found.</p>
      </Card>
    );
  }

  const handleDeleteClick = (session) => {
    setConfirmDeleteSession(session);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteSession) return;

    setDeletingSessionId(confirmDeleteSession.id);
    try {
      await onDeleteSession(confirmDeleteSession.id);
    } catch (error) {
      console.error('Failed to delete session:', error);
    } finally {
      setDeletingSessionId(null);
      setConfirmDeleteSession(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'connected';
      case 'provisioning': return 'loading';
      case 'failed': return 'failed';
      default: return 'pending';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const diffMs = now - start;
    const diffMins = Math.floor(diffMs / 1000 / 60);

    if (diffMins < 60) {
      return `${diffMins}m`;
    }
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m`;
  };

  const getTimeRemaining = (expirationTime) => {
    const now = new Date();
    const expiry = new Date(expirationTime);
    const diffMs = Math.max(0, expiry - now);
    const diffMins = Math.floor(diffMs / 1000 / 60);

    if (diffMins <= 0) {
      return 'Expired';
    }

    if (diffMins < 60) {
      return `${diffMins}m`;
    }
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m`;
  };

  return (
    <>
      <Card>
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Active Sessions</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scenario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cluster
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Left
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Terminals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tasks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.sessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {session.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusIndicator
                      status={getStatusColor(session.status)}
                      label={session.status}
                      size="sm"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.scenarioId || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {session.assignedCluster}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDuration(session.startTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={getTimeRemaining(session.expirationTime) === 'Expired' ? 'text-red-600 font-medium' : ''}>
                      {getTimeRemaining(session.expirationTime)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Object.keys(session.activeTerminals || {}).length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.tasks ? (
                      <div className="flex items-center space-x-1">
                        <span>{session.tasks.filter(t => t.status === 'completed').length}/{session.tasks.length}</span>
                        <div className="w-8 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{
                              width: `${(session.tasks.filter(t => t.status === 'completed').length / session.tasks.length) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteClick(session)}
                      disabled={deletingSessionId === session.id}
                      isLoading={deletingSessionId === session.id}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete confirmation modal */}
      <ConfirmationModal
        isOpen={!!confirmDeleteSession}
        onClose={() => setConfirmDeleteSession(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Session"
        message={confirmDeleteSession ?
          `Are you sure you want to delete session ${confirmDeleteSession.id}? This will permanently destroy the lab environment and cannot be undone.` : ''
        }
        confirmText="Delete Session"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};

export default AdminSessionTable;