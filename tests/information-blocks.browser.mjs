import assert from "node:assert/strict";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import JSZip from "jszip";

const PORT = 4187;
const PREVIEW_PORT = 4188;
const CDP_PORT = 9237;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const NPM_BIN = fs.existsSync("/home/leogoecking/.local/share/mise/shims/npm")
  ? "/home/leogoecking/.local/share/mise/shims/npm"
  : "npm";

const repoRoot = process.cwd();
const screenshotsDir = path.join(repoRoot, "docs", "screenshots");
const tempDataDir = `/tmp/accio-info-data-${process.pid}`;
const exportExtractDir = `/tmp/accio-info-export-${process.pid}`;
const chromeProfileDir = `/tmp/accio-info-chrome-${process.pid}`;

fs.mkdirSync(screenshotsDir, { recursive: true });
fs.mkdirSync(tempDataDir, { recursive: true });
fs.mkdirSync(exportExtractDir, { recursive: true });
fs.mkdirSync(chromeProfileDir, { recursive: true });

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHttp(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // retry
    }
    await wait(150);
  }
  throw new Error(`Timeout waiting for ${url}`);
}

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.errors = [];
  }

  async connect() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });

    this.ws.addEventListener("message", (event) => {
      const msg = JSON.parse(String(event.data));
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method === "Runtime.exceptionThrown") {
        const details = msg.params?.exceptionDetails;
        this.errors.push(
          `Runtime.exceptionThrown: ${details?.text || ""} ${details?.exception?.description || ""}`
        );
      } else if (
        msg.method === "Runtime.consoleAPICalled" &&
        msg.params?.type === "error"
      ) {
        const text = (msg.params.args || [])
          .map((arg) => arg.value ?? arg.description ?? "")
          .join(" ");
        this.errors.push(`console.error: ${text}`);
      }
    });

    await this.send("Page.enable");
    await this.send("Runtime.enable");
    await this.send("DOM.enable");
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (res.exceptionDetails) {
      throw new Error(
        `Eval error: ${res.exceptionDetails.text} ${res.exceptionDetails.exception?.description || ""}`
      );
    }
    return res.result?.value;
  }

  async pressEnter() {
    await this.send("Page.bringToFront");
    await this.send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key: "Enter",
      code: "Enter",
      text: "\r",
      unmodifiedText: "\r",
      windowsVirtualKeyCode: 13,
      nativeVirtualKeyCode: 13,
    });
    await this.send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key: "Enter",
      code: "Enter",
      windowsVirtualKeyCode: 13,
      nativeVirtualKeyCode: 13,
    });
  }

  async waitFor(predicateExpr, timeoutMs = 15000, label = "condition") {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const ok = await this.eval(`Boolean(${predicateExpr})`);
      if (ok) return;
      await wait(150);
    }
    throw new Error(`Timeout waiting for ${label}: ${predicateExpr}`);
  }

  async setViewport(width, height, mobile = false) {
    await this.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: mobile ? 2 : 1,
      mobile,
    });
    await wait(300);
  }

  async goto(url) {
    await this.send("Page.navigate", { url });
    await this.waitFor(
      `document.readyState === 'complete'`,
      15000,
      `navigate ${url}`
    );
    await wait(450);
  }

  async screenshot(filename, fullPage = false) {
    await wait(350);
    const { data } = await this.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      ...(fullPage ? { captureBeyondViewport: true } : {}),
    });
    const outPath = path.join(screenshotsDir, filename);
    fs.writeFileSync(outPath, Buffer.from(data, "base64"));
    return outPath;
  }

  close() {
    this.ws.close();
  }
}

async function createProject(templateId, name) {
  const res = await fetch(`${BASE_URL}/?index`, {
    method: "POST",
    body: new URLSearchParams({ intent: "create", templateId, name }),
    redirect: "manual",
  });
  const location = res.headers.get("location");
  assert.match(location ?? "", /^\/play\/proj-/);
  const id = location.split("/").at(-1);
  const zipRes = await fetch(`${BASE_URL}/projects/${id}/export`);
  assert.equal(zipRes.status, 200);
  const zip = await JSZip.loadAsync(Buffer.from(await zipRes.arrayBuffer()));
  const design = JSON.parse(await zip.file("design.json").async("string"));
  return { id, design };
}

