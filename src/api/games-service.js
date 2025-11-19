import { httpClient } from "./http-client";

const gamesService = {
  async createGame(gameData) {
    const { data } = await httpClient.post("/games", gameData);

    return data;
  },

  async getGames() {
    const { data } = await httpClient.get("/games");

    return data;
  },

  async deleteGame(gameId) {
    const { data } = await httpClient.delete(`/games/${gameId}`);

    return data;
  },
};

export default gamesService;
