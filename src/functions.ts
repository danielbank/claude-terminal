import { createRedisClient } from "@/lib/redis.ts";

export type FileType = "f" | "d";

export type Entry<T extends FileType = FileType> = {
  name: string;
  path: string;
  type: T;
  size: number;
  modified?: Date;
  created?: Date;
};

export type File = Entry<"f">;
export type Folder = Entry<"d">;

export async function getEntryInfo(path: string): Promise<Entry> {
  const entryInfo = await Deno.lstat(path);
  return {
    name: path.split("/").pop() ?? "",
    path,
    type: entryInfo.isFile ? "f" : "d",
    size: entryInfo.size,
    modified: entryInfo.mtime ?? undefined,
    created: entryInfo.birthtime ?? undefined,
  };
}

export async function loadEntriesInDirectory(
  dir: string = "."
): Promise<string> {
  const redis = await createRedisClient();
  const files: File[] = [];
  const folders: Folder[] = [];
  try {
    for await (const item of Deno.readDir(dir)) {
      const path = `${dir}/${item.name}`;
      const entryInfo = await getEntryInfo(path);
      if (!item.isSymlink) {
        if (item.isFile) {
          files.push({
            name: item.name,
            path,
            type: "f",
            size: entryInfo.size,
            modified: entryInfo.modified,
            created: entryInfo.created,
          });
        } else if (item.isDirectory) {
          folders.push({
            name: item.name,
            path,
            type: "d",
            size: entryInfo.size,
            modified: entryInfo.modified,
            created: entryInfo.created,
          });
        }
      }
    }
    await redis.del(dir);
    const allEntries = [...folders, ...files];
    for (const entry of allEntries) {
      await redis.rpush(dir, JSON.stringify(entry));
    }
    return "OK";
  } catch (error) {
    throw new Error(`Failed to load and store files from ${dir}: ${error}`);
  }
}

/**
 * Get a batch of entries from Redis
 * @param dir - The directory to get the entries from
 * @param redis - The Redis client
 * @param batchSize - The number of entries to return
 * @returns The current batch of entries from Redis and the remaining count of entries still in the key
 */
export async function getEntriesFromRedis(
  dir: string,
  batchSize: number = 100
): Promise<{ files: File[]; folders: Folder[]; remainingCount: number }> {
  const redis = await createRedisClient();
  const entries: (File | Folder)[] = [];

  try {
    const keyType = await redis.type(dir);
    if (keyType === "none") {
      await loadEntriesInDirectory(dir);
    } else if (keyType !== "list") {
      await redis.del(dir);
      await loadEntriesInDirectory(dir);
    }

    for (let i = 0; i < batchSize; i++) {
      const entry = await redis.lpop(dir);
      if (!entry) break;
      entries.push(JSON.parse(entry));
    }

    const remainingCount = await redis.llen(dir);

    const files: File[] = entries.filter(
      (entry): entry is File => entry.type === "f"
    );
    const folders: Folder[] = entries.filter(
      (entry): entry is Folder => entry.type === "d"
    );

    return { files, folders, remainingCount };
  } catch (error) {
    throw new Error(`Failed to get entries from Redis: ${error}`);
  }
}
