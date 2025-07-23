// Development Environment Configuration
export const environment = {
  production: false,
  // 🔥 כתובת מלאה עם https:// - זה יפתור את הבעיה!
  apiUrl: 'https://legaltrack-server.onrender.com/api',
  appName: 'Legal Flow Admin',
  version: '1.0.0',
  
  // Feature flags
  features: {
    enableNotifications: true,
    enableAnalytics: false,
    enableDebugMode: true,
    enableOfflineMode: false
  },
  
  // API endpoints
  endpoints: {
    auth: {
      login: '/login',
      registerAdmin: '/register-admin',
      logout: '/auth/logout',
      refresh: '/auth/refresh'
    },
    users: {
      getAll: '/users',
      getById: '/users/:id',
      getByEmail: '/users/:email',
      update: '/users/:id',
      delete: '/users/:id',
      invite: '/invite/invite-lawyer'
    },
    groups: {
      getAll: '/group',
      getById: '/group/:id',
      create: '/group'
    }
  },
  
  ui: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
    sidenavWidth: 280,
    headerHeight: 64,
    animationDuration: 300,
    debounceTime: 300,
    snackBarDuration: 5000
  },
  
  security: {
    jwtTokenKey: 'token',
    tokenExpirationBuffer: 300,
    maxLoginAttempts: 5,
    lockoutDuration: 900
  },
  
  validation: {
    email: {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      maxLength: 254
    },
    password: {
      minLength: 5,
      requireLetters: true,
      requireNumbers: true
    },
    userName: {
      minLength: 2,
      maxLength: 50
    }
  }
};