/* Moteur audio procédural de la salle : aucun fichier sonore, tout est synthétisé.
   Vent, grondement de l'autoroute, grésillements radio, sifflement de soupape
   dont la hauteur monte avec la température de paroi, alarme de givre,
   déflagration du BLEVE avec courte réverbération. */

export function creerAudio() {
  let ctx = null;
  let maitre = null;
  let vent = null;
  let route = null;
  let sifflet = null;
  let siffletGain = null;
  let alarme = null;
  let alarmeGain = null;
  let demarre = false;
  let coupe = false;
  let dernierBleve = false;
  let dernierIcing = 0;
  let dernierePhase = -1;

  function bruit(duree = 2) {
    const n = Math.floor(ctx.sampleRate * duree);
    const tampon = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = tampon.getChannelData(0);
    let dernier = 0;
    for (let i = 0; i < n; i++) {
      const blanc = Math.random() * 2 - 1;
      dernier = (dernier + 0.02 * blanc) / 1.02;
      d[i] = dernier * 3.5;
    }
    return tampon;
  }

  function sourceBoucle(tampon) {
    const s = ctx.createBufferSource();
    s.buffer = tampon;
    s.loop = true;
    s.start();
    return s;
  }

  function demarrer() {
    if (demarre) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    maitre = ctx.createGain();
    maitre.gain.value = 0.55;
    maitre.connect(ctx.destination);

    /* vent : bruit très filtré */
    const bVent = bruit(3);
    const fVent = ctx.createBiquadFilter();
    fVent.type = "lowpass";
    fVent.frequency.value = 420;
    vent = ctx.createGain();
    vent.gain.value = 0.16;
    sourceBoucle(bVent).connect(fVent).connect(vent).connect(maitre);

    /* autoroute : grondement plus bas */
    const bRoute = bruit(3);
    const fRoute = ctx.createBiquadFilter();
    fRoute.type = "bandpass";
    fRoute.frequency.value = 160;
    fRoute.Q.value = 0.7;
    route = ctx.createGain();
    route.gain.value = 0.1;
    sourceBoucle(bRoute).connect(fRoute).connect(route).connect(maitre);

    /* sifflement de soupape : deux oscillateurs désaccordés */
    siffletGain = ctx.createGain();
    siffletGain.gain.value = 0;
    const filtre = ctx.createBiquadFilter();
    filtre.type = "highpass";
    filtre.frequency.value = 1800;
    sifflet = ctx.createOscillator();
    sifflet.type = "sawtooth";
    sifflet.frequency.value = 900;
    const sifflet2 = ctx.createOscillator();
    sifflet2.type = "sine";
    sifflet2.frequency.value = 1320;
    sifflet.connect(filtre).connect(siffletGain).connect(maitre);
    sifflet2.connect(siffletGain);
    sifflet.start();
    sifflet2.start();

    /* alarme de givre, deux tons */
    alarmeGain = ctx.createGain();
    alarmeGain.gain.value = 0;
    alarme = ctx.createOscillator();
    alarme.type = "square";
    alarme.frequency.value = 660;
    alarme.connect(alarmeGain).connect(maitre);
    alarme.start();

    demarre = true;
    coupe = false;
    if (ctx.state === "suspended") ctx.resume();
  }

  function arreter() {
    if (!ctx) return;
    try {
      ctx.close();
    } catch (e) {
      /* le contexte peut déjà être fermé */
    }
    ctx = null;
    demarre = false;
  }

  function coupure() {
    if (!maitre) return;
    coupe = !coupe;
    maitre.gain.setTargetAtTime(coupe ? 0 : 0.55, ctx.currentTime, 0.08);
  }

  function radio() {
    if (!ctx || !demarre || coupe) return;
    const d = 0.22;
    const s = ctx.createBufferSource();
    const n = Math.floor(ctx.sampleRate * d);
    const tampon = ctx.createBuffer(1, n, ctx.sampleRate);
    const data = tampon.getChannelData(0);
    for (let i = 0; i < n; i++) {
      const enveloppe = Math.sin((i / n) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * enveloppe * (i % 700 < 90 ? 0.9 : 0.12);
    }
    s.buffer = tampon;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 1900;
    f.Q.value = 1.2;
    const g = ctx.createGain();
    g.gain.value = 0.5;
    s.connect(f).connect(g).connect(maitre);
    s.start();
  }

  function deflagration() {
    if (!ctx || !demarre || coupe) return;
    const d = 3.2;
    const n = Math.floor(ctx.sampleRate * d);
    const tampon = ctx.createBuffer(1, n, ctx.sampleRate);
    const data = tampon.getChannelData(0);
    for (let i = 0; i < n; i++) {
      const t = i / ctx.sampleRate;
      const enveloppe = Math.exp(-t * 1.6);
      data[i] = (Math.random() * 2 - 1) * enveloppe;
    }
    const s = ctx.createBufferSource();
    s.buffer = tampon;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(1600, ctx.currentTime);
    f.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 2.4);
    const g = ctx.createGain();
    g.gain.value = 1.0;
    const conv = ctx.createConvolver();
    const ir = ctx.createBuffer(2, Math.floor(ctx.sampleRate * 1.6), ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const canal = ir.getChannelData(c);
      for (let i = 0; i < canal.length; i++) canal[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.35));
    }
    conv.buffer = ir;
    const sec = ctx.createGain();
    sec.gain.value = 0.35;
    s.connect(f).connect(g);
    g.connect(maitre);
    g.connect(sec).connect(conv).connect(maitre);
    s.start();

    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(64, ctx.currentTime);
    sub.frequency.exponentialRampToValueAtTime(22, ctx.currentTime + 1.8);
    const gs = ctx.createGain();
    gs.gain.setValueAtTime(0.9, ctx.currentTime);
    gs.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2);
    sub.connect(gs).connect(maitre);
    sub.start();
    sub.stop(ctx.currentTime + 2.3);
  }

  function mettreAJour(capteurs = {}, phase = 0) {
    if (!ctx || !demarre) return;
    const t = ctx.currentTime;
    const temp = capteurs.sphere_443_metal_temp ?? 20;
    const givre = capteurs.valve_icing_level ?? 0;
    const trafic = capteurs.a7_traffic_blocked;
    const chaleur = Math.min(1, Math.max(0, (temp - 20) / 630));

    if (vent) vent.gain.setTargetAtTime(0.12 + phase * 0.012, t, 0.4);
    if (route) route.gain.setTargetAtTime(trafic ? 0.02 : 0.09, t, 0.5);
    if (sifflet) sifflet.frequency.setTargetAtTime(520 + chaleur * 1750, t, 0.3);
    if (siffletGain) siffletGain.gain.setTargetAtTime(chaleur > 0.15 ? 0.03 + chaleur * 0.09 : 0, t, 0.5);

    if (alarmeGain && alarme) {
      const actif = givre > 55;
      alarmeGain.gain.setTargetAtTime(actif ? 0.05 : 0, t, 0.2);
      if (actif) alarme.frequency.setValueAtTime(Math.floor(t * 2) % 2 === 0 ? 720 : 520, t);
    }

    if (capteurs.bleve_triggered && !dernierBleve) deflagration();
    dernierBleve = !!capteurs.bleve_triggered;

    if (givre > 60 && dernierIcing <= 60) radio();
    if (phase !== dernierePhase && phase > 0 && phase < 6) radio();
    dernierIcing = givre;
    dernierePhase = phase;
  }

  return { demarrer, arreter, mettreAJour, coupure, radio, deflagration, actif: () => demarre, contexte: () => ctx };
}
