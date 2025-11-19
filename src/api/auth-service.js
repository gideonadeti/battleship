import authStore from "../state/auth-store";
import ENV from "../config/env";
import { httpClient } from "./http-client";

const handleAuthSuccess = ({ accessToken, player }) => {
  authStore.setSession({ player, accessToken });

  return { player, accessToken };
};

const authService = {
  async signUp(credentials) {
    const { data } = await httpClient.post("/auth/sign-up", credentials);

    return handleAuthSuccess(data);
  },
  async signIn(credentials) {
    const { data } = await httpClient.post("/auth/sign-in", credentials);

    return handleAuthSuccess(data);
  },
  async deleteAccount() {
    await httpClient.delete("/auth/account");

    authStore.clearSession();
  },
  signOut() {
    authStore.clearSession();
  },
  getLeaderboardAppUrl() {
    return ENV.LEADERBOARD_APP_URL;
  },
  getProfileUrl(playerId) {
    return `${ENV.LEADERBOARD_APP_URL}/players/${playerId}`;
  },
};

export default authService;
