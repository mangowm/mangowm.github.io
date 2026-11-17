import { DurableObject } from "cloudflare:workers";
import { previewMessage } from "./preview.js";

const GATEWAY = "wss://gateway.discord.gg";
const INTENTS = (1 << 0) | (1 << 9) | (1 << 15);
const MAX_DELAY = 60_000;
const SEEN_LIMIT = 200;
const decoder = new TextDecoder();

export class Gateway extends DurableObject {
  socket = null;
  resumeUrl = null;
  sessionId = null;
  sequence = null;
  beatMs = 0;
  beatTimer = null;
  acked = true;
  tries = 0;
  error = null;
  lastPreview = null;
  seen = new Set();

  constructor(ctx, env) {
    super(ctx, env);
    if (env.DISCORD_BOT_TOKEN) this.dial();
  }

  async start() {
    this.error = null;
    this.tries = 0;
    this.sessionId = null;
    this.sequence = null;
    this.dial();
    return this.snapshot();
  }

  async state() {
    return this.snapshot();
  }

  async alarm() {
    this.dial();
  }

  snapshot() {
    return {
      online: this.socket?.readyState === WebSocket.OPEN,
      session: Boolean(this.sessionId),
      tries: this.tries,
      error: this.error,
      lastPreview: this.lastPreview,
    };
  }

  dial() {
    if (this.socket && this.socket.readyState <= WebSocket.OPEN) return;

    const base = this.sessionId ? (this.resumeUrl ?? GATEWAY) : GATEWAY;
    let socket;
    try {
      socket = new WebSocket(`${base}/?v=10&encoding=json`);
    } catch (error) {
      this.fail(String(error?.message ?? error));
      return;
    }

    this.socket = socket;
    socket.onmessage = (event) => this.receive(event.data);
    socket.onclose = (event) => this.closed(event.code);
    socket.onerror = () => {};
  }

  receive(raw) {
    let payload;
    try {
      payload = JSON.parse(typeof raw === "string" ? raw : decoder.decode(raw));
    } catch {
      return;
    }

    if (payload.s) this.sequence = payload.s;

    switch (payload.op) {
      case 1:
        this.send(1, this.sequence);
        break;
      case 7:
        this.retry();
        break;
      case 9:
        this.sessionId = null;
        this.sequence = null;
        this.retry(1000 + Math.round(Math.random() * 4000));
        break;
      case 10:
        this.handshake(payload.d.heartbeat_interval);
        break;
      case 11:
        this.acked = true;
        break;
      case 0:
        this.dispatch(payload);
        break;
    }
  }

  dispatch({ t: type, d: data }) {
    if (type === "READY") {
      this.sessionId = data.session_id;
      this.resumeUrl = data.resume_gateway_url ?? null;
      this.tries = 0;
      this.error = null;
    }

    if (type === "RESUMED") this.tries = 0;
    if (type === "MESSAGE_CREATE" && this.isNew(data.id)) this.preview(data);
  }

  isNew(id) {
    if (this.seen.has(id)) return false;
    this.seen.add(id);
    if (this.seen.size > SEEN_LIMIT) this.seen.delete(this.seen.values().next().value);
    return true;
  }

  handshake(interval) {
    this.beatMs = interval;

    const data = this.sessionId
      ? { token: this.env.DISCORD_BOT_TOKEN, session_id: this.sessionId, seq: this.sequence ?? 0 }
      : {
          token: this.env.DISCORD_BOT_TOKEN,
          intents: INTENTS,
          properties: { os: "linux", browser: "mao", device: "mao" },
        };

    this.send(this.sessionId ? 6 : 2, data);
    this.beat();
  }

  beat() {
    clearInterval(this.beatTimer);
    this.acked = true;
    this.beatTimer = setInterval(() => {
      if (!this.acked) {
        this.retry();
        return;
      }
      this.acked = false;
      this.send(1, this.sequence);
    }, this.beatMs);
  }

  send(op, d) {
    this.socket?.send(JSON.stringify({ op, d }));
  }

  preview(data) {
    this.ctx.waitUntil(
      previewMessage(data, this.env)
        .then((outcome) => {
          this.lastPreview = { at: Date.now(), outcome };
        })
        .catch((error) => {
          this.lastPreview = { at: Date.now(), outcome: "failed" };
          console.error("preview failed", error);
        }),
    );
  }

  retry(delay = this.backoff()) {
    const socket = this.socket;
    this.socket = null;
    if (socket) {
      socket.onmessage = null;
      socket.onclose = null;
      socket.close();
    }

    clearInterval(this.beatTimer);
    this.beatTimer = null;
    this.ctx.storage.setAlarm(Date.now() + delay).catch(() => {});
  }

  backoff() {
    this.tries += 1;
    const base = Math.min(1000 * 2 ** (this.tries - 1), MAX_DELAY);
    return Math.round(base + Math.random() * 1000);
  }

  fail(message) {
    this.error = message;
    this.tries = 0;
    console.error("gateway", message);
  }

  closed(code) {
    this.socket = null;
    clearInterval(this.beatTimer);
    this.beatTimer = null;

    if (code === 4004) return this.fail("discord rejected the bot token");
    if (code === 4013 || code === 4014) return this.fail("enable the message content intent");

    if (code === 4003 || code === 4007 || code === 4009) {
      this.sessionId = null;
      this.sequence = null;
    }

    this.retry();
  }
}
