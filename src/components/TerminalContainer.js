import React from 'react';
import Terminal from './Terminal';
import { Button, LoadingState, ErrorState } from './common';
import { useTerminal } from '../hooks/useTerminal';

const formatTabLabel = (id) => {
    const [prefix, num] = id.split('-');
    return `${prefix === 'cp' ? 'CP' : 'WK'} ${num}`;
};

const TerminalContainer = ({ sessionId }) => {
    const {
        terminals,
        activeTarget,
        activeTabId,
        sessionStatus,
        createTerminal,
        addTerminal,
        closeTerminal,
        switchTarget,
        switchTab,
        isSessionReady
    } = useTerminal(sessionId);

    const activeTabs = terminals[activeTarget];

    return (
        <div className="h-full flex flex-col">
            <div className="bg-gray-800 px-4 py-2 text-white flex overflow-x-auto">
                <Button
                    variant={activeTarget === 'control-plane' ? 'primary' : 'secondary'}
                    onClick={() => switchTarget('control-plane')}
                    disabled={!isSessionReady}
                    className={`mr-2 flex items-center ${!isSessionReady ? 'opacity-50' : ''}`}
                >
                    Control Plane
                </Button>

                <Button
                    variant={activeTarget === 'worker-node' ? 'primary' : 'secondary'}
                    onClick={() => switchTarget('worker-node')}
                    disabled={!isSessionReady}
                    className={`flex items-center ${!isSessionReady ? 'opacity-50' : ''}`}
                >
                    Worker Node
                </Button>
            </div>

            {isSessionReady && activeTabs.length > 0 && (
                <div className="bg-gray-700 px-2 py-1 flex items-center overflow-x-auto gap-1">
                    {activeTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => switchTab(tab.id)}
                            className={`flex items-center px-3 py-1 text-xs rounded transition-colors ${
                                tab.id === activeTabId
                                    ? 'bg-gray-600 text-white'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-600'
                            }`}
                        >
                            <span>{formatTabLabel(tab.id)}</span>
                            {activeTabs.length > 1 && (
                                <span
                                    onClick={(e) => { e.stopPropagation(); closeTerminal(tab.id); }}
                                    className="ml-2 hover:text-red-400 cursor-pointer"
                                >
                                    x
                                </span>
                            )}
                        </button>
                    ))}
                    <button
                        onClick={addTerminal}
                        className="px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors"
                    >
                        +
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-hidden relative">
                {!isSessionReady && (
                    <div className="flex flex-col justify-center items-center h-full bg-gray-800 text-white p-4">
                        {sessionStatus.isLoading ? (
                            <LoadingState message={sessionStatus.message} size="md" />
                        ) : (
                            <>
                                <p className="text-center mb-2">{sessionStatus.message}</p>
                                {sessionStatus.error && (
                                    <ErrorState
                                        message="Failed to prepare environment"
                                        details={sessionStatus.error}
                                        onRetry={() => window.location.reload()}
                                    />
                                )}
                            </>
                        )}
                    </div>
                )}

                {isSessionReady && (
                    <>
                        {['control-plane', 'worker-node'].map(target =>
                            terminals[target].map(tab => (
                                <div
                                    key={tab.id}
                                    className={`absolute inset-0 transition-opacity duration-200 ${
                                        tab.id === activeTabId
                                            ? 'opacity-100 z-10'
                                            : 'opacity-0 z-0 pointer-events-none'
                                    }`}
                                >
                                    {tab.url ? (
                                        <Terminal terminalUrl={tab.url} />
                                    ) : (
                                        <div className="flex flex-col justify-center items-center h-full bg-gray-800 text-white p-4">
                                            {tab.isLoading ? (
                                                <LoadingState message="Creating terminal session..." size="md" />
                                            ) : tab.error ? (
                                                <ErrorState
                                                    message="Failed to create terminal"
                                                    details={tab.error}
                                                    onRetry={() => createTerminal(target)}
                                                />
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}

                        {activeTabs.length === 0 && (
                            <div className="flex flex-col justify-center items-center h-full bg-gray-800 text-white p-4">
                                <Button
                                    variant="primary"
                                    onClick={() => createTerminal(activeTarget)}
                                >
                                    Connect to {activeTarget === 'control-plane' ? 'Control Plane' : 'Worker Node'}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default React.memo(TerminalContainer);
