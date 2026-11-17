import { creerServeur } from "../server/app.js";
import { io } from "socket.io-client";

process.env.REVELATION_MS = "500";
const srv = creerServeur({ port: 3599 });
const c = io("http://127.0.0.1:3599", { transports: ["websocket"] });
const t0 = Date.now();
c.on("state", (s) => console.log("state", s.etat, "phase", s.phase, "dans", s.revelationDans, "t+" + (Date.now() - t0)));
c.on("connect", () => {
  c.emit("host:creer", {}, (r) => {
    console.log("salle", r.pin);
    setTimeout(() => c.emit("host:avancer"), 300);
    setTimeout(() => c.emit("host:clore"), 900);
    setTimeout(() => { srv.arreter(); process.exit(0); }, 2600);
  });
});
