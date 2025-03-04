declare namespace NodeJS {
  interface ProcessEnv {
    MONGO_URI: string;
    HOST: string;
    PORT: number;
    JWT_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
  }
}
