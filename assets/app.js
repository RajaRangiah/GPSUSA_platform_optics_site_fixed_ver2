// Lightweight client-side handling.
// This demo form does not submit anywhere by default.
// Replace with your endpoint or form provider as needed.

// Hamburger menu toggle
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navLinks.classList.toggle("active");
    });

    // Close menu when clicking on a link
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navLinks.classList.remove("active");
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove("active");
        navLinks.classList.remove("active");
      }
    });
  }
});

// Interactive reference architecture panel
(function(){
  const panel = document.getElementById('archPanel');
  if(!panel) return;

  const copy = {
    workloads: {
      title: "Workloads",
      bullets: [
        "Classify traffic: batch vs interactive, agentic vs single-shot, long-context vs short.",
        "Define cost envelopes and p99 targets per class.",
        "Route by complexity and budget — not by default endpoints."
      ]
    },
    runtime: {
      title: "Runtime",
      bullets: [
        "Measure KV-cache behavior, decode efficiency, batching dynamics, and CPU bottlenecks.",
        "Tune concurrency and batching under policy constraints.",
        "Stabilize tail latency by enforcing runtime guardrails."
      ]
    },
    scheduler: {
      title: "Scheduler",
      bullets: [
        "Enforce tenant fairness and priority tiers (noisy-neighbor suppression).",
        "Allocate GPU-seconds as a governed unit — not best-effort queuing.",
        "Reduce fragmentation waste with policy-aware placement."
      ]
    },
    observability: {
      title: "Observability",
      bullets: [
        "Fleet telemetry for tokens/sec/$, p99, GPU-seconds fairness, and leakage.",
        "Drill-down by tenant, model, workload class, and runtime surface.",
        "Alert on drift: regressions in unit economics and stability."
      ]
    },
    economics: {
      title: "Economics",
      bullets: [
        "Compute true unit economics: cost-per-token and tokens/sec/$.",
        "Attribute spend by tenant and feature — CFO-defensible.",
        "Capacity planning: build vs rent, tiering strategies, and risk controls."
      ]
    },
    governance: {
      title: "Governance",
      bullets: [
        "Policies are enforced at runtime: cost, fairness, and performance together.",
        "Guardrails prevent drift and regressions automatically.",
        "Closed loop: model → runtime → scheduler → cost → policy."
      ]
    }
  };

  function render(key){
    const item = copy[key] || copy.governance;
    panel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div style="font-weight:800;font-size:16px">${item.title}</div>
        <div class="badge">Platform layer</div>
      </div>
      <ul style="margin:10px 0 0;padding-left:18px;color:rgba(156,163,175,.95);line-height:1.7">
        ${item.bullets.map(b => `<li>${b}</li>`).join("")}
      </ul>
    `;
  }

  render("governance");

  document.querySelectorAll('[data-arch]').forEach(btn => {
    btn.addEventListener('click', () => render(btn.getAttribute('data-arch')));
  });
})();

function highlightLayer(layer){
  const desc = {
    workloads:"Traffic classification, workload cost envelopes, routing constraints.",
    runtime:"KV cache, batching, decode efficiency, concurrency tuning.",
    scheduler:"GPU fairness, priority tiers, tenant isolation.",
    observability:"Fleet telemetry, tokens/sec/$, p99, drift detection.",
    economics:"Cost attribution, unit economics, capacity planning.",
    governance:"Runtime policy enforcement across system stack."
  };
  document.getElementById("archDesc").innerText = desc[layer] || "";
}

function gpsusaAnimateNumber(el, from, to, durationMs, fmt){
  const start = performance.now();
  function step(t){
    const p = Math.min(1, (t - start) / durationMs);
    const v = from + (to - from) * (1 - Math.pow(1 - p, 3));
    el.textContent = fmt ? fmt(v) : v.toFixed(1);
    if(p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function gpsusaLineChart(svgEl, xs, ys, opts){
  if(!svgEl) return;
  const W = 600, H = 180, pad = 18;
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const span = (maxY - minY) || 1;

  function x(i){ return pad + (W - 2*pad) * (i/(ys.length-1 || 1)); }
  function y(v){
    const norm = (v - minY) / span;
    return (H - pad) - norm * (H - 2*pad);
  }

  // background grid
  const gridLines = 4;
  let grid = "";
  for(let i=0;i<=gridLines;i++){
    const yy = pad + (H - 2*pad) * (i/gridLines);
    grid += `<line x1="${pad}" y1="${yy}" x2="${W-pad}" y2="${yy}" stroke="rgba(255,255,255,.08)" stroke-width="1"/>`;
  }

  // line path
  let d = "";
  ys.forEach((v,i)=>{
    d += (i===0? "M":"L") + x(i).toFixed(1) + "," + y(v).toFixed(1) + " ";
  });

  const stroke = (opts && opts.stroke) || "rgba(34,197,94,.75)";
  const fill = (opts && opts.fill) || "rgba(34,197,94,.10)";

  // area
  const area = `${d} L ${x(ys.length-1).toFixed(1)},${(H-pad).toFixed(1)} L ${x(0).toFixed(1)},${(H-pad).toFixed(1)} Z`;

  svgEl.innerHTML = `
    <rect x="0" y="0" width="${W}" height="${H}" rx="14" fill="rgba(255,255,255,.01)" />
    ${grid}
    <path d="${area}" fill="${fill}"></path>
    <path d="${d}" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round"></path>
  `;
}

function gpsusaSparkBars(svgEl, ys, opts){
  if(!svgEl) return;
  const W=600,H=180,pad=18;
  const maxY = Math.max(...ys) || 1;
  const n = ys.length;
  const bw = (W - 2*pad) / (n*1.6);
  const gap = bw*0.6;
  const fill = (opts && opts.fill) || "rgba(124,58,237,.55)";
  let bars = "";
  ys.forEach((v,i)=>{
    const h = (H - 2*pad) * (v / maxY);
    const x = pad + i*(bw+gap);
    const y = (H - pad) - h;
    bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="6" fill="${fill}"></rect>`;
  });
  svgEl.innerHTML = `<rect x="0" y="0" width="${W}" height="${H}" rx="14" fill="rgba(255,255,255,.01)" />${bars}`;
}

