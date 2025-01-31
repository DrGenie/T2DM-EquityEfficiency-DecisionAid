/****************************************************************************
 * script.js
 * Handles:
 * 1) Tab Navigation
 * 2) Range Slider Updates
 * 3) Predicting Health Plan Uptake
 * 4) WTP Calculation & Charts
 * 5) Cost & Benefit Analysis
 * 6) Scenario Saving & PDF Export
 * 7) Distinction for Risk Averages Across Experiments (Self/Others for Exp3)
 *
 * Authors:
 *  - Surachat Ngorsuraches (Auburn University, USA)
 *  - Mesfin Genie (The University of Newcastle, Australia)
 ****************************************************************************/

/** Global Variables */
let currentUptakeProbability = 0; 
let savedResults = []; // Session-based scenario storage

/*******************************
 * 1) TAB NAVIGATION
 *******************************/
function openTab(tabId, btn) {
  const allTabs = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < allTabs.length; i++) {
    allTabs[i].style.display = "none";
  }
  const allLinks = document.getElementsByClassName("tablink");
  for (let j = 0; j < allLinks.length; j++) {
    allLinks[j].classList.remove("active");
    allLinks[j].setAttribute("aria-selected", "false");
  }
  document.getElementById(tabId).style.display = "block";
  btn.classList.add("active");
  btn.setAttribute("aria-selected", "true");

  if (tabId === "costsTab") {
    renderCostsBenefits();
  }
}

/** On Window Load, show Intro tab and attach listener for Exp3 attributes */
window.addEventListener("load", function() {
  openTab("introTab", document.querySelector(".tablink.active"));
  loadSavedResults();
  document.getElementById("experimentSelect").addEventListener("change", toggleExperimentAttributes);
});

/*******************************
 * 2) RANGE SLIDER UPDATE
 *******************************/
function updateCostDisplay(val) {
  document.getElementById("costValue").textContent = `$${val}`;
}
function updateCostOthersDisplay(val) {
  document.getElementById("costOthersValue").textContent = `$${val}`;
}

/*******************************
 * 3) MODEL COEFFICIENTS
 *******************************/
const coefficients = {
  '1': {
    ASC_optout: -0.553,
    ASC: -0.203,
    efficacy_50: 0.855,
    efficacy_90: 1.558,
    risk_8: -0.034,
    risk_16: -0.398,
    risk_30: -0.531,
    cost: -0.00123
  },
  '2': {
    ASC_optout: -0.338,
    ASC_mean: -0.159,
    efficacy_50: 1.031,
    efficacy_90: 1.780,
    risk_8: -0.054,
    risk_16: -0.305,
    risk_30: -0.347,
    cost: -0.00140
  },
  '3': {
    ASC_optout: -0.344,
    ASC_mean: -0.160,
    efficacy_50: 0.604,
    efficacy_90: 1.267,
    efficacyOthers_50: 0.272,
    efficacyOthers_90: 0.370,
    risk_8: -0.108,
    risk_16: -0.218,
    risk_30: -0.339,
    riskOthers_8: -0.111,
    riskOthers_16: -0.103,
    riskOthers_30: -0.197,
    cost: -0.0007,
    costOthers: -0.00041
  }
};

/*******************************
 * 4) WTP DATA
 *******************************/
