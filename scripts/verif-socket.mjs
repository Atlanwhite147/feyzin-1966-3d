
import { io } from "socket.io-client";
const c = io("http://127.0.0.1:10000", { transports: ["websocket"] });
const t = setTimeout(() => { console.log("delai depasse"); process.exit(1); }, 6000);
c.on("connect", () => {
  c.emit("host:creer", {}, (r) => {
    clearTimeout(t);
    console.log("salle creee, PIN", r.pin, "etat", r.etat.etat);
    process.exit(0);
  });
});
c.on("connect_error", (e) => { console.log("erreur", e.message); process.exit(1); });
