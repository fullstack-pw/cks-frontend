import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../lib/api';
import { useToast } from '../contexts/ToastContext';

export function useTerminal(sessionId) {
    const [terminals, setTerminals] = useState({
        'control-plane': [],
        'worker-node': []
    });
    const [activeTarget, setActiveTarget] = useState('control-plane');
    const [activeTabId, setActiveTabId] = useState(null);
    const [sessionStatus, setSessionStatus] = useState({
        isReady: false,
        isLoading: true,
        message: 'Checking session status...',
        error: null
    });

    const toast = useToast();
    const isMounted = useRef(true);
    const nextIdRef = useRef({ 'control-plane': 1, 'worker-node': 1 });

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (!sessionId) return;

        let cancelled = false;

        const checkSessionStatus = async () => {
            if (cancelled) return;

            try {
                const session = await api.sessions.get(sessionId);

                if (cancelled || !isMounted.current) return;

                if (session.status === 'running') {
                    setSessionStatus({
                        isReady: true,
                        isLoading: false,
                        message: 'Session is ready',
                        error: null
                    });
                } else if (session.status === 'failed') {
                    setSessionStatus({
                        isReady: false,
                        isLoading: false,
                        message: `Session failed: ${session.statusMessage || 'Unknown error'}`,
                        error: session.statusMessage || 'Session failed'
                    });
                } else {
                    setSessionStatus({
                        isReady: false,
                        isLoading: true,
                        message: `Session status: ${session.status}`,
                        error: null
                    });
                }
            } catch (error) {
                if (cancelled || !isMounted.current) return;

                setSessionStatus({
                    isReady: false,
                    isLoading: false,
                    message: 'Unable to check session status',
                    error: error.message || 'Unknown error'
                });
            }
        };

        checkSessionStatus();

        return () => {
            cancelled = true;
        };
    }, [sessionId]);

    const createTerminal = useCallback(async (target) => {
        if (!sessionStatus.isReady) {
            toast.error('Session not ready for terminal creation');
            return null;
        }

        const prefix = target === 'control-plane' ? 'cp' : 'wk';
        const num = nextIdRef.current[target]++;
        const id = `${prefix}-${num}`;

        setTerminals(prev => ({
            ...prev,
            [target]: [...prev[target], { id, url: null, isLoading: true, error: null }]
        }));
        setActiveTabId(id);

        try {
            const result = await api.terminals.create(sessionId, target);

            if (isMounted.current) {
                setTerminals(prev => ({
                    ...prev,
                    [target]: prev[target].map(t =>
                        t.id === id ? { ...t, url: result.terminalUrl, isLoading: false } : t
                    )
                }));
            }

            return id;
        } catch (error) {
            if (isMounted.current) {
                setTerminals(prev => ({
                    ...prev,
                    [target]: prev[target].map(t =>
                        t.id === id ? { ...t, isLoading: false, error: error.message || `Failed to create terminal` } : t
                    )
                }));
                toast.error(`Failed to create ${target} terminal`);
            }
            return null;
        }
    }, [sessionId, sessionStatus.isReady, toast]);

    const switchTarget = useCallback((target) => {
        setActiveTarget(target);

        setTerminals(prev => {
            const tabs = prev[target];
            if (tabs.length > 0) {
                setActiveTabId(tabs[0].id);
            } else if (sessionStatus.isReady) {
                setTimeout(() => createTerminal(target), 0);
            }
            return prev;
        });
    }, [sessionStatus.isReady, createTerminal]);

    const switchTab = useCallback((tabId) => {
        setActiveTabId(tabId);
    }, []);

    const addTerminal = useCallback(() => {
        createTerminal(activeTarget);
    }, [activeTarget, createTerminal]);

    const closeTerminal = useCallback((tabId) => {
        for (const target of ['control-plane', 'worker-node']) {
            setTerminals(prev => {
                const tabs = prev[target];
                const idx = tabs.findIndex(t => t.id === tabId);
                if (idx === -1) return prev;

                const newTabs = tabs.filter(t => t.id !== tabId);

                if (tabId === activeTabId) {
                    if (newTabs.length > 0) {
                        const newIdx = Math.min(idx, newTabs.length - 1);
                        setActiveTabId(newTabs[newIdx].id);
                    } else {
                        setActiveTabId(null);
                    }
                }

                return { ...prev, [target]: newTabs };
            });
        }
    }, [activeTabId]);

    return {
        terminals,
        activeTarget,
        activeTabId,
        sessionStatus,
        createTerminal,
        addTerminal,
        closeTerminal,
        switchTarget,
        switchTab,
        isSessionReady: sessionStatus.isReady
    };
}

export default useTerminal;