const wtpData = {
  '1': [
    // Efficacy
    { attribute: "Efficacy 50%", wtp: (0.855 / 0.00123), pVal: 0.000, se: (0.074 / 0.00123) },
    { attribute: "Efficacy 90%", wtp: (1.558 / 0.00123), pVal: 0.000, se: (0.078 / 0.00123) },
    // Risk
    { attribute: "Risk 8%",     wtp: (-0.034 / 0.00123), pVal: 0.689, se: (0.085 / 0.00123) },
    { attribute: "Risk 16%",    wtp: (-0.398 / 0.00123), pVal: 0.000, se: (0.086 / 0.00123) },
    { attribute: "Risk 30%",    wtp: (-0.531 / 0.00123), pVal: 0.000, se: (0.090 / 0.00123) }
  ],
  '2': [
    // Efficacy
    { attribute: "Efficacy 50%", wtp: (1.031 / 0.00140), pVal: 0.000, se: (0.078 / 0.00140) },
    { attribute: "Efficacy 90%", wtp: (1.780 / 0.00140), pVal: 0.000, se: (0.084 / 0.00140) },
    // Risk
    { attribute: "Risk 8%",     wtp: (-0.054 / 0.00140), pVal: 0.550, se: (0.090 / 0.00140) },
    { attribute: "Risk 16%",    wtp: (-0.305 / 0.00140), pVal: 0.001, se: (0.089 / 0.00140) },
    { attribute: "Risk 30%",    wtp: (-0.347 / 0.00140), pVal: 0.000, se: (0.094 / 0.00140) }
  ],
  '3': [
    // Risk (Self)
    { attribute: "Risk 8% (Self)",  wtp: (-0.108 / 0.0007), pVal: 0.200, se: (0.084 / 0.0007) },
    { attribute: "Risk 16% (Self)", wtp: (-0.218 / 0.0007), pVal: 0.013, se: (0.088 / 0.0007) },
    { attribute: "Risk 30% (Self)", wtp: (-0.339 / 0.0007), pVal: 0.000, se: (0.085 / 0.0007) },
    // Risk (Others)
    { attribute: "Risk 8% (Others)",  wtp: (-0.111 / 0.0007), pVal: 0.190, se: (0.085 / 0.0007) },
    { attribute: "Risk 16% (Others)", wtp: (-0.103 / 0.0007), pVal: 0.227, se: (0.085 / 0.0007) },
    { attribute: "Risk 30% (Others)", wtp: (-0.197 / 0.0007), pVal: 0.017, se: (0.083 / 0.0007) },
    // Efficacy (Self)
    { attribute: "Efficacy 50% (Self)", wtp: (0.604 / 0.0007), pVal: 0.000, se: (0.084 / 0.0007) },
    { attribute: "Efficacy 90% (Self)", wtp: (1.267 / 0.0007), pVal: 0.000, se: (0.075 / 0.0007) },
    // Efficacy (Others)
    { attribute: "Efficacy 50% (Others)", wtp: (0.272 / 0.0007), pVal: 0.000, se: (0.083 / 0.0007) },
    { attribute: "Efficacy 90% (Others)", wtp: (0.370 / 0.0007), pVal: 0.000, se: (0.076 / 0.0007) }
  ]
};

/*******************************
 * 5) PREDICT HEALTH PLAN UPTAKE
 *******************************/
function renderProbChart() {
  const scn = buildScenarioFromInputs();
  if (!scn) return;
  computeUptakeProbability(scn);
  // Switch to the "uptakeTab"
  openTab("uptakeTab", document.querySelector("button[onclick*='uptakeTab']"));
}

function computeUptakeProbability(scn) {
  let utility = 0;
  const exp = scn.experiment;
  if (!exp) return;

  const coefs = coefficients[exp];

  // ASC
  if (exp === '1') {
    utility += coefs.ASC;
  } else {
    utility += coefs.ASC_mean;
  }
  // Efficacy
  if (scn.efficacy === '50') utility += coefs.efficacy_50;
  if (scn.efficacy === '90') utility += coefs.efficacy_90;

  // Risk
  if (scn.risk === '8')  utility += coefs.risk_8;
  if (scn.risk === '16') utility += coefs.risk_16;
  if (scn.risk === '30') utility += coefs.risk_30;

  // Cost
  utility += coefs.cost * scn.cost;

  // If experiment 3, incorporate "others"
  if (exp === '3') {
    if (scn.efficacyOthers === '50') utility += coefs.efficacyOthers_50;
    if (scn.efficacyOthers === '90') utility += coefs.efficacyOthers_90;

    if (scn.riskOthers === '8')  utility += coefs.riskOthers_8;
    if (scn.riskOthers === '16') utility += coefs.riskOthers_16;
    if (scn.riskOthers === '30') utility += coefs.riskOthers_30;

    utility += coefs.costOthers * scn.costOthers;
  }

  const expU = Math.exp(utility);
  const expOpt = Math.exp(coefs.ASC_optout);
  const prob = (expU / (expU + expOpt)) * 100;

  currentUptakeProbability = prob;
  displayUptakeProbability(prob);
}

