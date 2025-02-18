import { createRedisClient } from "@/lib/redis.ts";
import type { Entry, File, Folder } from "@/types.ts";

export const REDIS_KEY_PREFIX = "claude-terminal:";

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
    await redis.del(`${REDIS_KEY_PREFIX}${dir}`);
    const allEntries = [...folders, ...files];
    for (const entry of allEntries) {
      await redis.rpush(`${REDIS_KEY_PREFIX}${dir}`, JSON.stringify(entry));
    }
    return `Loaded ${dir} into memory (${allEntries.length} entries)`;
  } catch (error) {
    throw new Error(`Failed to load and store files from ${dir}: ${error}`);
  }
}

export async function checkDirectory(dir: string) {
  const redis = await createRedisClient();
  const keyType = await redis.type(`${REDIS_KEY_PREFIX}${dir}`);
  if (keyType === "none") {
    return await loadEntriesInDirectory(dir);
  }
  return `${dir} already loaded into memory`;
}

export async function popEntriesFromDirectory(
  dir: string,
  batchSize: number = 100
): Promise<{ files: File[]; folders: Folder[]; remainingCount: number }> {
  const redis = await createRedisClient();
  const entries: (File | Folder)[] = [];

  try {
    await checkDirectory(dir);

    for (let i = 0; i < batchSize; i++) {
      const entry = await redis.lpop(`${REDIS_KEY_PREFIX}${dir}`);
      if (!entry) break;
      entries.push(JSON.parse(entry));
    }

    const remainingCount = await redis.llen(`${REDIS_KEY_PREFIX}${dir}`);

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

export async function moveEntries(
  sourcePaths: string[],
  destinationFolder: string
) {
  try {
    for (const source of sourcePaths) {
      await Deno.rename(
        source,
        `${destinationFolder}/${source.split("/").pop()}`
      );
    }
    return `Moved ${sourcePaths.length} entries to ${destinationFolder}`;
  } catch (error) {
    throw new Error(`Failed to move entries: ${error}`);
  }
}

export async function makeDirectory(path: string) {
  try {
    await Deno.mkdir(path);
    return `Created directory ${path}`;
  } catch (error) {
    throw new Error(`Failed to make directory: ${error}`);
  }
}
