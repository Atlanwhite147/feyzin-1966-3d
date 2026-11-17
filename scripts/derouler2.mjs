
import { io } from "socket.io-client";
const pin = process.argv[2];
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const c = io("http://127.0.0.1:3100", { transports: ["websocket"] });
c.on("connect", () => {
  c.emit("host:rejoindre", { pin }, async (r) => {
    if (!r?.ok) { console.log("refus", r); process.exit(1); }
    console.log("prise en main", pin);
    let dernier = r.etat.etat;
    for (let i = 0; i < 12; i++) {
      const s = await new Promise((res) => { c.once("state", res); c.emit("host:avancer"); setTimeout(() => res(null), 700); });
      await pause(700);
      c.emit("host:clore");
      await pause(900);
      const t = await new Promise((res) => { c.once("state", res); setTimeout(() => res(null), 700); });
      if (t) { console.log(i, t.etat, "phase", t.phase); if (t.etat === "debrief") break; }
    }
    process.exit(0);
  });
});
