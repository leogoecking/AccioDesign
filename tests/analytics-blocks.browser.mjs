import assert from "node:assert/strict";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import JSZip from "jszip";

const PORT = 4185;
const PREVIEW_PORT = 4186;
const CDP_PORT = 9235;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const NPM_BIN = fs.existsSync("/home/leogoecking/.local/share/mise/shims/npm")
  ? "/home/leogoecking/.local/share/mise/shims/npm"
  : "npm";

const repoRoot = process.cwd();
const screenshotsDir = path.join(repoRoot, "docs", "screenshots");
const tempDataDir = `/tmp/accio-analytics-data-${process.pid}`;
const exportExtractDir = `/tmp/accio-analytics-export-${process.pid}`;
const chromeProfileDir = `/tmp/accio-analytics-chrome-${process.pid}`;

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
    this.warnings = [];
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
      } else if (msg.method === "Runtime.consoleAPICalled") {
        const text = (msg.params.args || [])
          .map((arg) => arg.value ?? arg.description ?? "")
          .join(" ");
        if (msg.params?.type === "error") {
          this.errors.push(`console.error: ${text}`);
        } else if (
          msg.params?.type === "warning" &&
          text.includes("width(-1)")
        ) {
          this.warnings.push(text);
        }
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
    await wait(500);
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

function buildAnalyticsCompositionDoc(baseData) {
  const doc = structuredClone(baseData);
  doc.root.props.title = "Painel Analítico — Receita e Operação";
  doc.root.props.layoutWidth = { mode: "fluid" };
  doc.root.props.navigationMode = "sidebar";

  doc.content = [
    {
      type: "AppSidebar",
      props: {
        id: "analytics-shell",
        brandName: "PulseAnalytics",
        brandSubtitle: "Indicadores Executivos",
        brandIcon: "bar-chart-3",
        bordered: true,
        groups: [
          {
            title: "Análises",
            items: [
              {
                label: "Visão Analítica",
                url: "#visao",
                icon: "bar-chart-3",
                badge: "5",
                active: true,
              },
              {
                label: "Receita & MRR",
                url: "#receita",
                icon: "trending-up",
                badge: "",
                active: false,
              },
              {
                label: "Atendimento",
                url: "#atendimento",
                icon: "inbox",
                badge: "18",
                active: false,
              },
            ],
          },
        ],
        user: {
          name: "Marina Costa",
          role: "Head de Dados",
          initials: "MC",
        },
        content: [
          {
            type: "PageHeader",
            props: {
              id: "analytics-header",
              title: "Análise de Receita e Operação",
              subtitle:
                "Acompanhamento de receita recorrente, metas de conversão, canais e distribuição de demandas.",
              badge: {
                label: "Tempo real",
                url: "",
                variant: "secondary",
              },
              actions: [
                {
                  label: "Exportar relatório",
                  url: "#relatorio",
                  variant: "outline",
                  size: "default",
                  icon: "download",
                },
              ],
              showSeparator: true,
              padding: { top: "none", bottom: "small" },
            },
          },
          {
            type: "DashboardGrid",
            props: {
              id: "analytics-spark-grid",
              sectionTitle: "Tendências rápidas",
              sectionDescription: "Indicadores-chave com série histórica recente.",
              columns: "2",
              gap: "md",
              padding: { top: "none", bottom: "small" },
              items: [
                {
                  type: "SparklineCard",
                  props: {
                    id: "spark-mrr",
                    title: "Receita Mensal (MRR)",
                    value: "R$ 482.900",
                    delta: "+14,2%",
                    trend: "up",
                    helperText: "Tendência das últimas 7 semanas",
                    badgeLabel: "Em alta",
                    badgeVariant: "secondary",
                    icon: "dollar-sign",
                    chartType: "area",
                    color: "chart-1",
                    height: "md",
                    valueFormat: "currency",
                    unit: "",
                    showTooltip: true,
                    data: [
                      { label: "Sem 1", value: 392000 },
                      { label: "Sem 2", value: 408500 },
                      { label: "Sem 3", value: 419000 },
                      { label: "Sem 4", value: 435200 },
                      { label: "Sem 5", value: 448900 },
                      { label: "Sem 6", value: 467400 },
                      { label: "Sem 7", value: 482900 },
                    ],
                  },
                },
                {
                  type: "SparklineCard",
                  props: {
                    id: "spark-tickets",
                    title: "Chamados Resolvidos",
                    value: "1.258",
                    delta: "+8,6%",
                    trend: "up",
                    helperText: "Volume diário concluído dentro do SLA",
                    badgeLabel: "7 dias",
                    badgeVariant: "outline",
                    icon: "activity",
                    chartType: "bar",
                    color: "chart-2",
                    height: "md",
                    valueFormat: "number",
                    unit: "chamados",
                    showTooltip: true,
                    data: [
                      { label: "Seg", value: 152 },
                      { label: "Ter", value: 174 },
                      { label: "Qua", value: 168 },
                      { label: "Qui", value: 190 },
                      { label: "Sex", value: 204 },
                      { label: "Sáb", value: 178 },
                      { label: "Dom", value: 192 },
                    ],
                  },
                },
              ],
            },
          },
          {
            type: "DashboardGrid",
            props: {
              id: "analytics-charts-top",
              columns: "2",
              gap: "md",
              padding: { top: "none", bottom: "small" },
              items: [
                {
                  type: "AreaChart",
                  props: {
                    id: "area-primary",
                    title: "Receita Recorrente e Custos",
                    description: "Comparativo mensal entre faturamento e custos.",
                    badgeLabel: "6 meses",
                    valueFormat: "currency",
                    unit: "",
                    height: "md",
                    curveType: "monotone",
                    fillStyle: "gradient",
                    stacked: false,
                    showGrid: true,
                    showXAxis: true,
                    showYAxis: true,
                    showLegend: true,
                    primarySeries: { label: "Receita", color: "chart-1" },
                    showSecondarySeries: true,
                    secondarySeries: { label: "Custos", color: "chart-2" },
                    data: [
                      { label: "Jan", primary: 68400, secondary: 41200 },
                      { label: "Fev", primary: 73900, secondary: 43800 },
                      { label: "Mar", primary: 81200, secondary: 46500 },
                      { label: "Abr", primary: 79400, secondary: 45100 },
                      { label: "Mai", primary: 91600, secondary: 48900 },
                      { label: "Jun", primary: 98500, secondary: 51300 },
                    ],
                    padding: { top: "none", bottom: "none" },
                  },
                },
                {
                  type: "BarChart",
                  props: {
                    id: "bar-channels",
                    title: "Atendimentos por Canal",
                    description: "Chamados concluídos vs. pendentes na semana.",
                    badgeLabel: "Semana atual",
                    valueFormat: "number",
                    unit: "",
                    height: "md",
                    orientation: "horizontal",
                    stacked: false,
                    barRadius: "sm",
                    showGrid: true,
                    showXAxis: true,
                    showYAxis: true,
                    showLegend: true,
                    primarySeries: { label: "Concluídos", color: "chart-1" },
                    showSecondarySeries: true,
                    secondarySeries: { label: "Pendentes", color: "chart-3" },
                    data: [
                      { label: "Chat", primary: 340, secondary: 42 },
                      { label: "Portal", primary: 265, secondary: 38 },
                      { label: "E-mail", primary: 210, secondary: 55 },
                      { label: "Telefone", primary: 148, secondary: 19 },
                    ],
                    padding: { top: "none", bottom: "none" },
                  },
                },
              ],
            },
          },
          {
            type: "DashboardGrid",
            props: {
              id: "analytics-charts-bottom",
              columns: "2",
              gap: "md",
              padding: { top: "none", bottom: "none" },
              items: [
                {
                  type: "LineChart",
                  props: {
                    id: "line-conversion",
                    title: "Taxa de Conversão vs. Meta",
                    description: "Evolução semanal em percentual de ativação.",
                    badgeLabel: "Trimestre",
                    valueFormat: "percent",
                    unit: "",
                    height: "md",
                    curveType: "monotone",
                    showDots: true,
                    dashedSecondary: true,
                    showGrid: true,
                    showXAxis: true,
                    showYAxis: true,
                    showLegend: true,
                    primarySeries: { label: "Conversão real", color: "chart-1" },
                    showSecondarySeries: true,
                    secondarySeries: { label: "Meta definida", color: "chart-4" },
                    data: [
                      { label: "Sem 1", primary: 3.8, secondary: 4.2 },
                      { label: "Sem 2", primary: 4.1, secondary: 4.2 },
                      { label: "Sem 3", primary: 4.5, secondary: 4.5 },
                      { label: "Sem 4", primary: 4.3, secondary: 4.5 },
                      { label: "Sem 5", primary: 4.9, secondary: 4.8 },
                      { label: "Sem 6", primary: 5.4, secondary: 4.8 },
                    ],
                    padding: { top: "none", bottom: "none" },
                  },
                },
                {
                  type: "DonutChart",
                  props: {
                    id: "donut-categories",
                    title: "Distribuição por Categoria",
                    description: "Participação por frente de atendimento.",
                    badgeLabel: "Mês vigente",
                    valueFormat: "number",
                    unit: "chamados",
                    height: "md",
                    variant: "donut",
                    showCenterTotal: true,
                    centerLabel: "Total no mês",
                    showLegend: true,
                    data: [
                      { label: "Suporte N1", value: 420, color: "chart-1" },
                      { label: "Financeiro", value: 285, color: "chart-2" },
                      { label: "Integrações", value: 195, color: "chart-3" },
                      { label: "Acessos", value: 140, color: "chart-4" },
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

    // 1. Validate 5 blocks individually + multi-instance + empty/zero states
    const edgeCaseProject = await createProject("em-branco", "Bordas e Múltiplas Instâncias");
    const edgeDoc = structuredClone(edgeCaseProject.design);
    edgeDoc.content = [
      {
        type: "AreaChart",
        props: {
          id: "area-multi-1",
          title: "Área Zero",
          valueFormat: "number",
          height: "sm",
          curveType: "step",
          fillStyle: "solid",
          stacked: true,
          showGrid: false,
          showXAxis: true,
          showYAxis: true,
          showLegend: false,
          primarySeries: { label: "Zeros", color: "chart-1" },
          showSecondarySeries: false,
          data: [
            { label: "D1", primary: 0 },
            { label: "D2", primary: 0 },
            { label: "D3", primary: 0 },
          ],
        },
      },
      {
        type: "AreaChart",
        props: {
          id: "area-multi-2",
          title: "Área Vazia",
          valueFormat: "currency",
          height: "lg",
          primarySeries: { label: "Receita", color: "chart-2" },
          showSecondarySeries: false,
          data: [],
          emptyMessage: "Sem lançamentos no período selecionado.",
        },
      },
      {
        type: "BarChart",
        props: {
          id: "bar-zero",
          title: "Barras com Zero",
          orientation: "vertical",
          barRadius: "none",
          primarySeries: { label: "Ocorrências", color: "chart-3" },
          showSecondarySeries: false,
          data: [
            { label: "Seg", primary: 0 },
            { label: "Ter", primary: 0 },
          ],
        },
      },
      {
        type: "LineChart",
        props: {
          id: "line-zero",
          title: "Linha Vazia",
          primarySeries: { label: "SLA", color: "chart-4" },
          showSecondarySeries: false,
          data: [],
          emptyMessage: "Nenhuma medição disponível.",
        },
      },
      {
        type: "DonutChart",
        props: {
          id: "donut-pie-zero",
          title: "Pizza Zerada",
          variant: "pie",
          data: [{ label: "Sem movimento", value: 0, color: "chart-5" }],
        },
      },
      {
        type: "SparklineCard",
        props: {
          id: "spark-empty",
          title: "Indicador Sem Histórico",
          value: "0",
          delta: "0%",
          trend: "neutral",
          chartType: "line",
          data: [],
        },
      },
    ];
    await saveProject(edgeCaseProject.id, edgeDoc, edgeCaseProject.design.root.props.title);
    await client.goto(`${BASE_URL}/projects/${edgeCaseProject.id}`);
    await client.waitFor(
      `document.body.innerText.includes('Sem lançamentos no período selecionado.') && document.body.innerText.includes('Distribuição zerada') && document.body.innerText.includes('Sem histórico disponível')`,
      10000,
      "Empty and zero states rendered"
    );
    const svgDuplicateIds = await client.eval(`(() => {
      const ids = [...document.querySelectorAll('svg defs [id], [data-chart]')].map(el => el.id || el.getAttribute('data-chart'));
      return ids.length - new Set(ids).size;
    })()`);
    assert.equal(svgDuplicateIds, 0, "Expected zero duplicate SVG/chart IDs");
    console.log("✔ Empty, zero and multi-instance SVG ID checks passed");

    // 2. Full 5-block analytics composition across Experimentar, Editar and Apresentar
    const comp = await createProject("em-branco", "Painel Analítico Completo");
    const compDoc = buildAnalyticsCompositionDoc(comp.design);
    await saveProject(comp.id, compDoc, "Painel Analítico Completo");

    // Check Experimentar -> Violet Bloom Dark + screenshot
    await client.goto(`${BASE_URL}/play/${comp.id}`);
    await client.waitFor(
      `(() => {
        const doc = document.querySelector('[data-testid="playground-preview-iframe"]')?.contentDocument;
        return doc?.querySelectorAll('[data-slot="chart"]').length === 6 && doc.body.innerText.includes('Distribuição por Categoria');
      })()`,
      15000,
      "Playground iframe rendered all 6 chart containers"
    );
    await client.eval(`document.querySelector('[data-testid="preset-option-violet-bloom"]').click()`);
    await client.eval(`document.querySelector('[data-testid="playground-mode-toggle"]').click()`);
    await client.waitFor(
      `(() => {
        const root = document.querySelector('[data-testid="playground-preview-iframe"]').contentDocument.querySelector('[data-accio-theme]');
        return root?.getAttribute('data-theme-preset') === 'violet-bloom' && root?.getAttribute('data-theme-mode') === 'dark';
      })()`,
      5000,
      "Playground switched to Violet Bloom Dark"
    );
    const iframeSvgDuplicates = await client.eval(`(() => {
      const doc = document.querySelector('[data-testid="playground-preview-iframe"]').contentDocument;
      const ids = [...doc.querySelectorAll('svg defs [id], [data-chart]')].map(el => el.id || el.getAttribute('data-chart'));
      return ids.length - new Set(ids).size;
    })()`);
    assert.equal(iframeSvgDuplicates, 0, "Zero duplicate IDs inside Playground iframe");
    await client.screenshot("analytics-composition-dark.png");
    console.log("✔ Playground analytics dark mode + screenshot saved");

    // Reset theme back to default light & save for clean Light parity check
    await client.eval(`document.querySelector('[data-testid="preset-option-default"]').click()`);
    await client.eval(`document.querySelector('[data-testid="playground-mode-toggle"]').click()`);
    await client.eval(`document.querySelector('[data-testid="playground-save-button"]').click()`);
    await client.waitFor(
      `document.querySelector('[data-testid="playground-save-button"]').innerText.includes('Salvo')`,
      5000,
      "Saved light analytics composition"
    );

    // Check Editar (Puck) shows category "Gráficos e análise" and all 5 chart components
    await client.goto(`${BASE_URL}/projects/${comp.id}/edit`);
    await client.waitFor(
      `(() => {
        const f = document.querySelector('#preview-frame');
        const text = document.body.textContent || '';
        return text.includes('Gráficos e análise')
          && text.includes('Card com Tendência')
          && f?.contentDocument?.querySelectorAll('[data-slot="chart"]').length === 6;
      })()`,
      15000,
      "Edit mode rendered Gráficos e análise category & 6 charts"
    );
    console.log("✔ Edit mode category & canvas verified");

    // Check Apresentar at 1440x900
    await client.goto(`${BASE_URL}/projects/${comp.id}`);
    await client.waitFor(
      `(() => {
        const surfaces = [...document.querySelectorAll('svg.recharts-surface')];
        return document.querySelectorAll('[data-slot="chart"]').length === 6
          && surfaces.length === 6
          && surfaces.every(el => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0;
          });
      })()`,
      10000,
      "Present mode rendered 6 charts with non-zero surfaces"
    );
    const presentMetrics = await client.eval(`(async () => {
      await document.fonts.ready;
      const scope = document.querySelector('[data-accio-theme]');
      const css = getComputedStyle(scope);
      const clone = scope.cloneNode(true);
      clone.querySelectorAll('style').forEach(el => el.remove());
      return {
        mode: scope.dataset.themeMode,
        preset: scope.dataset.themePreset,
        chartCount: document.querySelectorAll('[data-slot="chart"]').length,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        text: clone.textContent.replace(/\\s+/g, ' ').trim(),
        bg: css.backgroundColor,
        fg: css.color,
      };
    })()`);
    assert.equal(presentMetrics.chartCount, 6);
    assert.ok(presentMetrics.overflow <= 0, `Present desktop overflow: ${presentMetrics.overflow}`);
    await client.screenshot("analytics-composition-light.png", true);
    console.log("✔ Present mode light desktop verified + screenshot saved");

    // Check Mobile 390x844 on Apresentar
    await client.setViewport(390, 844, true);
    await wait(350);
    const mobileOverflow = await client.eval(
      `document.documentElement.scrollWidth - document.documentElement.clientWidth`
    );
    assert.ok(mobileOverflow <= 0, `Mobile overflow on Present: ${mobileOverflow}`);
    await client.screenshot("analytics-mobile.png");
    console.log("✔ Mobile 390x844 responsiveness verified + screenshot saved");

    // 3. Export ZIP of non-chart project AND analytics project, build standalone frontend outside repo
    const adminProj = await createProject("sistema-administrativo", "Sem Gráficos");
    const adminZipRes = await fetch(`${BASE_URL}/projects/${adminProj.id}/export`);
    const adminZip = await JSZip.loadAsync(Buffer.from(await adminZipRes.arrayBuffer()));
    const adminPkg = JSON.parse(await adminZip.file("frontend/package.json").async("string"));
    assert.equal("recharts" in adminPkg.dependencies, false, "Non-chart export must NOT include recharts");

    const analyticsZipRes = await fetch(`${BASE_URL}/projects/${comp.id}/export`);
    const zipBytes = Buffer.from(await analyticsZipRes.arrayBuffer());
    const archivePath = path.join(exportExtractDir, "analytics.zip");
    fs.writeFileSync(archivePath, zipBytes);
    execFileSync("unzip", ["-q", archivePath, "-d", exportExtractDir]);

    const exportedFrontend = path.join(exportExtractDir, "frontend");
    const exportedPkg = JSON.parse(
      fs.readFileSync(path.join(exportedFrontend, "package.json"), "utf8")
    );
    assert.ok(exportedPkg.dependencies.recharts, "Analytics export must include recharts");
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
    console.log("✔ Exported standalone React frontend installed, typechecked and built outside repo");

    // 4. Serve exported frontend independently and compare visually against Present
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
        `(() => {
          const surfaces = [...document.querySelectorAll('svg.recharts-surface')];
          return document.querySelectorAll('[data-slot="chart"]').length === 6
            && surfaces.length === 6
            && surfaces.every(el => {
              const r = el.getBoundingClientRect();
              return r.width > 0 && r.height > 0;
            });
        })()`,
        10000,
        "Exported frontend rendered 6 charts with non-zero surfaces"
      );

      const exportedMetrics = await client.eval(`(async () => {
        await document.fonts.ready;
        const scope = document.querySelector('[data-accio-theme]');
        const css = getComputedStyle(scope);
        const clone = scope.cloneNode(true);
        clone.querySelectorAll('style').forEach(el => el.remove());
        return {
          mode: scope.dataset.themeMode,
          preset: scope.dataset.themePreset,
          chartCount: document.querySelectorAll('[data-slot="chart"]').length,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          text: clone.textContent.replace(/\\s+/g, ' ').trim(),
          bg: css.backgroundColor,
          fg: css.color,
        };
      })()`);

      assert.deepStrictEqual(exportedMetrics, presentMetrics);
      await client.screenshot("analytics-exported-frontend.png", true);

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

    assert.equal(client.errors.length, 0, `Browser errors:\n${client.errors.join("\n")}`);
    assert.equal(client.warnings.length, 0, `Recharts dimension warnings:\n${client.warnings.join("\n")}`);
    console.log("✔ ALL PHASE 8.1 BROWSER + EXPORT VALIDATIONS PASSED WITH 0 ERRORS & 0 WARNINGS!");
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
