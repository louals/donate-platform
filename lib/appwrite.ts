import {
  Client,
  Account,
  Databases,
  Storage,
  ID,
  Query,
  OAuthProvider,
} from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const postsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_POSTS_ID!;
const usersCollectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS_ID!;
const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

export const client = new Client().setEndpoint(endpoint).setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client); // ← Add this line

export const COLLECTIONS = {
  POSTS: postsCollectionId,
  USERS: usersCollectionId,
  MESSAGES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_MESSAGES_ID!,
};

export const DATABASE_ID = dbId;

export const BUCKET_ID = bucketId;

export { ID, Query, OAuthProvider };
