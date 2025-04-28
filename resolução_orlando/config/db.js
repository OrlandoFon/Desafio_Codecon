import { createClient } from "redis";

class RedisClient {
  static instance = null;

  static async getClient() {
    if (!RedisClient.instance) {
      RedisClient.instance = createClient();
      await RedisClient.instance.connect();
      RedisClient.instance.on("error", (err) =>
        console.error("Redis Client Error:", err),
      );
    }
    return RedisClient.instance;
  }
}

export default RedisClient;