// Mode toggle: CFO vs CTO
(function(){
  const sw = document.getElementById("modeSwitch");
  const badge = document.getElementById("modeBadge");
  const ctoPanel = document.getElementById("ctoPanel");
  const dashTitle = document.getElementById("dashTitle");
  const dashSub = document.getElementById("dashSub");
  const callout = document.getElementById("modeCallout");
  if(!sw) return;

  function apply(mode){
    sw.setAttribute("data-mode", mode);
    const isCto = mode === "cto";
    if(badge) badge.textContent = isCto ? "CTO Mode" : "CFO Mode";
    if(ctoPanel) ctoPanel.classList.toggle("hidden", !isCto);
    if(dashTitle) dashTitle.textContent = isCto ? "CTO dashboard (live mock telemetry)" : "CFO dashboard (live mock telemetry)";
    if(dashSub) dashSub.textContent = isCto
      ? "Same data, CTO framing: latency stability, leakage drivers, and control surfaces."
      : "Unit economics, fairness, leakage, and p99 stability — shown as CFO-defensible metrics (mock telemetry).";
    if(callout) callout.innerHTML = isCto
      ? "<strong>CTO framing:</strong> focus on the levers: routing, runtime guardrails, fairness enforcement, and drift control."
      : "<strong>Why this matters:</strong> CFO Mode focuses on predictable spend and defendable unit economics. Toggle to CTO Mode to see the engineering surfaces that make these metrics real.";
  }

  function toggle(){
    const cur = sw.getAttribute("data-mode") || "cfo";
    apply(cur === "cfo" ? "cto" : "cfo");
  }

  sw.addEventListener("click", toggle);
  sw.addEventListener("keydown", (e)=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); toggle(); }});
  apply("cfo");
})();

