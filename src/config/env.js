const getEnvVar = (key, fallback) => {
  if (
    typeof process !== "undefined" &&
    process.env &&
    typeof process.env[key] === "string" &&
    process.env[key].length > 0
  ) {
    return process.env[key];
  }

  return fallback;
};

const ENV = {
  API_BASE_URL: getEnvVar(
    "LEADERBOARD_API_BASE_URL",
    "http://localhost:3000/api/v1"
  ),
  LEADERBOARD_APP_URL: getEnvVar(
    "LEADERBOARD_APP_URL",
    "http://localhost:3001"
  ),
};

export default ENV;