async function saveProject(id, data, name) {
  const res = await fetch(`${BASE_URL}/play/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, data }),
  });
  assert.equal(res.status, 200);
}

function buildInformationCompositionDoc(baseData) {
  const doc = structuredClone(baseData);
  doc.root.props.title = "Central de Informações e Atividades";
  doc.root.props.layoutWidth = { mode: "fluid" };
  doc.root.props.navigationMode = "sidebar";

  doc.content = [
    {
      type: "AppSidebar",
      props: {
        id: "info-shell",
        brandName: "Núcleo Gestão",
        brandSubtitle: "Operação Diária",
        brandIcon: "layers",
        bordered: true,
        groups: [
          {
            title: "Acompanhamento",
            items: [
              {
                label: "Atividades",
                url: "#atividades",
                icon: "activity",
                badge: "4",
                active: true,
              },
              {
                label: "Agenda",
                url: "#agenda",
                icon: "calendar",
                badge: "2",
                active: false,
              },
              {
                label: "Notificações",
                url: "#notificacoes",
                icon: "bell",
                badge: "2",
                active: false,
              },
            ],
          },
        ],
        user: {
          name: "Marina Costa",
          role: "Coordenação Geral",
          initials: "MC",
        },
        content: [
          {
            type: "PageHeader",
            props: {
              id: "info-header",
              title: "Operação, Metas e Atividades",
              subtitle:
                "Visão consolidada de histórico cronológico, registros recentes, metas trimestrais, agenda e alertas.",
              badge: {
                label: "Turno ativo",
                url: "",
                variant: "secondary",
              },
              actions: [
                {
                  label: "Atualizar painel",
                  url: "#atualizar",
                  variant: "outline",
                  size: "default",
                  icon: "activity",
                },
              ],
              showSeparator: true,
              padding: { top: "none", bottom: "small" },
            },
          },
          {
            type: "DashboardGrid",
            props: {
              id: "info-top-grid",
              columns: "2",
              gap: "md",
              padding: { top: "none", bottom: "small" },
              items: [
                {
                  type: "ProgressCard",
                  props: {
                    id: "info-progress",
                    title: "Metas do Trimestre",
                    description: "Acompanhamento de receita, implantação e SLA.",
                    badgeLabel: "Q4 2026",
                    showPercentage: true,
                    showValues: true,
                    barSize: "md",
                    items: [
                      {
                        label: "Receita nova anual (ARR)",
                        helperText: "Meta comercial das regionais",
                        current: 420000,
                        target: 500000,
                        format: "currency",
                        unit: "",
                        tone: "chart-1",
                      },
                      {
                        label: "Contas em produção",
                        helperText: "Implantação concluída neste ciclo",
                        current: 38,
                        target: 45,
                        format: "number",
                        unit: "contas",
                        tone: "chart-2",
                      },
                      {
                        label: "Cumprimento de SLA N1",
                        helperText: "Chamados respondidos no prazo",
                        current: 96,
                        target: 98,
                        format: "percent",
                        unit: "",
                        tone: "primary",
                      },
                    ],
                    padding: { top: "none", bottom: "none" },
                  },
                },
                {
                  type: "NotificationList",
                  props: {
                    id: "info-notifications",
                    title: "Central de Notificações",
                    description: "Alertas prioritários e solicitações pendentes.",
                    grouped: true,
                    showReadToggle: true,
                    showMarkAllAction: true,
                    items: [
                      {
                        id: "notif-1",
                        title: "SLA crítico em risco no chamado #2401",
                        description: "Conta corporativa aguarda retorno financeiro.",
                        timestamp: "Há 6 min",
                        read: false,
                        priority: "alta",
                        mediaType: "icon",
                        icon: "alert-circle",
                        senderName: "Monitoramento",
                        category: "Suporte",
                      },
                      {
                        id: "notif-2",
                        title: "Marina Costa solicitou aprovação de contrato",
                        description: "Aditivo anual da Horizonte Logística pronto para conferência.",
                        timestamp: "Há 28 min",
                        read: false,
                        priority: "normal",
                        mediaType: "avatar",
                        icon: "user",
                        senderName: "Marina Costa",
                        category: "Comercial",
                      },
                      {
                        id: "notif-3",
                        title: "Conciliação bancária concluída",
                        description: "Remessa matinal processada sem divergências.",
                        timestamp: "Há 2 horas",
                        read: true,
                        priority: "baixa",
                        mediaType: "icon",
                        icon: "check-circle-2",
                        senderName: "Motor Financeiro",
                        category: "Faturamento",
                      },
                    ],
                    padding: { top: "none", bottom: "none" },
                  },
                },
              ],
            },
          },
          {
            type: "RecordList",
            props: {
              id: "info-records",
              title: "Contas e Faturas Recentes",
              description: "Organizações com código copiável e ações diretas.",
              badgeLabel: "3 registros",
              variant: "default",
              mediaType: "avatar",
              showCopyCode: true,
              items: [
                {
                  title: "Horizonte Logística Ltda",
                  description: "Contrato Enterprise · Gestão de Frota",
                  code: "CTR-1042",
                  value: "R$ 18.400,00",
                  date: "28 nov",
                  status: "Aprovado",
                  statusVariant: "default",
                  avatarName: "Horizonte Logística",
                  icon: "building-2",
                  actionLabel: "Detalhes",
                  actionUrl: "#ctr-1042",
                },
                {
                  title: "Clínica Vida Integrada",
                  description: "Assinatura Corporativa · Unidade Centro",
                  code: "CTR-1048",
                  value: "R$ 6.250,00",
                  date: "27 nov",
                  status: "Em análise",
                  statusVariant: "secondary",
                  avatarName: "Clínica Vida",
                  icon: "users",
                  actionLabel: "Revisar",
                  actionUrl: "#ctr-1048",
                },
                {
                  title: "Atacado Central ME",
                  description: "Divergência na retenção cadastral",
                  code: "CTR-1055",
                  value: "R$ 3.120,00",
                  date: "25 nov",
                  status: "Divergência",
                  statusVariant: "destructive",
                  avatarName: "Atacado Central",
                  icon: "alert-circle",
                  actionLabel: "Corrigir",
                  actionUrl: "#ctr-1055",
                },
              ],
              footerAction: {
                label: "Ver todos os registros",
                url: "#registros",
                variant: "outline",
                size: "sm",
                icon: "arrow-right",
              },
              padding: { top: "none", bottom: "small" },
            },
          },
          {
            type: "DashboardGrid",
            props: {
              id: "info-bottom-grid",
              columns: "2",
              gap: "md",
              padding: { top: "none", bottom: "none" },
              items: [
                {
                  type: "ActivityTimeline",
                  props: {
                    id: "info-timeline",
                    title: "Histórico de Atividades",
                    description: "Eventos cronológicos recentes do ambiente.",
                    badgeLabel: "Tempo real",
                    groupByDate: true,
                    compact: false,
                    showCategory: true,
                    items: [
                      {
                        title: "Pedido #4829 aprovado automaticamente",
                        description: "Conciliação confirmada e nota emitida.",
                        dateLabel: "Hoje",
                        timestamp: "14:32",
                        actor: "Marina Costa",
                        category: "Faturamento",
                        status: "success",
                        icon: "check-circle-2",
                      },
                      {
                        title: "Oscilação detectada no gateway fiscal",
                        description: "Fila de contingência ativada automaticamente.",
                        dateLabel: "Hoje",
                        timestamp: "11:18",
                        actor: "Monitoramento SRE",
                        category: "Infraestrutura",
                        status: "warning",
                        icon: "clock",
                      },
                      {
                        title: "Falha no webhook ERP",
                        description: "Endpoint retornou HTTP 504; escalado ao N2.",
                        dateLabel: "Ontem",
                        timestamp: "09:20",
                        actor: "Integração ERP",
                        category: "Integrações",
                        status: "error",
                        icon: "alert-circle",
                      },
                    ],
                    padding: { top: "none", bottom: "none" },
                  },
                },
                {
                  type: "AgendaCard",
                  props: {
                    id: "info-agenda",
                    title: "Agenda Operacional",
                    description: "Compromissos de implantação e revisões.",
                    badgeLabel: "Esta semana",
                    highlightNext: true,
                    showCategory: true,
                    items: [
                      {
                        dateLabel: "Hoje · 28 nov",
                        startTime: "09:00",
                        endTime: "09:45",
                        title: "Passagem de plantão N1/N2",
                        description: "Conferência dos chamados abertos.",
                        location: "Canal Operações",
                        category: "Rotina",
                        status: "done",
                        icon: "check-circle-2",
                      },
                      {
                        dateLabel: "Hoje · 28 nov",
                        startTime: "14:30",
                        endTime: "15:30",
                        title: "Implantação Horizonte Logística",
                        description: "Validação de permissões e importação inicial.",
                        location: "Sala Executiva B",
                        category: "Implantação",
                        status: "next",
                        icon: "users",
                      },
                      {
                        dateLabel: "Amanhã · 29 nov",
                        startTime: "10:00",
                        endTime: "11:00",
                        title: "Comitê de fechamento mensal",
                        description: "Conferência de faturamento recorrente.",
                        location: "Videoconferência",
                        category: "Financeiro",
                        status: "upcoming",
                        icon: "calendar",
                      },
                    ],
                    padding: { top: "none", bottom: "none" },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ];
  return doc;
}

async function main() {
  const server = spawn(
    path.join(repoRoot, "node_modules", ".bin", "react-router-serve"),
    [path.join(repoRoot, "build", "server", "index.js")],
    {
      cwd: repoRoot,
      env: { ...process.env, PORT: String(PORT), ACCIO_DATA_DIR: tempDataDir },
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  const chrome = spawn(
    "/usr/bin/chromium",
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${chromeProfileDir}`,
      "about:blank",
    ],
    { cwd: repoRoot, stdio: ["ignore", "pipe", "pipe"] }
  );

  let client;
  try {
    await waitForHttp(`${BASE_URL}/`);
    await waitForHttp(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const targets = await (
      await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)
    ).json();
    const pageTarget = targets.find((t) => t.type === "page") || targets[0];
    client = new CdpClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();
    await client.setViewport(1440, 900, false);

    // 1. Validate empty states and long unbroken strings without horizontal overflow
    const edgeProj = await createProject("em-branco", "Vazios e Textos Extensos");
    const edgeDoc = structuredClone(edgeProj.design);
    edgeDoc.content = [
      {
        type: "ActivityTimeline",
        props: {
          id: "tl-empty",
          title: "Linha do Tempo Vazia",
          items: [],
          emptyMessage: "Sem eventos históricos no momento.",
        },
      },
      {
        type: "RecordList",
        props: {
          id: "rl-long",
          title: "Registro Extenso",
          variant: "compact",
          mediaType: "icon",
          showCopyCode: true,
          items: [
            {
              title: "OrganizacaoSuperExtensaSemQuebraDeLinhaCorporativaIntegradaParaValidacaoDeContainer",
              description: "Identificador tecnico muito longo: protocolo-alpha-beta-gamma-delta-epsilon-00000123456789",
              code: "PROTOCOLO-ULTRA-LONGO-999999999",
              status: "Ativo",
              statusVariant: "secondary",
              icon: "file-text",
            },
          ],
        },
      },
      {
        type: "ProgressCard",
        props: {
          id: "pc-empty",
          title: "Metas Vazias",
          items: [],
          emptyMessage: "Nenhuma meta definida ainda.",
        },
      },
      {
        type: "ProgressCard",
        props: {
          id: "pc-edge-goals",
          title: "Metas Extremas",
          showPercentage: true,
          showValues: true,
          items: [
            {
              label: "Meta comercial superada",
              current: 140,
              target: 100,
              format: "number",
              unit: "vendas",
              tone: "chart-1",
            },
            {
              label: "Fila sem meta definida",
              current: 18,
              target: 0,
              format: "number",
              unit: "itens",
              tone: "chart-2",
            },
            {
              label: "Indicador zerado sem alvo",
              current: 0,
              target: 0,
              format: "number",
              unit: "",
              tone: "primary",
            },
          ],
        },
      },
      {
        type: "AgendaCard",
        props: {
          id: "ac-empty",
          title: "Agenda Vazia",
          items: [],
          emptyMessage: "Nenhum compromisso na agenda.",
        },
      },
      {
        type: "NotificationList",
        props: {
          id: "nl-empty",
          title: "Notificações Vazias",
          items: [],
          emptyMessage: "Caixa de notificações limpa.",
        },
      },
    ];
    await saveProject(edgeProj.id, edgeDoc, "Vazios e Textos Extensos");
    await client.goto(`${BASE_URL}/projects/${edgeProj.id}`);
    await client.waitFor(
      `document.body.innerText.includes('Sem eventos históricos no momento.')
        && document.body.innerText.includes('Nenhuma meta definida ainda.')
        && document.body.innerText.includes('Nenhum compromisso na agenda.')
        && document.body.innerText.includes('Caixa de notificações limpa.')
        && document.body.innerText.includes('Metas Extremas')`,
      10000,
      "Empty states rendered"
    );

    const progressEdgeCheck = await client.eval(`(() => {
      const region = document.querySelector('[role="region"][aria-label="Metas Extremas"]');
      const bars = Array.from(region.querySelectorAll('[role="progressbar"]')).map((bar) => {
        const container = bar.parentElement;
        const fill = bar.firstElementChild;
        return {
          label: bar.getAttribute('aria-label'),
          valuenow: Number(bar.getAttribute('aria-valuenow')),
          valuemin: Number(bar.getAttribute('aria-valuemin')),
          valuemax: Number(bar.getAttribute('aria-valuemax')),
          valuetext: bar.getAttribute('aria-valuetext'),
          goalState: bar.getAttribute('data-goal-state'),
          fillWidth: fill?.style?.width || '',
          rowText: container?.innerText || '',
        };
      });
      return bars;
    })()`);
    assert.equal(progressEdgeCheck.length, 3);
    for (const bar of progressEdgeCheck) {
      assert.ok(
        bar.valuemin <= bar.valuenow && bar.valuenow <= bar.valuemax,
        `ARIA out of bounds on ${bar.label}: ${bar.valuenow} not in [${bar.valuemin}, ${bar.valuemax}]`
      );
    }
    const exceededBar = progressEdgeCheck.find((b) => b.label === "Meta comercial superada");
    assert.equal(exceededBar.valuenow, 100);
    assert.equal(exceededBar.valuemax, 100);
    assert.equal(exceededBar.goalState, "exceeded");
    assert.equal(exceededBar.fillWidth, "100%");
    assert.match(exceededBar.valuetext ?? "", /140%.*meta ultrapassada/);
    assert.match(exceededBar.rowText, /140%/);

    for (const zeroLabel of ["Fila sem meta definida", "Indicador zerado sem alvo"]) {
      const zeroBar = progressEdgeCheck.find((b) => b.label === zeroLabel);
      assert.equal(zeroBar.valuenow, 0);
      assert.equal(zeroBar.valuemin, 0);
      assert.equal(zeroBar.valuemax, 100);
      assert.equal(zeroBar.goalState, "no-target");
      assert.match(zeroBar.valuetext ?? "", /Meta não definida/);
      assert.match(zeroBar.rowText, /Sem meta/);
      assert.equal(zeroBar.rowText.includes("%"), false, `Zero-target goal ${zeroLabel} must not show %`);
    }
    console.log("✔ ProgressCard exceeded and zero-target ARIA/visual bounds verified");

    // Test CopyButton error state explicitly when clipboard fails, then success state
    const copyErrorStatus = await client.eval(`(async () => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: () => Promise.reject(new Error('denied')) },
      });
      document.execCommand = () => false;
      const btn = document.querySelector('[data-slot="copy-button"]');
      btn.click();
      await new Promise(r => setTimeout(r, 80));
      return btn.getAttribute('data-copy-status');
    })()`);
    assert.equal(copyErrorStatus, "error", "CopyButton must show error when clipboard fails");

    const copySuccessStatus = await client.eval(`(async () => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: () => Promise.resolve() },
      });
      const btn = document.querySelector('[data-slot="copy-button"]');
      btn.click();
      await new Promise(r => setTimeout(r, 80));
      return btn.getAttribute('data-copy-status');
    })()`);
    assert.equal(copySuccessStatus, "copied", "CopyButton must show copied on success");

    await client.setViewport(390, 844, true);
    const longMobileOverflow = await client.eval(
      `document.documentElement.scrollWidth - document.documentElement.clientWidth`
    );
    assert.ok(longMobileOverflow <= 0, `Long text mobile overflow: ${longMobileOverflow}`);
    console.log("✔ Empty states, CopyButton error/success states and long text wrapping verified");

    // 2. Full 5-block composition across Experimentar, Editar, Apresentar & Exported
    await client.setViewport(1440, 900, false);
    const comp = await createProject("em-branco", "Painel Informações e Atividades");
    const compDoc = buildInformationCompositionDoc(comp.design);
    await saveProject(comp.id, compDoc, "Painel Informações e Atividades");

    // Experimentar: switch theme to ocean-breeze Dark and test all 3 densities
    await client.goto(`${BASE_URL}/play/${comp.id}`);
    await client.waitFor(
      `(() => {
        const doc = document.querySelector('[data-testid="playground-preview-iframe"]')?.contentDocument;
        return doc?.body?.innerText.includes('Histórico de Atividades')
          && doc?.body?.innerText.includes('Implantação Horizonte Logística');
      })()`,
      15000,
      "Playground iframe rendered all 5 information blocks"
    );

    await client.eval(`document.querySelector('[data-testid="preset-option-ocean-breeze"]').click()`);
    await client.eval(`document.querySelector('[data-testid="playground-mode-toggle"]').click()`);
    await client.eval(`Array.from(document.querySelectorAll('aside button')).find(b => b.textContent.includes('Estrutura e estilo')).click()`);
    await client.waitFor(`document.querySelector('[data-testid="density-compact"]')`, 5000, "Density controls");

    for (const d of ["compact", "comfortable", "default"]) {
      await client.eval(`document.querySelector('[data-testid="density-${d}"]').click()`);
      await client.waitFor(
        `document.querySelector('[data-testid="playground-preview-iframe"]').contentDocument.querySelector('[data-accio-theme]')?.getAttribute('data-density') === '${d}'`,
        5000,
        `Density ${d}`
      );
    }

    const iframeOverflow = await client.eval(`(() => {
      const doc = document.querySelector('[data-testid="playground-preview-iframe"]').contentDocument;
      return doc.documentElement.scrollWidth - doc.documentElement.clientWidth;
    })()`);
    assert.ok(iframeOverflow <= 0, `Playground iframe overflow: ${iframeOverflow}`);
    await client.screenshot("information-composition-dark.png");
    console.log("✔ Playground Dark Ocean Breeze & all 3 densities verified + screenshot saved");

    // Reset back to Default Light & save for clean Present vs Export parity check
    await client.eval(`Array.from(document.querySelectorAll('aside button')).find(b => b.textContent.includes('Temas')).click()`);
    await client.waitFor(`document.querySelector('[data-testid="preset-option-default"]')`, 5000, "Themes tab");
    await client.eval(`document.querySelector('[data-testid="preset-option-default"]').click()`);
    await client.eval(`document.querySelector('[data-testid="playground-mode-toggle"]').click()`);
    await client.eval(`document.querySelector('[data-testid="playground-save-button"]').click()`);
    await client.waitFor(
      `document.querySelector('[data-testid="playground-save-button"]').innerText.includes('Salvo')`,
      5000,
      "Saved light composition"
    );

    // Editar (Puck): verify category "Informações e atividades" and property edit
    await client.goto(`${BASE_URL}/projects/${comp.id}/edit`);
    await client.waitFor(
      `(() => {
        const f = document.querySelector('#preview-frame');
        const text = document.body.textContent || '';
        return text.includes('Informações e atividades')
          && text.includes('Linha do Tempo')
          && text.includes('Lista de Notificações')
          && f?.contentDocument?.body?.innerText.includes('Metas do Trimestre');
      })()`,
      15000,
      "Edit mode rendered Informações e atividades category"
    );
    await client.eval(`(() => {
      const f = document.querySelector('#preview-frame');
      const target = [...f.contentDocument.querySelectorAll('[data-puck-component]')].find(el => el.dataset.puckComponent?.includes('info-progress'));
      target?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    })()`);
    await client.waitFor(
      `Array.from(document.querySelectorAll('input')).some(el => el.value === 'Metas do Trimestre')`,
      5000,
      "ProgressCard fields opened in Puck editor"
    );
    await client.eval(`(() => {
      const input = Array.from(document.querySelectorAll('input')).find(el => el.value === 'Metas do Trimestre');
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(input, 'Metas Atualizadas no Editor');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    await client.waitFor(
      `document.querySelector('#preview-frame').contentDocument.body.innerText.includes('Metas Atualizadas no Editor')`,
      5000,
      "Edited property reflected live inside Puck preview"
    );
    console.log("✔ Edit mode category and live property editing verified");

    // Apresentar (1440x900) + NotificationList interactive read toggle
    await client.goto(`${BASE_URL}/projects/${comp.id}`);
    await client.waitFor(
      `document.body.innerText.includes('Histórico de Atividades') && document.body.innerText.includes('2 não lidas')`,
      10000,
      "Present mode rendered composition"
    );

    const presentMetrics = await client.eval(`(async () => {
      await document.fonts.ready;
      const scope = document.querySelector('[data-accio-theme]');
      const css = getComputedStyle(scope);
      return {
        mode: scope.dataset.themeMode,
        preset: scope.dataset.themePreset,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        text: scope.textContent.replace(/\\s+/g, ' ').trim(),
        bg: css.backgroundColor,
        fg: css.color,
      };
    })()`);
    assert.ok(presentMetrics.overflow <= 0, `Present overflow: ${presentMetrics.overflow}`);
    await client.screenshot("information-composition-light.png", true);

    // Test NotificationList stable groups, keyboard focus preservation & mark-all on Apresentar
    await client.eval(`(() => {
      window.__unreadSection = document.querySelector('[data-section="unread"]');
      window.__readSection = document.querySelector('[data-section="read"]');
      document.querySelector('[data-slot="toggle-read"][data-notification-key="notif-1"]').focus();
    })()`);
    await client.pressEnter();
    await client.waitFor(
      `document.body.innerText.includes('1 não lida')
        && Boolean(document.querySelector('[data-section="read"] [data-notification-key="notif-1"]'))`,
      3000,
      "Notification toggled to read via Enter"
    );
    const focusAfterRead = await client.eval(`({
      key: document.activeElement?.dataset?.notificationKey,
      slot: document.activeElement?.dataset?.slot,
      unreadStable: window.__unreadSection === document.querySelector('[data-section="unread"]'),
      readStable: window.__readSection === document.querySelector('[data-section="read"]'),
    })`);
    assert.deepEqual(focusAfterRead, {
      key: "notif-1",
      slot: "toggle-read",
      unreadStable: true,
      readStable: true,
    });

    await client.pressEnter();
    await client.waitFor(
      `document.body.innerText.includes('2 não lidas')
        && Boolean(document.querySelector('[data-section="unread"] [data-notification-key="notif-1"]'))`,
      3000,
      "Notification toggled back to unread via Enter"
    );
    const focusAfterUnread = await client.eval(
      `document.activeElement?.dataset?.notificationKey`
    );
    assert.equal(focusAfterUnread, "notif-1", "Focus must remain on notif-1 when moving back to unread");

    await client.eval(`document.querySelector('[data-slot="mark-all-read"]').focus()`);
    await client.pressEnter();
    await client.waitFor(`document.body.innerText.includes('0 não lidas')`, 3000, "All notifications marked read via Enter");
    const focusInsideRegion = await client.eval(`Boolean(
      document.activeElement &&
      document.activeElement !== document.body &&
      document.querySelector('[role="region"][aria-label="Central de Notificações"]')?.contains(document.activeElement)
    )`);
    assert.equal(focusInsideRegion, true, "Focus must stay inside NotificationList region after Marcar todas");
    console.log("✔ Present mode + NotificationList focus stability & read interactions verified");

    // Mobile 390x844 screenshot
    await client.goto(`${BASE_URL}/projects/${comp.id}`);
    await client.setViewport(390, 844, true);
    await wait(350);
    const mobileOverflow = await client.eval(
      `document.documentElement.scrollWidth - document.documentElement.clientWidth`
    );
    assert.ok(mobileOverflow <= 0, `Mobile overflow: ${mobileOverflow}`);
    await client.screenshot("information-mobile.png");
    console.log("✔ Mobile 390x844 verified + screenshot saved");

    // 3. Export ZIP and run standalone frontend outside AccioDesign
    const zipRes = await fetch(`${BASE_URL}/projects/${comp.id}/export`);
    const archivePath = path.join(exportExtractDir, "info.zip");
    fs.writeFileSync(archivePath, Buffer.from(await zipRes.arrayBuffer()));
    execFileSync("unzip", ["-q", archivePath, "-d", exportExtractDir]);

    const exportedFrontend = path.join(exportExtractDir, "frontend");
    assert.ok(
      fs.existsSync(path.join(exportedFrontend, "licenses/LICENSE-SPELLUI-MIT.txt")),
      "Exported frontend must include LICENSE-SPELLUI-MIT.txt when Spell UI primitives are used"
    );
    const exportedPkg = JSON.parse(
      fs.readFileSync(path.join(exportedFrontend, "package.json"), "utf8")
    );
    assert.equal("recharts" in exportedPkg.dependencies, false, "Info composition must NOT include recharts");
    assert.equal("@puckeditor/core" in exportedPkg.dependencies, false);

    for (const args of [
      ["install", "--no-audit", "--no-fund"],
      ["run", "typecheck"],
      ["run", "build"],
    ]) {
      const result = spawnSync(NPM_BIN, args, {
        cwd: exportedFrontend,
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      });
      if (result.status !== 0) {
        throw new Error(`Exported frontend failed on npm ${args.join(" ")}:\n${result.stdout}\n${result.stderr}`);
      }
    }
    console.log("✔ Standalone exported frontend installed, typechecked and built outside repo");

    const previewServer = spawn(
      process.execPath,
      [
        path.join(exportedFrontend, "node_modules/vite/bin/vite.js"),
        "preview",
        "--host",
        "127.0.0.1",
        "--port",
        String(PREVIEW_PORT),
        "--strictPort",
      ],
      { cwd: exportedFrontend, stdio: "ignore" }
    );
    try {
      const exportedUrl = `http://127.0.0.1:${PREVIEW_PORT}/`;
      await waitForHttp(exportedUrl);
      await client.setViewport(1440, 900, false);
      await client.goto(exportedUrl);
      await client.waitFor(
        `document.body.innerText.includes('Histórico de Atividades') && document.body.innerText.includes('2 não lidas')`,
        10000,
        "Exported frontend rendered"
      );

      const exportedMetrics = await client.eval(`(async () => {
        await document.fonts.ready;
        const scope = document.querySelector('[data-accio-theme]');
        const css = getComputedStyle(scope);
        return {
          mode: scope.dataset.themeMode,
          preset: scope.dataset.themePreset,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          text: scope.textContent.replace(/\\s+/g, ' ').trim(),
          bg: css.backgroundColor,
          fg: css.color,
        };
      })()`);

      assert.deepStrictEqual(exportedMetrics, presentMetrics);
      await client.screenshot("information-exported-frontend.png", true);

      for (const [w, h, mobile] of [[768, 1024, false], [390, 844, true]]) {
        await client.setViewport(w, h, mobile);
        const overflow = await client.eval(
          `document.documentElement.scrollWidth - document.documentElement.clientWidth`
        );
        assert.ok(overflow <= 0, `Exported frontend overflow at ${w}x${h}: ${overflow}`);
      }
      console.log("✔ Visual parity metrics between Apresentar and Exported Frontend match 100%");
    } finally {
      previewServer.kill("SIGTERM");
    }

    // 4. Verify external updates vs equivalent-array reference stability on exported NotificationList
    const harnessSource = `import { useState } from "react";
import { createRoot } from "react-dom/client";
import { NotificationList, type NotificationItem } from "~/puck/config/components/notification-list/notification-list";
import "./theme.css";

const initialItems: NotificationItem[] = [
  { id: "n1", title: "Alerta crítico", timestamp: "Há 2 min", read: false, priority: "alta" },
  { id: "n2", title: "Contrato pendente", timestamp: "Há 10 min", read: false, priority: "normal" },
  { id: "n3", title: "Lote conciliado", timestamp: "Há 1 hora", read: true, priority: "baixa" },
];

declare global {
  interface Window {
    __notifApi?: {
      rerenderEquivalent: () => void;
      markSecondExternally: () => void;
      markFirstReadExternally: () => void;
      reopenFirstAndAddFourth: () => void;
    };
    __notifEvents?: { toggled: Array<[string, boolean]>; markedAllCount: number };
  }
}

window.__notifEvents = { toggled: [], markedAllCount: 0 };

function Harness() {
  const [items, setItems] = useState<NotificationItem[]>(() => structuredClone(initialItems));
  window.__notifApi = {
    rerenderEquivalent: () => setItems((curr) => structuredClone(curr)),
    markSecondExternally: () =>
      setItems((curr) => curr.map((item) => (item.id === "n2" ? { ...item, read: true } : { ...item }))),
    markFirstReadExternally: () =>
      setItems([
        { ...initialItems[0], read: true },
        { ...initialItems[1], read: true },
        { ...initialItems[2], read: true },
      ]),
    reopenFirstAndAddFourth: () =>
      setItems([
        { ...initialItems[0], read: false },
        { ...initialItems[1], read: true },
        { ...initialItems[2], read: true },
        { id: "n4", title: "Novo alerta externo", timestamp: "Agora", read: false, priority: "normal" },
      ]),
  };

  return (
    <div data-accio-theme="" data-theme-mode="light" data-theme-preset="default" className="min-h-screen bg-background p-6 text-foreground">
      <NotificationList
        title="Harness Externo"
        items={items}
        grouped={true}
        showReadToggle={true}
        showMarkAllAction={true}
        onToggleRead={(item) => {
          window.__notifEvents?.toggled.push([item.id ?? item.title, item.read]);
        }}
        onMarkAllRead={(nextItems) => {
          if (window.__notifEvents) window.__notifEvents.markedAllCount = nextItems.length;
        }}
      />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Harness />);
`;
    fs.writeFileSync(path.join(exportedFrontend, "src", "main.tsx"), harnessSource, "utf8");
    for (const args of [["run", "typecheck"], ["run", "build"]]) {
      const result = spawnSync(NPM_BIN, args, {
        cwd: exportedFrontend,
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      });
      if (result.status !== 0) {
        throw new Error(`Harness failed on npm ${args.join(" ")}:\n${result.stdout}\n${result.stderr}`);
      }
    }

    const harnessPort = PREVIEW_PORT + 1;
    const harnessServer = spawn(
      process.execPath,
      [
        path.join(exportedFrontend, "node_modules/vite/bin/vite.js"),
        "preview",
        "--host",
        "127.0.0.1",
        "--port",
        String(harnessPort),
        "--strictPort",
      ],
      { cwd: exportedFrontend, stdio: "ignore" }
    );
    try {
      const harnessUrl = `http://127.0.0.1:${harnessPort}/`;
      await waitForHttp(harnessUrl);
      await client.setViewport(1280, 800, false);
      await client.goto(harnessUrl);
      await client.waitFor(
        `document.body.innerText.includes('Harness Externo') && document.body.innerText.includes('2 não lidas')`,
        10000,
        "Notification harness mounted"
      );

      // Focus + Enter toggles n1 to read
      await client.eval(`document.querySelector('[data-slot="toggle-read"][data-notification-key="n1"]').focus()`);
      await client.pressEnter();
      await client.waitFor(
        `document.body.innerText.includes('1 não lida')
          && Boolean(document.querySelector('[data-section="read"] [data-notification-key="n1"]'))`,
        3000,
        "Harness n1 toggled"
      );
      assert.equal(
        await client.eval(`document.activeElement?.dataset?.notificationKey`),
        "n1"
      );

      // Equivalent new array reference preserves local read override on n1
      await client.eval(`window.__notifApi.rerenderEquivalent()`);
      await wait(100);
      assert.equal(
        await client.eval(`document.body.innerText.includes('1 não lida')
          && Boolean(document.querySelector('[data-section="read"] [data-notification-key="n1"]'))`),
        true,
        "Equivalent array reference must not reset local read state"
      );

      // Real external update on n2 updates n2 while preserving n1 override
      await client.eval(`window.__notifApi.markSecondExternally()`);
      await client.waitFor(`document.body.innerText.includes('0 não lidas')`, 3000, "External n2 read update applied");

      // Toggle n1 back to unread locally, then push external sync where n1 becomes read=true, then reopen n1 externally & add n4
      await client.eval(`document.querySelector('[data-slot="toggle-read"][data-notification-key="n1"]').click()`);
      await client.waitFor(`document.body.innerText.includes('1 não lida')`, 3000, "n1 reopened locally");
      await client.eval(`window.__notifApi.markFirstReadExternally()`);
      await client.waitFor(`document.body.innerText.includes('0 não lidas')`, 3000, "Real external sync on n1 applied");
      await client.eval(`window.__notifApi.reopenFirstAndAddFourth()`);
      await client.waitFor(
        `document.body.innerText.includes('2 não lidas')
          && document.body.innerText.includes('Novo alerta externo')
          && Boolean(document.querySelector('[data-section="unread"] [data-notification-key="n1"]'))`,
        3000,
        "External reopen of n1 and added n4 applied"
      );

      // Mark all read and verify callback receives all 4 items
      await client.eval(`document.querySelector('[data-slot="mark-all-read"]').click()`);
      await client.waitFor(`document.body.innerText.includes('0 não lidas')`, 3000, "Harness marked all read");
      const events = await client.eval(`window.__notifEvents`);
      assert.ok(events.toggled.some(([id, read]) => id === "n1" && read === true));
      assert.equal(events.markedAllCount, 4);
      console.log("✔ NotificationList equivalent-array stability and real external updates verified");
    } finally {
      harnessServer.kill("SIGTERM");
    }

    assert.equal(client.errors.length, 0, `Browser errors:\n${client.errors.join("\n")}`);
    console.log("✔ ALL PHASE 8.2 BROWSER + EXPORT VALIDATIONS PASSED WITH 0 ERRORS!");
  } finally {
    if (client) client.close();
    server.kill("SIGTERM");
    chrome.kill("SIGTERM");
    await wait(500);
    fs.rmSync(tempDataDir, { recursive: true, force: true });
    fs.rmSync(exportExtractDir, { recursive: true, force: true });
    fs.rmSync(chromeProfileDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