// Live mock telemetry + animated charts
(async function(){
  const target = document.getElementById("dashboard");
  if(!target) return;

  try{
    const res = await fetch("assets/mock_telemetry.json", {cache:"no-store"});
    const data = await res.json();

    const f = data.fleet;

    const tpsd = f.tokens_per_sec_per_dollar;
    const cpm = f.cost_per_million_tokens;
    const fair = f.fairness_index;

    const tpsdEl = document.getElementById("kpi_tpsd");
    const tpsdDelta = document.getElementById("kpi_tpsd_delta");
    const cpmEl = document.getElementById("kpi_cpm");
    const cpmDelta = document.getElementById("kpi_cpm_delta");
    const fairEl = document.getElementById("kpi_fair");
    const fairDelta = document.getElementById("kpi_fair_delta");

    const pct = (a,b)=> ((b-a)/a)*100;

    if(tpsdEl){
      gpsusaAnimateNumber(tpsdEl, tpsd.baseline, tpsd.governed, 700, v=>v.toFixed(1));
      tpsdDelta.textContent = `Baseline ${tpsd.baseline.toFixed(1)} → Governed ${tpsd.governed.toFixed(1)} (${pct(tpsd.baseline,tpsd.governed).toFixed(0)}%)`;
    }
    if(cpmEl){
      gpsusaAnimateNumber(cpmEl, cpm.baseline, cpm.governed, 700, v=>"$" + v.toFixed(2));
      cpmDelta.textContent = `Baseline $${cpm.baseline.toFixed(2)} → Governed $${cpm.governed.toFixed(2)} (${pct(cpm.baseline,cpm.governed).toFixed(0)}%)`;
    }
    if(fairEl){
      gpsusaAnimateNumber(fairEl, fair.baseline, fair.governed, 700, v=>v.toFixed(2));
      fairDelta.textContent = `Baseline ${fair.baseline.toFixed(2)} → Governed ${fair.governed.toFixed(2)}`;
    }

    const s = data.series;

    gpsusaLineChart(document.getElementById("chart_tpsd"), s.days, s.tokens_per_sec_per_dollar, {stroke:"rgba(34,197,94,.75)", fill:"rgba(34,197,94,.10)"});
    // cpm doesn't have series; derive from tpsd for demo (inverse-ish)
    const cpmSeries = s.tokens_per_sec_per_dollar.map(v => 150/v); // mock
    gpsusaLineChart(document.getElementById("chart_cpm"), s.days, cpmSeries, {stroke:"rgba(124,58,237,.75)", fill:"rgba(124,58,237,.10)"});
    const fairSeries = s.tokens_per_sec_per_dollar.map((v,i)=> 0.70 + (i/(s.days.length-1))*0.22);
    gpsusaLineChart(document.getElementById("chart_fair"), s.days, fairSeries, {stroke:"rgba(229,231,235,.65)", fill:"rgba(229,231,235,.06)"});

    gpsusaSparkBars(document.getElementById("chart_leak"), s.leakage_percent, {fill:"rgba(124,58,237,.55)"});
    gpsusaLineChart(document.getElementById("chart_p99"), s.days, s.p99_latency_ms, {stroke:"rgba(34,197,94,.75)", fill:"rgba(34,197,94,.10)"});
  }catch(e){
    // silent fail
  }
})();

// Clickable SVG architecture hotspots
(function(){
  const overlay = document.getElementById("archOverlay");
  const desc = document.getElementById("archDesc");
  if(!overlay || !desc) return;

  const copy = {
    workloads: {
      title: "Workloads",
      text: "Classify traffic and define cost envelopes + p99 targets. Route by complexity and budget — not static endpoints."
    },
    runtime: {
      title: "Runtime",
      text: "Measure KV-cache churn, decode stalls, batching dynamics, and CPU bottlenecks. Apply runtime guardrails under policy."
    },
    scheduler: {
      title: "Scheduler",
      text: "Enforce GPU-seconds fairness, priority tiers, and isolation to prevent noisy-neighbor drift and fragmentation waste."
    },
    observability: {
      title: "Observability",
      text: "Fleet telemetry by tenant/model/class. Detect drift in leakage, p99 stability, and unit economics."
    },
    economics: {
      title: "Economics",
      text: "Compute cost-per-token and tokens/sec/$. Attribute spend by tenant and feature for CFO-grade predictability."
    },
    governance: {
      title: "Governance",
      text: "Policies are enforced at runtime across the stack. Closed loop: model → runtime → scheduler → cost → governance."
    }
  };

  function render(k){
    const item = copy[k] || copy.governance;
    desc.innerHTML = `<div class="callout"><strong>${item.title}:</strong> ${item.text}</div>`;
  }

  render("governance");

  overlay.querySelectorAll(".arch-hotspot").forEach(el=>{
    el.addEventListener("click", ()=> render(el.getAttribute("data-layer")));
  });
})();

