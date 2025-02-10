import { connect } from "redis";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

await load({ export: true });

const REDIS_HOST = Deno.env.get("REDIS_HOST") || "localhost";
const REDIS_PORT = parseInt(Deno.env.get("REDIS_PORT") || "6379");

export const createRedisClient = async () => {
  try {
    const client = await connect({
      hostname: REDIS_HOST,
      port: REDIS_PORT,
    });

    return client;
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    throw error;
  }
};