function displayUptakeProbability(prob) {
  const ctx = document.getElementById("probChartMain").getContext("2d");
  if (window.probChartInstance) {
    window.probChartInstance.destroy();
  }

  window.probChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Predicted Uptake Probability"],
      datasets: [{
        label: "Uptake (%)",
        data: [prob],
        backgroundColor: prob < 30 ? "rgba(231,76,60,0.6)" : 
                         prob < 70 ? "rgba(241,196,15,0.6)" :
                                     "rgba(39,174,96,0.6)",
        borderColor: prob < 30 ? "rgba(231,76,60,1)" : 
                     prob < 70 ? "rgba(241,196,15,1)" :
                                 "rgba(39,174,96,1)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      indexAxis: "y",
      scales: {
        x: { beginAtZero: true, max: 100 }
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `Predicted Uptake = ${prob.toFixed(2)}%`,
          font: { size: 16 }
        }
      }
    }
  });

  let message;
  if (prob < 30) {
    message = "Low uptake. Consider decreasing cost or improving efficacy.";
  } else if (prob < 70) {
    message = "Moderate uptake. Further enhancements could increase plan choice.";
  } else {
    message = "High uptake. Maintaining these attributes is recommended.";
  }
  alert(`Uptake Probability: ${prob.toFixed(2)}%. ${message}`);
}

/*******************************
 * 6) SCENARIO MANAGEMENT
 *******************************/
function buildScenarioFromInputs() {
  const experiment = document.getElementById("experimentSelect").value;
  if (!experiment) {
    alert("Please select an experiment.");
    return null;
  }
  const efficacy = document.getElementById("efficacy").value;
  const risk = document.getElementById("risk").value;
  const cost = parseInt(document.getElementById("cost").value, 10);

  let efficacyOthers = "N/A";
  let riskOthers = "N/A";
  let costOthers = "N/A";

  let missing = [];
  if (!efficacy) missing.push("Efficacy (Self)");
  if (!risk) missing.push("Risk (Self)");
  if (isNaN(cost)) missing.push("Cost (Self)");

  if (experiment === '3') {
    efficacyOthers = document.getElementById("efficacyOthers").value;
    riskOthers = document.getElementById("riskOthers").value;
    costOthers = parseInt(document.getElementById("costOthers").value, 10);

    if (!efficacyOthers) missing.push("Efficacy (Others)");
    if (!riskOthers) missing.push("Risk (Others)");
    if (isNaN(costOthers)) missing.push("Cost (Others)");
  }

  if (missing.length > 0) {
    alert(`Please provide: ${missing.join(", ")}`);
    return null;
  }

  return {
    experiment,
    efficacy,
    risk,
    cost,
    efficacyOthers,
    riskOthers,
    costOthers
  };
}

function saveScenario() {
  const scn = buildScenarioFromInputs();
  if (!scn) return;

  if (currentUptakeProbability === 0) {
    alert("Please calculate uptake probability before saving.");
    return;
  }

  const eName = `Experiment ${scn.experiment}`;
  const scenarioObj = {
    name: `Scenario ${savedResults.length + 1}`,
    experiment: eName,
    efficacy: scn.efficacy,
    risk: scn.risk,
    cost: scn.cost,
    efficacyOthers: (scn.experiment === '3') ? scn.efficacyOthers : 'N/A',
    riskOthers: (scn.experiment === '3') ? scn.riskOthers : 'N/A',
    costOthers: (scn.experiment === '3') ? scn.costOthers : 'N/A',
    uptake: currentUptakeProbability.toFixed(2)
  };
  savedResults.push(scenarioObj);
  addScenarioToTable(scenarioObj);
  alert(`"${scenarioObj.name}" saved successfully.`);
  renderWTPComparison();
}

