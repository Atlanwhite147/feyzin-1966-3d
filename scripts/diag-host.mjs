import { io } from "socket.io-client";
const c = io("http://127.0.0.1:3100", { transports: ["websocket"] });
c.on("connect", () => console.log("connecté", c.id));
c.on("connect_error", (e) => console.log("connect_error", e.message));
c.on("disconnect", (r) => console.log("déconnecté", r));
c.on("state", (s) => console.log("state", s.etat, "phase", s.phase, "chrono", s.chrono));
c.on("tick", (t) => {});
setTimeout(() => {
  c.emit("host:creer", {}, (r) => {
    console.log("salle", r.pin);
    setTimeout(() => { console.log("→ avancer"); c.emit("host:avancer"); }, 600);
    setTimeout(() => { console.log("→ clore"); c.emit("host:clore"); }, 1800);
    setTimeout(() => { console.log("fin"); process.exit(0); }, 4000);
  });
}, 400);
