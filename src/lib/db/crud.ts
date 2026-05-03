import {
  EXAMPLE_STORE,
  getDatabase,
  type ExampleRecord,
  type JsonValue,
} from "./config";

export type CreateRecordInput<TValue extends JsonValue = JsonValue> = {
  id: string;
  value: TValue;
};

export type UpdateRecordInput<TValue extends JsonValue = JsonValue> = {
  value: TValue;
};

const now = () => new Date().toISOString();

export async function createRecord<TValue extends JsonValue>(
  record: CreateRecordInput<TValue>,
) {
  const db = await getDatabase();
  const timestamp = now();
  const newRecord: ExampleRecord = {
    ...record,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await db.add(EXAMPLE_STORE, newRecord);

  return newRecord;
}

export async function getRecord(id: string) {
  const db = await getDatabase();

  return db.get(EXAMPLE_STORE, id);
}

export async function listRecords() {
  const db = await getDatabase();

  return db.getAllFromIndex(EXAMPLE_STORE, "by-updated-at");
}

export async function updateRecord<TValue extends JsonValue>(
  id: string,
  changes: Partial<UpdateRecordInput<TValue>>,
) {
  const db = await getDatabase();
  const existing = await db.get(EXAMPLE_STORE, id);

  if (!existing) {
    return null;
  }

  const updated: ExampleRecord = {
    ...existing,
    ...changes,
    updatedAt: now(),
  };

  await db.put(EXAMPLE_STORE, updated);

  return updated;
}

export async function upsertRecord<TValue extends JsonValue>(
  record: CreateRecordInput<TValue>,
) {
  const existing = await getRecord(record.id);

  if (existing) {
    return updateRecord(record.id, { value: record.value });
  }

  return createRecord(record);
}

export async function deleteRecord(id: string) {
  const db = await getDatabase();

  await db.delete(EXAMPLE_STORE, id);
}

export async function countRecords() {
  const db = await getDatabase();

  return db.count(EXAMPLE_STORE);
}

export async function clearRecords() {
  const db = await getDatabase();

  await db.clear(EXAMPLE_STORE);
}
