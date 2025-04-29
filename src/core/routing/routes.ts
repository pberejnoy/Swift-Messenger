// Define all application routes in one place for consistency
export const routes = {
  // Public routes (accessible without authentication)
  public: {
    home: "/",
    login: "/login",
    register: "/register",
    unauthorized: "/unauthorized",
  },

  // Protected routes (require authentication)
  protected: {
    dashboard: "/dashboard",
    profile: "/profile",
    settings: "/settings",

    // Channel routes
    channels: {
      root: "/channels",
      view: (channelId: string) => `/channels/${channelId}`,
    },

    // Direct message routes
    directMessages: {
      root: "/direct-messages",
      view: (userId: string) => `/direct-messages/${userId}`,
    },

    // Admin routes
    admin: {
      root: "/admin",
      dashboard: "/admin/dashboard",
      users: "/admin/users",
      channels: "/admin/channels",
      logs: "/admin/logs",
    },
  },
}
