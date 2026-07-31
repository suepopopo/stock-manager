import path from "node:path";
import fastifyStatic from "@fastify/static";
import type { FastifyInstance } from "fastify";

const API_PATH_PREFIXES = ["/api", "/health"];

// client(Vue.js)のビルド済み静的アセットを配信する（システム構成図.md §1参照）。
// APIパス以外のGETはSPAのindex.htmlを返し、vue-routerのクライアントサイドルーティングに委ねる。
export async function registerStaticClient(app: FastifyInstance): Promise<void> {
  const clientDistPath = path.resolve(process.cwd(), "../client/dist");

  await app.register(fastifyStatic, { root: clientDistPath });

  app.setNotFoundHandler((request, reply) => {
    const isApiPath = API_PATH_PREFIXES.some((prefix) => request.url.startsWith(prefix));
    if (request.method === "GET" && !isApiPath) {
      reply.sendFile("index.html");
      return;
    }
    reply.code(404).send({ message: "not found" });
  });
}