(function(){
  const desc = {
    model: "Model layer drives token generation patterns → impacts compute cost and latency risk.",
    runtime: "Runtime determines batching, KV cache efficiency, and decode speed → impacts cost per token.",
    scheduler: "Scheduler controls GPU allocation fairness → impacts multi-tenant cost and performance stability.",
    cost: "Cost layer converts system signals into unit economics → enables budgeting and forecasting.",
    governance: "Governance enforces policy → prevents cost drift and performance risk automatically."
  };

  document.querySelectorAll(".causal-box").forEach(el=>{
    el.addEventListener("click", ()=>{
      document.getElementById("causalDesc").innerHTML =
        "<strong>"+el.dataset.layer.toUpperCase()+"</strong>: " + desc[el.dataset.layer];
    });
  });
})();


// Causal stack interactions (Technology page)
document.addEventListener("DOMContentLoaded", () => {
  const boxes = document.querySelectorAll(".causal-box");
  const out = document.getElementById("causalDesc");
  if(!boxes.length || !out) return;

  const desc = {
    model: {
      title: "Model",
      text: "The model defines demand: token volume, context length, tool-calling frequency, and decode behavior. Business impact: cost volatility and latency risk. Constraint: model-tiering and routing by complexity and budget."
    },
    runtime: {
      title: "Runtime",
      text: "The runtime turns tokens into GPU behavior: batching, KV-cache efficiency, decode stalls, and CPU bottlenecks. Business impact: cost-per-token and p99 instability. Constraint: enforce runtime guardrails under policy."
    },
    scheduler: {
      title: "Scheduler",
      text: "The scheduler allocates GPU-seconds across tenants and workloads. Business impact: noisy-neighbor risk and capacity fairness. Constraint: priority tiers + fairness enforcement + isolation to prevent drift."
    },
    cost: {
      title: "Cost",
      text: "Cost translates system signals into unit economics: tokens/sec/$, cost per 1M tokens, and leakage %. Business impact: budgeting and margin predictability. Constraint: cost envelopes per workload class and tenant attribution."
    },
    governance: {
      title: "Governance",
      text: "Governance enforces business constraints at runtime. Business impact: predictable spend + stable SLOs. Constraint: policy-as-code with drift detection and enforcement."
    }
  };

  function render(key){
    const item = desc[key] || desc.governance;
    out.innerHTML = `<strong>${item.title}:</strong> ${item.text}`;
  }

  boxes.forEach((b) => {
    const key = b.getAttribute("data-layer");
    b.addEventListener("click", () => render(key));
    b.addEventListener("keydown", (e) => {
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        render(key);
      }
    });
  });
});

// Contact page phone display (configurable)
document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("phoneDisplay");
  if(!el) return;
  const cfg = window.GPSUSA_CONFIG || {};
  el.textContent = cfg.PHONE_DISPLAY || "TBD";
});


// Generic form submit UX (stay on page)
function gpsusaSubmitStart(){
  const status = document.getElementById("formStatus");
  if(status){
    status.style.display = "block";
    status.innerHTML = "<strong>Submitting…</strong>";
  }
  return true; // allow submission into hidden iframe
}

document.addEventListener("DOMContentLoaded", () => {
  const iframe = document.getElementById("hidden_iframe");
  const status = document.getElementById("formStatus");
  if(!iframe || !status) return;

  // Show success after iframe loads (post submit)
  iframe.addEventListener("load", () => {
    if(status.style.display === "block"){
      status.innerHTML = "<strong>The form is successfully submitted.</strong>";
    }
  });
});
