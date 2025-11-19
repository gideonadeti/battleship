import { httpClient } from "./http-client";

const gamesService = {
  async createGame(gameData) {
    const { data } = await httpClient.post("/games", gameData);

    return data;
  },
};

export default gamesService;
