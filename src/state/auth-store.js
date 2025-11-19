const subscribers = new Set();

const authState = {
  isAuthenticated: false,
  player: null,
  accessToken: null,
};

const notify = () => {
  subscribers.forEach((subscriber) => {
    try {
      subscriber({
        ...authState,
        player: authState.player ? { ...authState.player } : null,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Auth subscriber error", error);
    }
  });
};

const authStore = {
  subscribe(callback) {
    subscribers.add(callback);

    callback({
      ...authState,
      player: authState.player ? { ...authState.player } : null,
    });

    return () => subscribers.delete(callback);
  },
  setSession({ player, accessToken }) {
    authState.isAuthenticated = Boolean(accessToken);
    authState.player = player ?? null;
    authState.accessToken = accessToken ?? null;

    notify();
  },
  clearSession() {
    authState.isAuthenticated = false;
    authState.player = null;
    authState.accessToken = null;

    notify();
  },
  getAccessToken() {
    return authState.accessToken;
  },
  getState() {
    return {
      ...authState,
      player: authState.player ? { ...authState.player } : null,
    };
  },
};

export default authStore;
