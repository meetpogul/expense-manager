import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export const DB_NAME = "offline-pwa-starter";
export const DB_VERSION = 1;
export const EXAMPLE_STORE = "example_records";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

export type BaseRecord<TValue extends JsonValue = JsonValue> = {
  id: string;
  value: TValue;
  createdAt: string;
  updatedAt: string;
};

export type ExampleRecord = BaseRecord;

export interface AppDatabaseSchema extends DBSchema {
  [EXAMPLE_STORE]: {
    key: string;
    value: ExampleRecord;
    indexes: {
      "by-updated-at": string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<AppDatabaseSchema>> | null = null;

export function isIndexedDBSupported() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

export function getDatabase() {
  if (!isIndexedDBSupported()) {
    throw new Error("IndexedDB is not available in this runtime.");
  }

  if (!dbPromise) {
    dbPromise = openDB<AppDatabaseSchema>(DB_NAME, DB_VERSION, {
      upgrade(database) {
        // Placeholder object store for wiring. Replace with domain stores later.
        const store = database.createObjectStore(EXAMPLE_STORE, {
          keyPath: "id",
        });

        store.createIndex("by-updated-at", "updatedAt");
      },
    });
  }

  return dbPromise;
}

export async function closeDatabase() {
  const db = await dbPromise;
  db?.close();
  dbPromise = null;
}
