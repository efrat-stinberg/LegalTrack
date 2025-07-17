// Development Environment Configuration
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7042/api', // ודא שזה התואם לשרת שלך
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
      login: '/auth/login',
      registerAdmin: '/auth/register-admin',
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
    },
    clients: {
      getAll: '/client',
      getById: '/client/:id',
      create: '/client',
      update: '/client/:id',
      delete: '/client/:id'
    },
    folders: {
      getAll: '/folders',
      getById: '/folders/:id',
      getByClient: '/folders/by-client/:clientId',
      create: '/folders',
      update: '/folders/:id',
      delete: '/folders/:id',
      getExtractedText: '/folders/folders/:folderId/extracted-text'
    },
    documents: {
      getAll: '/documents',
      getById: '/documents/:id',
      create: '/documents',
      update: '/documents/:id',
      delete: '/documents/:id'
    },
    chat: {
      getHistory: '/chat/:folderId',
      sendMessage: '/chat/:folderId'
    },
    admin: {
      deleteAllData: '/admin/delete-all'
    }
  },
  
  // UI Configuration
  ui: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
    sidenavWidth: 280,
    headerHeight: 64,
    animationDuration: 300,
    debounceTime: 300,
    snackBarDuration: 5000
  },
  
  // Security Configuration
  security: {
    jwtTokenKey: 'token',
    tokenExpirationBuffer: 300, // 5 minutes in seconds
    maxLoginAttempts: 5,
    lockoutDuration: 900 // 15 minutes in seconds
  },
  
  // Validation Rules
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

// Production Environment Configuration
export const environmentProd = {
  ...environment,
  production: true,
  apiUrl: 'https://api.legalflow.com/api', // Replace with actual production URL
  
  features: {
    enableNotifications: true,
    enableAnalytics: true,
    enableDebugMode: false,
    enableOfflineMode: true
  },
  
  ui: {
    ...environment.ui,
    snackBarDuration: 3000
  }
};