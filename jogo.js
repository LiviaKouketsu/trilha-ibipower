// Trilha do IbiPower: lógica do jogo
(function () {
  "use strict";

  // Regras
  const TOTAL = 22; // casa 0 = início, 21 = fim
  const FIM = TOTAL - 1;
  const PONTOS_INICIO = 50;
  const PONTOS = { certa: 10, errada: -10, ataque: -15, bloqueio: 10, escudo: 5 };
  const RECUO_ATAQUE = 2;
  const FACES_DADO = [1, 1, 2, 2, 3, 3];
  // Casas que não são de risco
  const ESPECIAIS = {
    4: { tipo: "escudo" },
    7: { tipo: "vilao", nome: "Senhor Vaza-Tudo" },
    11: { tipo: "escudo" },
    14: { tipo: "vilao", nome: "Ladrão de Pixels" },
    18: { tipo: "vilao", nome: "Senhor Vaza-Tudo" },
  };
  // Resultado final pela pontuação
  const FAIXAS = [
    { min: 80, classe: "maxima", titulo: "Máxima", texto: "Comportamento seguro consistente. O IbiPower tem orgulho de você, guardião(ã)!" },
    { min: 40, classe: "media", titulo: "Média", texto: "Decisões mistas. Você acertou bastante, mas deixou algumas portas abertas para os vilões." },
    { min: -Infinity, classe: "falhou", titulo: "Falhou", texto: "Muitas decisões inseguras. Leia as dicas abaixo e tente de novo: todo guardião começa aprendendo." },
  ];

  // Estado da partida
  let estado;
  function novoEstado(nome) {
    return {
      nome: nome || "Guardião(ã)",
      pos: 0,
      pontos: PONTOS_INICIO,
      vulns: [],
      historico: [],
      baralho: embaralhar(CENARIOS.slice()),
      ocupado: false,
      visitadas: new Set([0]),
    };
  }

  // Utilidades
  const $ = (id) => document.getElementById(id);
  const NS = "http://www.w3.org/2000/svg";
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function embaralhar(lista) {
    for (let i = lista.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lista[i], lista[j]] = [lista[j], lista[i]];
    }
    return lista;
  }
  function el(tag, attrs, pai) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (pai) pai.appendChild(e);
    return e;
  }
  function tipoDaCasa(n) {
    if (n === 0 || n === FIM) return "ponta";
    return ESPECIAIS[n] ? ESPECIAIS[n].tipo : "risco";
  }
  function nomeDaCasa(n) {
    if (n === 0) return "INÍCIO";
    if (n === FIM) return "FIM";
    return "Casa " + n;
  }

  // Tabuleiro: desenha as casas ao longo do caminho #trilha
  const centros = [];
  function desenharTabuleiro() {
    const trilha = $("trilha");
    const L = trilha.getTotalLength();
    const passo = L / TOTAL;
    const LARGURA = 96;
    const gCasas = $("casas");
    const gDeco = $("decoracao");

    // Estrada por baixo das casas (sombra + borda)
    const d = trilha.getAttribute("d");
    el("path", { d, fill: "none", "stroke-width": LARGURA + 8, "stroke-linecap": "butt", "stroke-linejoin": "round", class: "estrada-sombra", transform: "translate(0 9)" }, gDeco);
    el("path", { d, fill: "none", "stroke-width": LARGURA + 8, "stroke-linecap": "butt", "stroke-linejoin": "round", class: "estrada-borda" }, gDeco);

    const ponto = (s) => trilha.getPointAtLength(Math.max(0, Math.min(L, s)));
    const normal = (s) => {
      const a = ponto(s - 1), b = ponto(s + 1);
      const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      return { x: -(b.y - a.y) / len, y: (b.x - a.x) / len };
    };

    for (let i = 0; i < TOTAL; i++) {
      // Cada casa é um polígono que acompanha a curva
      const ini = i * passo + 1.2, fim = (i + 1) * passo - 1.2;
      const esq = [], dir = [];
      for (let k = 0; k <= 8; k++) {
        const s = ini + ((fim - ini) * k) / 8;
        const p = ponto(s), n = normal(s);
        esq.push([p.x + (n.x * LARGURA) / 2, p.y + (n.y * LARGURA) / 2]);
        dir.push([p.x - (n.x * LARGURA) / 2, p.y - (n.y * LARGURA) / 2]);
      }
      const pts = esq.concat(dir.reverse()).map((q) => q[0].toFixed(1) + "," + q[1].toFixed(1)).join(" ");
      const c = ponto((ini + fim) / 2);
      centros.push({ x: c.x, y: c.y });

      const tipo = tipoDaCasa(i);
      let classe = "casa ";
      if (tipo === "ponta") classe += "ponta";
      else if (tipo === "vilao") classe += "vilao";
      else if (tipo === "escudo") classe += "escudo";
      else classe += i % 2 ? "laranja" : "creme";

      const g = el("g", { class: classe, id: "casa-" + i }, gCasas);
      el("polygon", { points: pts }, g);
      if (tipo === "ponta") {
        const t = el("text", { x: c.x, y: c.y, class: "num" }, g);
        t.textContent = i === 0 ? "INÍCIO" : "FIM";
      } else {
        const t = el("text", { x: c.x - (tipo === "risco" ? 0 : 14), y: c.y, class: "num" }, g);
        t.textContent = i;
        if (tipo === "escudo") el("use", { href: "#ico-escudo", x: c.x + 2, y: c.y - 15, width: 24, height: 28 }, g);
        if (tipo === "vilao") el("use", { href: "#ico-vilao", x: c.x + 2, y: c.y - 13, width: 26, height: 26 }, g);
        if (tipo === "risco") el("use", { href: "#ico-risco", x: c.x + 18, y: c.y - 38, width: 20, height: 20 }, g);
      }
    }

    // Placa de início
    const pIni = centros[0];
    const placa = el("g", { transform: `translate(${pIni.x + 62} ${pIni.y - 26})` }, gDeco);
    el("rect", { x: 0, y: 0, width: 108, height: 38, rx: 8, fill: "#141414" }, placa);
    const tIni = el("text", { x: 54, y: 25, "text-anchor": "middle", fill: "#fff", "font-family": "Anton, Impact, sans-serif", "font-size": 20 }, placa);
    tIni.textContent = "COMECE AQUI";
    el("path", { d: "M0 12 L-10 19 L0 26 Z", fill: "#141414" }, placa);

    // Pino de chegada
    const pFim = centros[FIM];
    const pino = el("g", { transform: `translate(${pFim.x + 6} ${pFim.y - 110})` }, gDeco);
    el("path", { d: "M0 60 C-6 44 -24 34 -24 18 A24 24 0 1 1 24 18 C24 34 6 44 0 60 Z", fill: "#ED701C", stroke: "#B9540F", "stroke-width": 3 }, pino);
    el("circle", { cx: 0, cy: 16, r: 10, fill: "#fff" }, pino);

    // Brilhos decorativos
    [[220, 330], [440, 250], [660, 330], [880, 250], [880, 420], [440, 120]].forEach(([x, y], i) => {
      const s = i % 2 ? 12 : 9;
      el("path", { d: `M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z`, fill: "#F5C451" }, gDeco);
    });
  }

  function posicionarPeao(n, pular) {
    const p = centros[n];
    const peao = $("peao");
    peao.style.transform = `translate(${p.x}px, ${p.y}px) scale(${pular ? 1.12 : 0.92})`;
    document.querySelectorAll(".casa.destaque").forEach((c) => c.classList.remove("destaque"));
    $("casa-" + n).classList.add("destaque");
  }

  // Move o peão casa por casa (para frente ou para trás)
  async function andar(de, para) {
    const dir = para > de ? 1 : -1;
    for (let n = de + dir; dir > 0 ? n <= para : n >= para; n += dir) {
      estado.pos = n;
      estado.visitadas.add(n);
      $("casa-" + n).classList.add("visitada");
      posicionarPeao(n, true);
      await esperar(reduzMovimento ? 60 : 170);
      posicionarPeao(n, false);
      await esperar(reduzMovimento ? 40 : 150);
    }
    atualizarCasaAtual();
  }

  // Painel lateral
  function falar(texto) { $("balao").textContent = texto; }

  function mudarPontos(delta) {
    estado.pontos = Math.max(0, Math.min(100, estado.pontos + delta)); // limita entre 0 e 100
    atualizarPainel();
  }

  function atualizarPainel() {
    $("pontos").textContent = estado.pontos;
    const barra = $("barra");
    barra.style.width = estado.pontos + "%";
    barra.style.background = estado.pontos >= 80 ? "var(--verde)" : estado.pontos >= 40 ? "var(--laranja)" : "var(--vermelho)";
    $("medidor").setAttribute("aria-valuenow", estado.pontos);

    const ul = $("vulns");
    ul.innerHTML = "";
    $("qtd-vuln").textContent = estado.vulns.length;
    if (!estado.vulns.length) {
      const li = document.createElement("li");
      li.className = "vazio";
      li.textContent = "Nenhuma. Seu escudo está forte!";
      ul.appendChild(li);
    }
    estado.vulns.forEach((v) => {
      const li = document.createElement("li");
      li.textContent = v.nome;
      if (v.nova) { li.classList.add("nova"); v.nova = false; }
      ul.appendChild(li);
    });
  }

  function atualizarCasaAtual() {
    const n = estado.pos;
    const t = tipoDaCasa(n);
    let desc = n === 0 ? "Você está no INÍCIO" : n === FIM ? "Você chegou ao FIM!" : `Você está na casa ${n}`;
    if (t === "vilao") desc += " · vilão";
    if (t === "escudo") desc += " · Escudo de Cristal";
    $("casa-atual").textContent = desc;
  }

  // Dado
  const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8] }; // bolinhas acesas na grade 3x3
  function mostrarDado(v) {
    const on = PIPS[v] || [];
    $("dado").querySelectorAll("i").forEach((p, i) => p.classList.toggle("on", on.includes(i)));
  }
  function montarDado() {
    const d = $("dado");
    for (let i = 0; i < 9; i++) d.appendChild(document.createElement("i"));
    mostrarDado(1);
  }

  // Uma jogada completa: rolar, andar e resolver a casa
  async function rolar() {
    if (estado.ocupado || estado.pos >= FIM) return;
    estado.ocupado = true;
    $("rolar").disabled = true;

    const dado = $("dado");
    dado.classList.remove("rolando");
    void dado.offsetWidth; // reinicia a animação
    dado.classList.add("rolando");
    for (let k = 0; k < (reduzMovimento ? 1 : 6); k++) {
      mostrarDado(FACES_DADO[Math.floor(Math.random() * 6)]);
      await esperar(70);
    }
    const valor = FACES_DADO[Math.floor(Math.random() * FACES_DADO.length)];
    mostrarDado(valor);
    falar(`Tirei ${valor}! Vamos lá…`);
    await esperar(250);

    await andar(estado.pos, Math.min(FIM, estado.pos + valor));
    await esperar(200);
    await cair(estado.pos);

    if (estado.pos >= FIM) return fimDeJogo();
    estado.ocupado = false;
    $("rolar").disabled = false;
    $("rolar").focus();
  }

  // Eventos das casas
  function cair(n) {
    if (n === FIM) return Promise.resolve();
    const esp = ESPECIAIS[n];
    if (esp && esp.tipo === "escudo") return casaEscudo(n);
    if (esp && esp.tipo === "vilao") return casaVilao(n, esp.nome);
    return casaRisco(n);
  }

  function abrirEvento({ casa, tipo, rotuloTipo, titulo, texto }) {
    $("ev-topo").className = "evento-topo " + (tipo === "risco" ? "" : tipo);
    $("ev-casa").textContent = nomeDaCasa(casa);
    $("ev-tipo").textContent = rotuloTipo;
    $("ev-titulo").textContent = titulo;
    $("ev-texto").textContent = texto;
    $("ev-opcoes").innerHTML = "";
    $("ev-resultado").hidden = true;
    $("res-extra").className = "res-extra";
    $("res-extra").textContent = "";
    const dlg = $("dlg-evento");
    if (!dlg.open) dlg.showModal();
  }

  // Mostra o resultado e espera o clique em "Continuar"
  function mostrarResultado(bom, cabeca, texto, extra, extraBom) {
    const c = $("res-cabeca");
    c.className = "res-cabeca " + (bom ? "bom" : "ruim");
    c.textContent = cabeca;
    $("res-texto").textContent = texto;
    const ex = $("res-extra");
    ex.textContent = extra || "";
    ex.className = "res-extra" + (extraBom ? " bom" : "");
    $("ev-resultado").hidden = false;
    $("ev-continuar").focus();
    return new Promise((resolve) => {
      $("ev-continuar").onclick = () => { $("dlg-evento").close(); resolve(); };
    });
  }

  function proximoCenario() {
    if (!estado.baralho.length) estado.baralho = embaralhar(CENARIOS.slice()); // reembaralha quando acaba
    return estado.baralho.pop();
  }

  // Casa de risco: duas opções, certa ou errada
  function casaRisco(n) {
    const c = proximoCenario();
    abrirEvento({ casa: n, tipo: "risco", rotuloTipo: "Casa de risco", titulo: c.tema, texto: c.situacao });
    falar("Pense com calma. O que um guardião dos dados faria?");

    const opcoes = embaralhar([{ texto: c.certa, certa: true }, { texto: c.errada, certa: false }]);
    const box = $("ev-opcoes");
    return new Promise((resolve) => {
      opcoes.forEach((op, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "opcao";
        b.innerHTML = `<span class="letra">${"AB"[i]}</span><span></span>`;
        b.lastChild.textContent = op.texto;
        b.onclick = async () => {
          box.querySelectorAll(".opcao").forEach((x, j) => {
            x.disabled = true;
            if (opcoes[j].certa) x.classList.add("certa");
            else if (x === b) x.classList.add("errada");
          });
          if (op.certa) {
            mudarPontos(PONTOS.certa);
            estado.historico.push({ tipo: "ok", texto: `<b>${c.tema}:</b> ${c.explicacao}` });
            falar("Isso! Decisão segura. Meu Escudo de Cristal brilhou!");
            await mostrarResultado(true, `Boa decisão! +${PONTOS.certa}`, c.explicacao);
          } else {
            // Errou: perde pontos e ganha uma vulnerabilidade
            mudarPontos(PONTOS.errada);
            estado.vulns.push({ nome: c.vulnerabilidade.nome, ataque: c.vulnerabilidade.ataque, nova: true });
            atualizarPainel();
            estado.historico.push({ tipo: "erro", texto: `<b>${c.tema}:</b> o certo era "${c.certa}" ${c.explicacao}` });
            falar("Cuidado! Essa escolha abriu uma brecha. Os vilões vão tentar usá-la.");
            await mostrarResultado(false, `Decisão arriscada. ${PONTOS.errada}`, c.explicacao,
              `Nova vulnerabilidade: ${c.vulnerabilidade.nome}. Um vilão pode explorá-la mais à frente na trilha.`);
          }
          resolve();
        };
        box.appendChild(b);
      });
      box.firstChild.focus();
    });
  }

  // Escudo de Cristal: corrige a vulnerabilidade mais antiga
  async function casaEscudo(n) {
    abrirEvento({ casa: n, tipo: "escudo", rotuloTipo: "Escudo de Cristal", titulo: "Escudo de Cristal",
      texto: "O IbiPower ativa o Escudo de Cristal para reforçar sua proteção." });
    mudarPontos(PONTOS.escudo);
    if (estado.vulns.length) {
      const v = estado.vulns.shift();
      atualizarPainel();
      estado.historico.push({ tipo: "info", texto: `<b>Escudo de Cristal:</b> você corrigiu a vulnerabilidade "${v.nome}".` });
      falar("Consertei uma brecha para você. Mas não abuse, hein!");
      await mostrarResultado(true, `Brecha corrigida! +${PONTOS.escudo}`,
        `A vulnerabilidade "${v.nome}" foi corrigida. Na vida real, isso é trocar a senha, atualizar o sistema ou avisar o TI assim que perceber o erro.`);
    } else {
      estado.historico.push({ tipo: "info", texto: "<b>Escudo de Cristal:</b> nenhuma brecha para corrigir." });
      falar("Nenhuma brecha? Você está mandando muito bem!");
      await mostrarResultado(true, `Escudo reforçado! +${PONTOS.escudo}`,
        "Você não tinha nenhuma vulnerabilidade aberta. Prevenir é sempre melhor do que remediar.");
    }
  }

  // Vilão: explora uma vulnerabilidade ou é bloqueado
  async function casaVilao(n, nome) {
    abrirEvento({ casa: n, tipo: "vilao", rotuloTipo: "Ataque do vilão", titulo: nome,
      texto: `O ${nome} apareceu e está procurando uma brecha na sua segurança…` });
    if (estado.vulns.length) {
      const idx = Math.floor(Math.random() * estado.vulns.length);
      const v = estado.vulns.splice(idx, 1)[0];
      mudarPontos(PONTOS.ataque);
      estado.historico.push({ tipo: "erro", texto: `<b>${nome}</b> explorou "${v.nome}" e ${v.ataque}.` });
      falar("Ai! Ele usou uma brecha das suas decisões anteriores.");
      await mostrarResultado(false, `Ataque bem-sucedido! ${PONTOS.ataque}`,
        `O ${nome} explorou a vulnerabilidade "${v.nome}" e ${v.ataque}.`,
        `Você volta ${RECUO_ATAQUE} casas. Erros de segurança não somem sozinhos: eles esperam o momento certo para causar estrago.`);
      await andar(estado.pos, Math.max(0, estado.pos - RECUO_ATAQUE)); // recua sem ativar a casa
    } else {
      mudarPontos(PONTOS.bloqueio);
      estado.historico.push({ tipo: "ok", texto: `<b>${nome}</b> tentou atacar, mas não achou nenhuma brecha.` });
      falar("Ha! Sem brechas, sem ataque. Isso é trabalho de guardião!");
      await mostrarResultado(true, `Ataque bloqueado! +${PONTOS.bloqueio}`,
        `O ${nome} procurou e não encontrou nenhuma vulnerabilidade. Suas decisões seguras protegeram você.`, "", true);
    }
  }

  // Tela final
  function fimDeJogo() {
    const faixa = FAIXAS.find((f) => estado.pontos >= f.min);
    const decisoes = estado.historico.filter((h) => h.tipo !== "info");
    $("fim-topo").className = "fim-topo " + faixa.classe;
    $("fim-nome").textContent = `RESULTADO DE ${estado.nome.toUpperCase()}`;
    $("fim-titulo").textContent = faixa.titulo;
    let sub = faixa.texto;
    if (estado.vulns.length) sub += ` Ainda ficaram ${estado.vulns.length} vulnerabilidade(s) aberta(s).`;
    $("fim-sub").textContent = sub;
    $("fim-pontos").textContent = estado.pontos;
    const ol = $("fim-lista");
    ol.innerHTML = "";
    estado.historico.forEach((h) => {
      const li = document.createElement("li");
      li.className = h.tipo;
      li.innerHTML = h.texto; // textos fixos do jogo, sem entrada do usuário
      ol.appendChild(li);
    });
    if (!decisoes.length) ol.innerHTML = "<li class='info'>Você não passou por nenhuma casa de risco. Que sorte!</li>";
    falar(faixa.classe === "maxima" ? "Missão cumprida! Os dados de todos estão seguros." : "Chegamos! Vamos ver como foi?");
    $("dlg-fim").showModal();
  }

  // Início
  function iniciar(nome) {
    estado = novoEstado(nome);
    document.querySelectorAll(".casa").forEach((c) => c.classList.remove("visitada"));
    const peao = $("peao");
    peao.style.transition = "none"; // volta ao início sem animar
    posicionarPeao(0, false);
    void peao.getBoundingClientRect();
    peao.style.transition = "";
    atualizarPainel();
    atualizarCasaAtual();
    mostrarDado(1);
    $("rolar").disabled = false;
    falar(`Vamos nessa, ${estado.nome}! Role o dado para começar.`);
  }

  function prepararDialogos() {
    // Esc não pode pular decisão nem resultado
    ["dlg-evento", "dlg-fim"].forEach((id) => $(id).addEventListener("cancel", (e) => e.preventDefault()));
    $("dlg-inicio").addEventListener("close", () => {
      iniciar($("nome").value.trim());
      $("rolar").focus();
    });
    $("de-novo").addEventListener("click", () => {
      $("dlg-fim").close();
      $("dlg-inicio").showModal();
    });
    $("rolar").addEventListener("click", rolar);
  }

  desenharTabuleiro();
  montarDado();
  prepararDialogos();
  iniciar("");
  $("rolar").disabled = true;
  $("dlg-inicio").showModal();
})();
