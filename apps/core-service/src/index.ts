export interface Env {
  APP_ENV: string;
  PUBLIC_APP_NAME?: string;
  PUBLIC_DEFAULT_LOCALE?: string;
  PUBLIC_DEFAULT_CURRENCY?: string;
  PUBLIC_DEFAULT_TIMEZONE?: string;
  DB?: D1Database;
  OBJECTS?: R2Bucket;
  JOBS?: Queue;
}

export default {
  fetch(request: Request, env: Env): Response {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return Response.json({ ok: true, service: "prime-core-service", env: env.APP_ENV });
    }
    return Response.json({ error: "not_implemented", service: "prime-core-service" }, { status: 501 });
  }
};
