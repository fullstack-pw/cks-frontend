// frontend/pages/_app.js

import React from 'react';
import '../styles/globals.css';
import { SessionProvider } from '../contexts/SessionContext';
import { ToastProvider } from '../contexts/ToastContext';
import Layout from '../components/Layout';

function MyApp({ Component, pageProps, apiBaseUrl }) {
    // Check if layout should be hidden (for lab environment)
    const hideHeader = Component.hideHeader || false;

    // Get custom layout if provided
    const getLayout = Component.getLayout || ((page) => page);

    return (
        <>
            {/* Inject API URL for client-side use */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
            // Set initial value
            window.__API_BASE_URL__ = ${JSON.stringify(apiBaseUrl)};
            console.log('[DEBUG] Initial injection:', window.__API_BASE_URL__);
            
            // Create a trap to detect overwrites
            let _apiUrl = ${JSON.stringify(apiBaseUrl)};
            Object.defineProperty(window, '__API_BASE_URL__', {
                get: function() {
                    return _apiUrl;
                },
                set: function(value) {
                    console.log('[DEBUG] API_BASE_URL being changed from:', _apiUrl, 'to:', value);
                    console.trace();
                    _apiUrl = value;
                }
            });
        `
                }}
            />
            <ToastProvider>
                <SessionProvider>
                    <Layout hideHeader={hideHeader}>
                        {getLayout(<Component {...pageProps} />)}
                    </Layout>
                </SessionProvider>
            </ToastProvider>
        </>
    );
}

MyApp.getInitialProps = async () => {
    // Read API_BASE_URL from server environment at runtime
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8080/api/v1';

    return {
        apiBaseUrl
    };
};


export default MyApp;