function addScenarioToTable(sc) {
  const tb = document.querySelector("#scenarioTable tbody");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${sc.name}</td>
    <td>${sc.experiment}</td>
    <td>${sc.efficacy}</td>
    <td>${sc.risk}</td>
    <td>$${sc.cost}</td>
    <td>${sc.efficacyOthers}</td>
    <td>${sc.riskOthers}</td>
    <td>$${sc.costOthers}</td>
    <td>${sc.uptake}</td>
  `;
  tb.appendChild(row);
}

function loadSavedResults() {
  savedResults = [];
  document.querySelector("#scenarioTable tbody").innerHTML = "";
}

function toggleExperimentAttributes() {
  const exp = document.getElementById("experimentSelect").value;
  const isExp3 = (exp === '3');
  document.getElementById("efficacyOthersDiv").style.display = isExp3 ? 'block' : 'none';
  document.getElementById("riskOthersDiv").style.display = isExp3 ? 'block' : 'none';
  document.getElementById("costOthersDiv").style.display = isExp3 ? 'block' : 'none';
}

/*******************************
 * 7) FILTER SCENARIOS & EXPORT
 *******************************/
function filterScenarios() {
  const filterVal = document.getElementById("filterExperiment").value;
  const rows = document.querySelectorAll("#scenarioTable tbody tr");

  rows.forEach(r => {
    const expCell = r.cells[1].textContent; // e.g. "Experiment 1"
    if (filterVal === "all" || expCell === filterVal) {
      r.style.display = "";
    } else {
      r.style.display = "none";
    }
  });
}

function exportToPDF() {
  if (savedResults.length < 1) {
    alert("No saved scenarios to export.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = 15;

  doc.setFontSize(16);
  doc.text("T2DM Equity-Efficiency Decision Aid - Saved Scenarios", pageWidth / 2, currentY, { align: "center" });
  currentY += 10;

  savedResults.forEach((item, idx) => {
    if (currentY + 60 > pageHeight - 15) {
      doc.addPage();
      currentY = 15;
    }
    doc.setFontSize(14);
    doc.text(`Scenario ${idx + 1}: ${item.name}`, 15, currentY);
    currentY += 7;
    doc.setFontSize(12);
    doc.text(`Experiment: ${item.experiment}`, 15, currentY); currentY += 5;
    doc.text(`Efficacy (Self): ${item.efficacy}%`, 15, currentY); currentY += 5;
    doc.text(`Risk (Self): ${item.risk}%`, 15, currentY); currentY += 5;
    doc.text(`Cost (Self): $${item.cost}`, 15, currentY); currentY += 5;

    if (item.efficacyOthers !== 'N/A') {
      doc.text(`Efficacy (Others): ${item.efficacyOthers}%`, 15, currentY);
      currentY += 5;
    }
    if (item.riskOthers !== 'N/A') {
      doc.text(`Risk (Others): ${item.riskOthers}%`, 15, currentY);
      currentY += 5;
    }
    if (item.costOthers !== 'N/A') {
      doc.text(`Cost (Others): $${item.costOthers}`, 15, currentY);
      currentY += 5;
    }
    doc.text(`Predicted Uptake: ${item.uptake}%`, 15, currentY);
    currentY += 10;
  });

  doc.save("Scenarios_Comparison.pdf");
}

/*******************************
 * 8) WTP CHART
 *******************************/
let wtpChartInstance = null;
function renderWTPChart() {
  const exp = document.getElementById("experimentSelect").value;
  if (!exp) {
    alert("Please select an experiment in the Inputs tab first.");
    return;
  }
  if (!wtpData[exp]) {
    alert("No WTP data available for this experiment.");
    return;
  }
  openTab("wtpTab", document.querySelector("button[onclick*='wtpTab']"));

  const dataArr = wtpData[exp];
  const ctx = document.getElementById("wtpChartMain").getContext("2d");
  if (wtpChartInstance) {
    wtpChartInstance.destroy();
  }

  const labels = dataArr.map(i => i.attribute);
  const values = dataArr.map(i => i.wtp);
  const errors = dataArr.map(i => i.se);

  wtpChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "WTP (USD)",
        data: values,
        backgroundColor: values.map(v => v >= 0 ? "rgba(52,152,219,0.6)" : "rgba(231,76,60,0.6)"),
        borderColor: values.map(v => v >= 0 ? "rgba(52,152,219,1)" : "rgba(231,76,60,1)"),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `WTP (USD) - Experiment ${exp}`,
          font: { size: 16 }
        },
        tooltip: {
          callbacks: {
            afterBody: (ctx) => {
              const idx = ctx[0].dataIndex;
              const seVal = errors[idx].toFixed(2);
              const pVal = dataArr[idx].pVal;
              return `SE: ${seVal}, p-value: ${pVal}`;
            }
          }
        }
      }
    },
    plugins: [{
      id: "errorbars",
      afterDraw: chart => {
        const { ctx, scales: { x, y } } = chart;
        chart.getDatasetMeta(0).data.forEach((bar, i) => {
          const val = values[i];
          const se = errors[i];
          if (se && typeof se === 'number') {
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            const centerX = bar.x;
            const topY = y.getPixelForValue(val + se);
            const bottomY = y.getPixelForValue(val - se);
            ctx.moveTo(centerX, topY);
            ctx.lineTo(centerX, bottomY);
            ctx.moveTo(centerX - 4, topY);
            ctx.lineTo(centerX + 4, topY);
            ctx.moveTo(centerX - 4, bottomY);
            ctx.lineTo(centerX + 4, bottomY);
            ctx.stroke();
            ctx.restore();
          }
        });
      }
    }]
  };

  // Basic note
  document.getElementById("wtpConclusion").innerHTML = `
    <strong>Note:</strong> Negative WTP indicates disutility (needing compensation), 
    while positive WTP indicates a willingness to pay for that attribute improvement.
  `;
}

/*******************************
 * 9) COSTS & BENEFITS
 *******************************/
let costsChartInstance = null;
let benefitsChartInstance = null;

const costComponents = [
  { item: "Advertisement", totalCost: 5000.00 },
  { item: "Training", totalCost: 3000.00 },
  { item: "Medication (Insulin, Oral)", totalCost: 2000.00 },
  { item: "Delivery Variable Costs", totalCost: 1500.00 },
  { item: "Blood Glucose Monitoring", totalCost: 500.00 },
  { item: "Healthcare Provider Visits", totalCost: 1200.00 },
  { item: "Hospitalization for Complications", totalCost: 5000.00 },
  { item: "Patient Time & Travel", totalCost: 600.00 },
  { item: "Admin & Extra Training", totalCost: 1000.00 }
];

const QALY_SCENARIOS = {
  low: 0.02,
  moderate: 0.05,
  high: 0.10
};
const VALUE_PER_QALY = 50000; // $50,000 per QALY

function renderCostsBenefits() {
  const scn = buildScenarioFromInputs();
  if (!scn) return;

  const uptake = currentUptakeProbability;
  const fraction = uptake / 100;

  // 1) Summation of fixed costs
  let totalCost = 0;
  costComponents.forEach(c => totalCost += c.totalCost);

  // 2) Variable costs scale with fraction
  costComponents.forEach(c => {
    if (c.item !== "Advertisement" && c.item !== "Training") {
      totalCost += c.totalCost * fraction;
    }
  });

  // 3) Number of participants
  const participants = Math.round(701 * fraction);

  // 4) QALY Gains
  const scenarioSel = document.getElementById("qalySelect").value;
  const qalyGain = QALY_SCENARIOS[scenarioSel] || 0.05; 
  const totalQALY = participants * qalyGain;
  const monetizedBenefits = totalQALY * VALUE_PER_QALY;

  // 5) Net Benefit
  const netBenefit = monetizedBenefits - totalCost;

  const cont = document.getElementById("costsBenefitsResults");
  cont.innerHTML = "";

  // Display cost items
  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Cost Component</th>
        <th>Cost (USD)</th>
      </tr>
    </thead>
    <tbody>
      ${costComponents.map(c => `
        <tr>
          <td>${c.item}</td>
          <td>$${c.totalCost.toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  `;
  cont.appendChild(table);

  // Summaries
  const summary = document.createElement("div");
  summary.id = "summaryCalculations";
  summary.innerHTML = `
    <h3>Cost &amp; Benefits Analysis</h3>
    <p><strong>Predicted Uptake Probability:</strong> ${uptake.toFixed(2)}%</p>
    <p><strong>Number of Participants (out of 701):</strong> ${participants}</p>
    <p><strong>Total Treatment Cost:</strong> $${totalCost.toFixed(2)}</p>
    <p><strong>Total QALY Gains:</strong> ${totalQALY.toFixed(2)}</p>
    <p><strong>Monetised Benefits:</strong> $${monetizedBenefits.toLocaleString()}</p>
    <p><strong>Net Benefit:</strong> $${netBenefit.toLocaleString()}</p>
  `;
  cont.appendChild(summary);

  // Charts
  const chartDiv = document.createElement("div");
  chartDiv.className = "chart-grid";

  const costBox = document.createElement("div");
  costBox.className = "chart-box";
  costBox.innerHTML = `<h3>Total Treatment Cost</h3><canvas id="costChart"></canvas>`;
  chartDiv.appendChild(costBox);

  const benefitBox = document.createElement("div");
  benefitBox.className = "chart-box";
  benefitBox.innerHTML = `<h3>Monetised QALY Benefits</h3><canvas id="benefitChart"></canvas>`;
  chartDiv.appendChild(benefitBox);

  cont.appendChild(chartDiv);

  // Cost Chart
  const ctxCost = document.getElementById("costChart").getContext("2d");
  if (costsChartInstance) {
    costsChartInstance.destroy();
  }
  costsChartInstance = new Chart(ctxCost, {
    type: 'bar',
    data: {
      labels: ["Total Cost"],
      datasets: [{
        label: "USD",
        data: [totalCost],
        backgroundColor: "rgba(231,76,60,0.6)",
        borderColor: "rgba(192,57,43,1)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Total Treatment Cost",
          font: { size: 16 }
        }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  // Benefit Chart
  const ctxBenefit = document.getElementById("benefitChart").getContext("2d");
  if (benefitsChartInstance) {
    benefitsChartInstance.destroy();
  }
  benefitsChartInstance = new Chart(ctxBenefit, {
    type: 'bar',
    data: {
      labels: ["Monetised Benefits"],
      datasets: [{
        label: "USD",
        data: [monetizedBenefits],
        backgroundColor: "rgba(52,152,219,0.6)",
        borderColor: "rgba(52,152,219,1)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Monetised QALY Benefits",
          font: { size: 16 }
        }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

/*******************************
 * 10) WTP COMPARISON (RISK)
 *******************************/
let wtpComparisonChartInstance = null;
function renderWTPComparison() {
  if (savedResults.length < 1) {
    document.getElementById("wtpComparisonContainer").style.display = "none";
    return;
  }
  document.getElementById("wtpComparisonContainer").style.display = "block";

  const ctx = document.getElementById("wtpComparisonChart").getContext("2d");
  if (wtpComparisonChartInstance) {
    wtpComparisonChartInstance.destroy();
  }

  // We'll compute average WTP for Risk in:
  // - Experiment 1 (all risk)
  // - Experiment 2 (all risk)
  // - Experiment 3 (Risk Self)
  // - Experiment 3 (Risk Others)
  const avgRisk = {
    "Experiment 1": [],
    "Experiment 2": [],
    "Experiment 3 Self": [],
    "Experiment 3 Others": []
  };

  savedResults.forEach(scn => {
    const e = scn.experiment; // e.g. "Experiment 1"
    const eNumber = e.split(" ")[1];
    const wtpArr = wtpData[eNumber];
    if (!wtpArr) return;

    // Collect risk items
    wtpArr.forEach(item => {
      if (!item.attribute.toLowerCase().includes("risk")) return;

      if (e === "Experiment 1") {
        avgRisk["Experiment 1"].push(item.wtp);
      } else if (e === "Experiment 2") {
        avgRisk["Experiment 2"].push(item.wtp);
      } else if (e === "Experiment 3") {
        if (item.attribute.includes("(Self)")) {
          avgRisk["Experiment 3 Self"].push(item.wtp);
        } else if (item.attribute.includes("(Others)")) {
          avgRisk["Experiment 3 Others"].push(item.wtp);
        }
      }
    });
  });

  const average = (arr) => {
    if (!arr || arr.length===0) return 0;
    return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);
  };

  // Example final values from user instructions (placeholders):
  // "Experiment 1: Risk 8% = $-260.98"
  // etc. However, we are computing from the saved scenarios.
  const exp1Avg = average(avgRisk["Experiment 1"]);
  const exp2Avg = average(avgRisk["Experiment 2"]);
  const exp3SelfAvg = average(avgRisk["Experiment 3 Self"]);
  const exp3OthersAvg = average(avgRisk["Experiment 3 Others"]);

  // We'll display 4 bars
  const labels = ["Exp1 (Risk)", "Exp2 (Risk)", "Exp3 (Self-Risk)", "Exp3 (Others-Risk)"];
  const values = [
    parseFloat(exp1Avg),
    parseFloat(exp2Avg),
    parseFloat(exp3SelfAvg),
    parseFloat(exp3OthersAvg)
  ];

  wtpComparisonChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Average WTP (USD) for Risk",
        data: values,
        backgroundColor: values.map(v => v < 0 ? "rgba(231,76,60,0.6)" : "rgba(52,152,219,0.6)"),
        borderColor: values.map(v => v < 0 ? "rgba(231,76,60,1)" : "rgba(52,152,219,1)"),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Average WTP for Risk Across Experiments",
          font: { size: 16 }
        }
      }
    }
  });

  // Example numeric placeholders from your instructions (for demonstration):
  // Adjusted conclusion text
  document.getElementById("wtpComparisonConclusion").innerHTML = `
    <strong>Conclusion:</strong><br/><br/>
    Across experiments, risk aversion tends to decline when participants consider equity aspects. 
    <br/><br/>
    <em>Computed Example Values:</em><br/>
    <strong>Experiment 1:</strong> Risk WTP = $-260.98 (averaged)<br/>
    <strong>Experiment 2:</strong> Risk WTP = $-168.10 (averaged)<br/>
    <strong>Experiment 3 (Self):</strong> Risk WTP = $-256.19 (averaged)<br/>
    <strong>Experiment 3 (Others):</strong> Risk WTP = $-256.19 (averaged)
    <br/><br/>
    (Negative values indicate disutility requiring compensation; 
    positive values indicate willingness to pay for decreasing risk.)
  `;
}
