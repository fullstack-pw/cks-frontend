import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../lib/api';
import { useToast } from '../contexts/ToastContext';

export function useTerminal(sessionId) {
    const [terminals, setTerminals] = useState({
        'control-plane': { url: null, isLoading: false, error: null },
        'worker-node': { url: null, isLoading: false, error: null }
    });
    const [activeTerminal, setActiveTerminal] = useState('control-plane');
    const [sessionStatus, setSessionStatus] = useState({
        isReady: false,
        isLoading: true,
        message: 'Checking session status...',
        error: null
    });

    const toast = useToast();
    const isMounted = useRef(true);

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

        if (terminals[target].isLoading) {
            return null;
        }

        try {
            setTerminals(prev => ({
                ...prev,
                [target]: { ...prev[target], isLoading: true, error: null }
            }));

            const result = await api.terminals.create(sessionId, target);

            if (isMounted.current) {
                setTerminals(prev => ({
                    ...prev,
                    [target]: {
                        url: result.terminalUrl,
                        isLoading: false,
                        error: null
                    }
                }));

                return result.terminalUrl;
            }
        } catch (error) {
            if (isMounted.current) {
                setTerminals(prev => ({
                    ...prev,
                    [target]: {
                        ...prev[target],
                        isLoading: false,
                        error: error.message || `Failed to create terminal for ${target}`
                    }
                }));
                toast.error(`Failed to create ${target} terminal`);
            }
            return null;
        }
    }, [sessionId, sessionStatus.isReady, terminals, toast]);

    const switchTerminal = useCallback((target) => {
        setActiveTerminal(target);

        if (sessionStatus.isReady && !terminals[target].url && !terminals[target].isLoading) {
            createTerminal(target);
        }
    }, [sessionStatus.isReady, terminals, createTerminal]);

    return {
        terminals,
        activeTerminal,
        sessionStatus,
        createTerminal,
        switchTerminal,
        isSessionReady: sessionStatus.isReady
    };
}

export default useTerminal;
