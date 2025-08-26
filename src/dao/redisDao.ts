import { getRedisClient } from '../utils/redis';

export const setJSON = async (key: string, value: any): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.set(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting JSON for key ${key}:`, error);
    throw error;
  }
};

export const getJSON = async <T>(key: string): Promise<T | null> => {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    
    if (!value) {
      return null;
    }
    
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Error getting JSON for key ${key}:`, error);
    throw error;
  }
};

export const setJSONWithExpiry = async (
  key: string, 
  value: any, 
  expiryInSeconds: number
): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.setEx(key, expiryInSeconds, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting JSON with expiry for key ${key}:`, error);
    throw error;
  }
};

export const deleteKey = async (key: string): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    console.error(`Error deleting key ${key}:`, error);
    throw error;
  }
};

export const keyExists = async (key: string): Promise<boolean> => {
  try {
    const client = getRedisClient();
    const exists = await client.exists(key);
    return exists === 1;
  } catch (error) {
    console.error(`Error checking if key ${key} exists:`, error);
    throw error;
  }
};

export const getTTL = async (key: string): Promise<number> => {
  try {
    const client = getRedisClient();
    return await client.ttl(key);
  } catch (error) {
    console.error(`Error getting TTL for key ${key}:`, error);
    throw error;
  }
};

export const setExpiry = async (key: string, expiryInSeconds: number): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.expire(key, expiryInSeconds);
  } catch (error) {
    console.error(`Error setting expiry for key ${key}:`, error);
    throw error;
  }
};