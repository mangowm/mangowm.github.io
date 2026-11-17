export { Gateway } from "./gateway.js";
import { handle } from "./app.js";

export default {
  fetch: (request, env) =>
    handle(request, env, {
      getGateway: (environment) => environment.GATEWAY.getByName("mao"),
    }),
};
