import fastifyBasicAuth from "@fastify/basic-auth";
import type { FastifyInstance } from "fastify";

// アプリ全体をBasic認証で保護する（要件定義書 §2・§3.1）。単一/少数の固定アカウント運用。
export async function registerBasicAuth(app: FastifyInstance): Promise<void> {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;
  if (!user || !pass) {
    throw new Error("BASIC_AUTH_USER / BASIC_AUTH_PASS must be set");
  }

  await app.register(fastifyBasicAuth, {
    validate: async (username, password) => {
      if (username !== user || password !== pass) {
        return new Error("unauthorized");
      }
    },
    authenticate: true,
  });

  app.addHook("onRequest", app.basicAuth);
}
