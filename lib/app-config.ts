// Config để toggle giữa demo và production mode
export const APP_CONFIG = {
    // Chuyển từ 'demo' sang 'production' để test thực tế
    MODE: process.env.NODE_ENV === 'production' ? 'production' : (process.env.APP_MODE || 'demo'),

    // Database configuration
    DATABASE: {
        URL: process.env.DATABASE_URL,
        USE_REAL_DB: process.env.APP_MODE === 'production' || process.env.USE_REAL_DB === 'true'
    },

    // Email configuration  
    EMAIL: {
        USE_REAL_SMTP: process.env.APP_MODE === 'production' || process.env.USE_REAL_SMTP === 'true'
    },

    // Development helpers
    DEV: {
        ENABLE_LOGGING: true,
        MOCK_SLOW_RESPONSES: false,
        SHOW_DEBUG_INFO: process.env.NODE_ENV === 'development'
    }
}

// Client-side mode detection
export const getClientMode = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('APP_MODE') || 'Demo';
    }
    return 'demo';
}

// Helper functions
export const isProductionMode = () => {
    if (typeof window !== 'undefined') {
        return getClientMode() === 'Production';
    }
    return APP_CONFIG.MODE === 'Production';
}

export const isDemoMode = () => {
    if (typeof window !== 'undefined') {
        return getClientMode() === 'Demo';
    }
    return APP_CONFIG.MODE === 'demo';
}

export const shouldUseRealDatabase = () => {
    if (typeof window !== 'undefined') {
        return getClientMode() === 'Production' || localStorage.getItem('USE_REAL_DB') === 'true';
    }
    return APP_CONFIG.DATABASE.USE_REAL_DB;
}

export const shouldUseRealSMTP = () => {
    if (typeof window !== 'undefined') {
        return getClientMode() === 'Production' || localStorage.getItem('USE_REAL_SMTP') === 'true';
    }
    return APP_CONFIG.EMAIL.USE_REAL_SMTP;
}
