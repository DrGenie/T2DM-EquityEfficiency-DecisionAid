/****************************************************************************
 * script.js
 * 1) Tab Navigation
 * 2) Range Slider Display
 * 3) Model Coefficients & WTP Data
 * 4) Probability Calculation & Plot
 * 5) WTP Plot (Risk & Efficacy)
 * 6) Cost & Benefit Analysis (Detailed)
 * 7) Scenario Saving & PDF Export
 * 8) Improved Layout & Constraints
 * Authors:
 *  - Surachat Ngorsuraches (Auburn University, USA)
 *  - Mesfin Genie (The University of Newcastle, Australia)
 ****************************************************************************/

let currentUptakeProbability = 0; // Global for storing uptake
let savedResults = []; // Session-based scenario storage

/** On load, set default tab and scenario table. */
window.addEventListener("load", function() {
  openTab("introTab", document.querySelector(".tablink.active"));
  loadSavedResults();
  document.getElementById("experimentSelect").addEventListener("change", toggleExperimentAttributes);
});

/** TAB SWITCHING */
function openTab(tabId, btn) {
  const tabContents = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabContents.length; i++) {
    tabContents[i].style.display = "none";
  }
  const tabLinks = document.getElementsByClassName("tablink");
  for (let j = 0; j < tabLinks.length; j++) {
    tabLinks[j].classList.remove("active");
    tabLinks[j].setAttribute("aria-selected", "false");
  }
  document.getElementById(tabId).style.display = "block";
  btn.classList.add("active");
  btn.setAttribute("aria-selected", "true");

  // If user navigates to "costsTab," auto-render cost analysis if a scenario is set
  if (tabId === "costsTab") {
    renderCostsBenefits();
  }
}

/** RANGE SLIDER LABELS */
function updateCostDisplay(val) {
  document.getElementById("costValue").textContent = `$${val}`;
}
function updateCostOthersDisplay(val) {
  document.getElementById("costOthersValue").textContent = `$${val}`;
}

/***************************************************************************
 * MODEL COEFFICIENTS
 ***************************************************************************/
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

/***************************************************************************
 * WTP DATA (RISK & EFFICACY for Exp 3 included)
 ***************************************************************************/
const wtpData = {
  '1': [
    { attribute: "Efficacy 50%", wtp: 0.855 / 0.00123, pVal: 0.000, se: 0.074 / 0.00123 },
    { attribute: "Efficacy 90%", wtp: 1.558 / 0.00123, pVal: 0.000, se: 0.078 / 0.00123 },
    { attribute: "Risk 8%",     wtp: -0.034 / 0.00123, pVal: 0.689, se: 0.085 / 0.00123 },
    { attribute: "Risk 16%",    wtp: -0.398 / 0.00123, pVal: 0.000, se: 0.086 / 0.00123 },
    { attribute: "Risk 30%",    wtp: -0.531 / 0.00123, pVal: 0.000, se: 0.090 / 0.00123 },
  ],
  '2': [
    { attribute: "Efficacy 50%", wtp: 1.031 / 0.00140, pVal: 0.000, se: 0.078 / 0.00140 },
    { attribute: "Efficacy 90%", wtp: 1.780 / 0.00140, pVal: 0.000, se: 0.084 / 0.00140 },
    { attribute: "Risk 8%",     wtp: -0.054 / 0.00140, pVal: 0.550, se: 0.090 / 0.00140 },
    { attribute: "Risk 16%",    wtp: -0.305 / 0.00140, pVal: 0.001, se: 0.089 / 0.00140 },
    { attribute: "Risk 30%",    wtp: -0.347 / 0.00140, pVal: 0.000, se: 0.094 / 0.00140 },
  ],
  '3': [
    // RISK (Self)
    { attribute: "Risk 8% (Self)",  wtp: -0.108 / 0.0007, pVal: 0.200, se: 0.084 / 0.0007 },
    { attribute: "Risk 16% (Self)", wtp: -0.218 / 0.0007, pVal: 0.013, se: 0.088 / 0.0007 },
    { attribute: "Risk 30% (Self)", wtp: -0.339 / 0.0007, pVal: 0.000, se: 0.085 / 0.0007 },
    // RISK (Others) - STILL dividing by cost (not costOthers)
    { attribute: "Risk 8% (Others)",  wtp: -0.111 / 0.0007, pVal: 0.190, se: 0.085 / 0.0007 },
    { attribute: "Risk 16% (Others)", wtp: -0.103 / 0.0007, pVal: 0.227, se: 0.085 / 0.0007 },
    { attribute: "Risk 30% (Others)", wtp: -0.197 / 0.0007, pVal: 0.017, se: 0.083 / 0.0007 },
    // EFFICACY (Self)
    { attribute: "Efficacy 50% (Self)", wtp: 0.604 / 0.0007, pVal: 0.000, se: 0.084 / 0.0007 },
    { attribute: "Efficacy 90% (Self)", wtp: 1.267 / 0.0007, pVal: 0.000, se: 0.075 / 0.0007 },
    // EFFICACY (Others)
    { attribute: "Efficacy 50% (Others)", wtp: 0.272 / 0.0007, pVal: 0.000, se: 0.083 / 0.0007 },
    { attribute: "Efficacy 90% (Others)", wtp: 0.370 / 0.0007, pVal: 0.000, se: 0.076 / 0.0007 }
  ]
};

/***************************************************************************
 * PREDICT HEALTH PLAN UPTAKE
 ***************************************************************************/
function renderProbChart() {
  const scenario = buildScenarioFromInputs();
  if (!scenario) return;

  // Checks
  if (!scenario.experiment) {
    alert("Please select an experiment.");
    return;
  }

  computeUptakeProbability(scenario);
  openTab("uptakeTab", document.querySelector("button[onclick*='uptakeTab']"));
}

function computeUptakeProbability(scenario) {
  const exp = scenario.experiment;
  const coefs = coefficients[exp];
  let utility = 0;

  // ASC
  if (exp === '1') {
    utility += coefs.ASC;
  } else {
    utility += coefs.ASC_mean;
  }

  // Efficacy
  if (scenario.efficacy === '50') utility += coefs.efficacy_50;
  if (scenario.efficacy === '90') utility += coefs.efficacy_90;

  // Risk
  if (scenario.risk === '8')  utility += coefs.risk_8;
  if (scenario.risk === '16') utility += coefs.risk_16;
  if (scenario.risk === '30') utility += coefs.risk_30;

  // Cost (Self)
  utility += coefs.cost * scenario.cost;

  if (exp === '3') {
    // Efficacy (Others)
    if (scenario.efficacyOthers === '50') utility += coefs.efficacyOthers_50;
    if (scenario.efficacyOthers === '90') utility += coefs.efficacyOthers_90;

    // Risk (Others)
    if (scenario.riskOthers === '8')  utility += coefs.riskOthers_8;
    if (scenario.riskOthers === '16') utility += coefs.riskOthers_16;
    if (scenario.riskOthers === '30') utility += coefs.riskOthers_30;

    // Cost (Others)
    utility += coefs.costOthers * scenario.costOthers;
  }

  // Choice Probability
  const expUtility = Math.exp(utility);
  const expOptOut = Math.exp(coefs.ASC_optout);
  const prob = (expUtility / (expUtility + expOptOut)) * 100;

  currentUptakeProbability = prob;
  displayUptakeProbability(prob);
}

function displayUptakeProbability(prob) {
  const ctx = document.getElementById("probChartMain").getContext("2d");
  if (window.probChartInstance) {
    window.probChartInstance.destroy();
  }

  window.probChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ["Predicted Health Plan Uptake"],
      datasets: [{
        label: "Uptake Probability (%)",
        data: [prob],
        backgroundColor: prob < 30 ? "rgba(231, 76, 60, 0.6)"
          : prob < 70 ? "rgba(241, 196, 15, 0.6)"
          : "rgba(39, 174, 96, 0.6)",
        borderColor: prob < 30 ? "rgba(231, 76, 60, 1)"
          : prob < 70 ? "rgba(241, 196, 15, 1)"
          : "rgba(39, 174, 96, 1)",
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
    message = "Uptake is relatively low. Consider reducing cost or improving efficacy.";
  } else if (prob < 70) {
    message = "Uptake is moderate. Additional improvements could further boost health plan choice.";
  } else {
    message = "Uptake is high. Maintaining these attributes is recommended.";
  }
  alert(`Predicted Uptake Probability: ${prob.toFixed(2)}%. ${message}`);
}

/***************************************************************************
 * BUILD SCENARIO FROM INPUTS (WITH CONSTRAINTS)
 ***************************************************************************/
function buildScenarioFromInputs() {
  const experiment = document.getElementById("experimentSelect").value;
  const efficacy = document.getElementById("efficacy").value;
  const risk = document.getElementById("risk").value;
  const cost = parseInt(document.getElementById("cost").value, 10);

  let efficacyOthers = "N/A";
  let riskOthers = "N/A";
  let costOthers = "N/A";

  let missingFields = [];

  if (!experiment) missingFields.push("Experiment");
  if (!efficacy)  missingFields.push("Efficacy (Self)");
  if (!risk)      missingFields.push("Risk (Self)");
  if (isNaN(cost)) missingFields.push("Cost (Self)");

  if (experiment === "3") {
    efficacyOthers = document.getElementById("efficacyOthers").value;
    riskOthers = document.getElementById("riskOthers").value;
    costOthers = parseInt(document.getElementById("costOthers").value, 10);

    if (!efficacyOthers) missingFields.push("Efficacy (Others)");
    if (!riskOthers) missingFields.push("Risk (Others)");
    if (isNaN(costOthers)) missingFields.push("Cost (Others)");
  }

  if (missingFields.length > 0) {
    alert(`Please provide: ${missingFields.join(", ")}`);
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

/***************************************************************************
 * SAVE SCENARIO
 ***************************************************************************/
function saveScenario() {
  const scenario = buildScenarioFromInputs();
  if (!scenario) return;

  if (currentUptakeProbability <= 0) {
    alert("Please calculate uptake probability before saving the scenario.");
    return;
  }

  const expName = `Experiment ${scenario.experiment}`;
  const scenarioObj = {
    name: `Scenario ${savedResults.length + 1}`,
    experiment: expName,
    efficacy: scenario.efficacy,
    risk: scenario.risk,
    cost: scenario.cost,
    efficacyOthers: scenario.experiment === "3" ? scenario.efficacyOthers : 'N/A',
    riskOthers: scenario.experiment === "3" ? scenario.riskOthers : 'N/A',
    costOthers: scenario.experiment === "3" ? scenario.costOthers : 'N/A',
    uptake: currentUptakeProbability.toFixed(2)
  };

  savedResults.push(scenarioObj);
  addScenarioToTable(scenarioObj);
  alert(`"${scenarioObj.name}" has been saved successfully.`);
  renderWTPComparison();
}

/***************************************************************************
 * ADD SCENARIO TO TABLE
 ***************************************************************************/
function addScenarioToTable(scn) {
  const tableBody = document.querySelector("#scenarioTable tbody");
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${scn.name}</td>
    <td>${scn.experiment}</td>
    <td>${scn.efficacy}</td>
    <td>${scn.risk}</td>
    <td>$${scn.cost}</td>
    <td>${scn.efficacyOthers}</td>
    <td>${scn.riskOthers}</td>
    <td>$${scn.costOthers}</td>
    <td>${scn.uptake}</td>
  `;
  tableBody.appendChild(row);
}

/***************************************************************************
 * LOAD & CLEAR SAVED RESULTS ON REFRESH
 ***************************************************************************/
function loadSavedResults() {
  savedResults = [];
  document.querySelector("#scenarioTable tbody").innerHTML = '';
}

/***************************************************************************
 * TOGGLE EXPERIMENT 3 ATTRIBUTES
 ***************************************************************************/
function toggleExperimentAttributes() {
  const exp = document.getElementById("experimentSelect").value;
  const show = (exp === "3");
  document.getElementById("efficacyOthersDiv").style.display = show ? 'block' : 'none';
  document.getElementById("riskOthersDiv").style.display = show ? 'block' : 'none';
  document.getElementById("costOthersDiv").style.display = show ? 'block' : 'none';
}

/***************************************************************************
 * FILTER SCENARIOS
 ***************************************************************************/
function filterScenarios() {
  const filterVal = document.getElementById("filterExperiment").value;
  const rows = document.querySelectorAll("#scenarioTable tbody tr");

  rows.forEach(row => {
    const expCell = row.cells[1].textContent;
    if (filterVal === "all" || expCell === filterVal) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

/***************************************************************************
 * EXPORT SCENARIOS TO PDF
 ***************************************************************************/
function exportToPDF() {
  if (savedResults.length < 1) {
    alert("No saved scenarios to export.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let currentY = margin;

  doc.setFontSize(16);
  doc.text("T2DM Equity-Efficiency Decision Aid - Saved Scenarios", pageWidth / 2, currentY, { align: "center" });
  currentY += 10;

  savedResults.forEach((s, i) => {
    if (currentY + 60 > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFontSize(14);
    doc.text(`Scenario ${i + 1}: ${s.name}`, margin, currentY);
    currentY += 7;
    doc.setFontSize(12);
    doc.text(`Experiment: ${s.experiment}`, margin, currentY); currentY += 5;
    doc.text(`Efficacy (Self): ${s.efficacy}%`, margin, currentY); currentY += 5;
    doc.text(`Risk (Self): ${s.risk}%`, margin, currentY); currentY += 5;
    doc.text(`Monthly Cost (Self): $${s.cost}`, margin, currentY); currentY += 5;
    if (s.efficacyOthers !== 'N/A') {
      doc.text(`Efficacy (Others): ${s.efficacyOthers}%`, margin, currentY); currentY += 5;
    }
    if (s.riskOthers !== 'N/A') {
      doc.text(`Risk (Others): ${s.riskOthers}%`, margin, currentY); currentY += 5;
    }
    if (s.costOthers !== 'N/A') {
      doc.text(`Monthly Cost (Others): $${s.costOthers}`, margin, currentY); currentY += 5;
    }
    doc.text(`Predicted Uptake Probability: ${s.uptake}%`, margin, currentY);
    currentY += 10;
  });

  doc.save("Scenarios_Comparison.pdf");
}

/***************************************************************************
 * RENDER WTP CHART
 ***************************************************************************/
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

  const dArr = wtpData[exp];
  const ctx = document.getElementById("wtpChartMain").getContext("2d");

  if (wtpChartInstance) {
    wtpChartInstance.destroy();
  }

  const labels = dArr.map(i => i.attribute);
  const values = dArr.map(i => i.wtp);
  const errors = dArr.map(i => i.se);

  const dataConfig = {
    labels,
    datasets: [{
      label: "WTP (USD)",
      data: values,
      backgroundColor: values.map(val => (val >= 0 ? "rgba(52, 152, 219, 0.6)" : "rgba(231, 76, 60, 0.6)")),
      borderColor: values.map(val => (val >= 0 ? "rgba(52, 152, 219, 1)" : "rgba(231, 76, 60, 1)")),
      borderWidth: 1
    }]
  };

  wtpChartInstance = new Chart(ctx, {
    type: "bar",
    data: dataConfig,
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `Willingness to Pay (USD) - Experiment ${exp}`,
          font: { size: 16 }
        },
        tooltip: {
          callbacks: {
            afterBody: function(context) {
              const i = context[0].dataIndex;
              const seVal = errors[i].toFixed(2);
              const pVal = dArr[i].pVal;
              return `SE: ${seVal}, p-value: ${pVal}`;
            }
          }
        }
      }
    },
    plugins: [{
      id: 'errorbars',
      afterDraw: chart => {
        const { ctx, scales: { x, y } } = chart;
        chart.getDatasetMeta(0).data.forEach((bar, idx) => {
          const centerX = bar.x;
          const val = values[idx];
          const se = errors[idx];
          if (se && typeof se === 'number') {
            const topY = y.getPixelForValue(val + se);
            const bottomY = y.getPixelForValue(val - se);

            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
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
  });
  // Optional Conclusion
  document.getElementById("wtpConclusion").innerHTML = `
    <strong>Note:</strong> For Experiment 3, we also include efficacy WTP for Self and Others. 
    Negative WTP indicates a disutility requiring monetary compensation, while positive WTP 
    indicates a willingness to pay for improving that attribute.
  `;
}

/***************************************************************************
 * COSTS & BENEFITS (DETAILED)
 ***************************************************************************/
let costsChartInstance = null;
let benefitsChartInstance = null;

const costComponents = [
  {
    item: "Advertisement",
    totalCost: 5000.00
  },
  {
    item: "Training",
    totalCost: 3000.00
  },
  {
    item: "Medication (Insulin, Oral Hypoglycemics)",
    totalCost: 2000.00
  },
  {
    item: "Delivery Variable Costs",
    totalCost: 1500.00
  },
  {
    item: "Blood Glucose Monitoring",
    totalCost: 500.00
  },
  {
    item: "Healthcare Provider Visits",
    totalCost: 1200.00
  },
  {
    item: "Hospitalization for Complications",
    totalCost: 5000.00
  },
  {
    item: "Patient Time & Travel",
    totalCost: 600.00
  },
  {
    item: "Administrative & Additional Training",
    totalCost: 1000.00
  }
];

const QALY_SCENARIOS_VALUES = {
  low: 0.02,
  moderate: 0.05,
  high: 0.10
};

const VALUE_PER_QALY = 50000;

function renderCostsBenefits() {
  const scenario = buildScenarioFromInputs();
  if (!scenario) return;

  const prob = currentUptakeProbability;
  const fraction = prob / 100;

  // 1) Fixed costs
  let totalCost = 0;
  costComponents.forEach(c => totalCost += c.totalCost);

  // 2) Variable cost portion (assume each item except ad & training can vary with uptake)
  costComponents.forEach(c => {
    if (c.item !== "Advertisement" && c.item !== "Training") {
      totalCost += c.totalCost * fraction;
    }
  });

  // 3) Number of participants
  // e.g., 701 participants in the sample, scaled by uptake fraction
  const participants = Math.round(701 * fraction);

  // 4) QALY Gains
  const qalyScenario = document.getElementById("qalySelect").value;
  const qalyGain = QALY_SCENARIOS_VALUES[qalyScenario];
  const totalQALY = participants * qalyGain;
  const monetizedBenefits = totalQALY * VALUE_PER_QALY;

  // 5) Net Benefit
  const netBenefit = monetizedBenefits - totalCost;

  // Display
  const cont = document.getElementById("costsBenefitsResults");
  cont.innerHTML = "";

  const costTable = document.createElement("table");
  costTable.innerHTML = `
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
  cont.appendChild(costTable);

  const summaryDiv = document.createElement("div");
  summaryDiv.id = "summaryCalculations";
  summaryDiv.innerHTML = `
    <h3>Cost &amp; Benefits Analysis</h3>
    <p><strong>Uptake Probability:</strong> ${prob.toFixed(2)}%</p>
    <p><strong>Number of Participants:</strong> ${participants}</p>
    <p><strong>Total Treatment Cost:</strong> $${totalCost.toFixed(2)}</p>
    <p><strong>Total QALY Gains:</strong> ${totalQALY.toFixed(2)}</p>
    <p><strong>Monetised Benefits:</strong> $${monetizedBenefits.toLocaleString()}</p>
    <p><strong>Net Benefit:</strong> $${netBenefit.toLocaleString()}</p>
  `;
  cont.appendChild(summaryDiv);

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

  // Chart 1: Total Cost
  const ctxCost = document.getElementById("costChart").getContext("2d");
  if (costsChartInstance) {
    costsChartInstance.destroy();
  }
  costsChartInstance = new Chart(ctxCost, {
    type: 'bar',
    data: {
      labels: ["Total Treatment Cost"],
      datasets: [{
        label: "USD",
        data: [totalCost],
        backgroundColor: "rgba(231, 76, 60, 0.6)",
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

  // Chart 2: Monetised Benefits
  const ctxBenefit = document.getElementById("benefitChart").getContext("2d");
  if (benefitsChartInstance) {
    benefitsChartInstance.destroy();
  }
  benefitsChartInstance = new Chart(ctxBenefit, {
    type: 'bar',
    data: {
      labels: ["Monetised QALY Benefits"],
      datasets: [{
        label: "USD",
        data: [monetizedBenefits],
        backgroundColor: "rgba(52, 152, 219,0.6)",
        borderColor: "rgba(52, 152, 219,1)",
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

/***************************************************************************
 * WTP COMPARISON ACROSS EXPERIMENTS (RISK-ATTRIBUTES)
 ***************************************************************************/
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

  // Prepare structure
  const avgWTP = {
    "Experiment 1": { Risk: [] },
    "Experiment 2": { Risk: [] },
    "Experiment 3": { "Risk (Self)": [], "Risk (Others)": [] }
  };

  savedResults.forEach(s => {
    if (!avgWTP[s.experiment]) return;
    const expNumber = s.experiment.split(" ")[1];
    const dataArr = wtpData[expNumber];
    if (!dataArr) return;

    dataArr.forEach(item => {
      if (item.attribute.includes("Risk")) {
        if (expNumber === '3') {
          if (item.attribute.includes("(Others)")) {
            avgWTP[s.experiment]["Risk (Others)"].push(item.wtp);
          } else {
            avgWTP[s.experiment]["Risk (Self)"].push(item.wtp);
          }
        } else {
          avgWTP[s.experiment]["Risk"].push(item.wtp);
        }
      }
    });
  });

  // Compute average
  const computeAvg = (arr) => {
    if (!arr || arr.length < 1) return 0;
    return (arr.reduce((a, c) => a + c, 0) / arr.length).toFixed(2);
  };
  const combineAvg = (arr1, arr2) => {
    if ((!arr1 || arr1.length===0) && (!arr2 || arr2.length===0)) return 0;
    const a1 = arr1.reduce((a,c)=>a+c,0) / (arr1.length || 1);
    const a2 = arr2.reduce((a,c)=>a+c,0) / (arr2.length || 1);
    return ((a1+a2)/2).toFixed(2);
  };

  const result = {
    "Experiment 1": {
      "Risk 8%": computeAvg(avgWTP["Experiment 1"].Risk),
      "Risk 16%": computeAvg(avgWTP["Experiment 1"].Risk),
      "Risk 30%": computeAvg(avgWTP["Experiment 1"].Risk),
    },
    "Experiment 2": {
      "Risk 8%": computeAvg(avgWTP["Experiment 2"].Risk),
      "Risk 16%": computeAvg(avgWTP["Experiment 2"].Risk),
      "Risk 30%": computeAvg(avgWTP["Experiment 2"].Risk),
    },
    "Experiment 3": {
      "Risk 8%": combineAvg(avgWTP["Experiment 3"]["Risk (Self)"], avgWTP["Experiment 3"]["Risk (Others)"]),
      "Risk 16%": combineAvg(avgWTP["Experiment 3"]["Risk (Self)"], avgWTP["Experiment 3"]["Risk (Others)"]),
      "Risk 30%": combineAvg(avgWTP["Experiment 3"]["Risk (Self)"], avgWTP["Experiment 3"]["Risk (Others)"])
    }
  };

  const labels = ["Risk 8%", "Risk 16%", "Risk 30%"];
  const datasets = [
    {
      label: "Experiment 1",
      data: [
        parseFloat(result["Experiment 1"]["Risk 8%"]),
        parseFloat(result["Experiment 1"]["Risk 16%"]),
        parseFloat(result["Experiment 1"]["Risk 30%"])
      ],
      backgroundColor: "rgba(52, 152, 219, 0.6)",
      borderColor: "rgba(52, 152, 219, 1)",
      borderWidth: 1
    },
    {
      label: "Experiment 2",
      data: [
        parseFloat(result["Experiment 2"]["Risk 8%"]),
        parseFloat(result["Experiment 2"]["Risk 16%"]),
        parseFloat(result["Experiment 2"]["Risk 30%"])
      ],
      backgroundColor: "rgba(46, 204, 113, 0.6)",
      borderColor: "rgba(46, 204, 113, 1)",
      borderWidth: 1
    },
    {
      label: "Experiment 3",
      data: [
        parseFloat(result["Experiment 3"]["Risk 8%"]),
        parseFloat(result["Experiment 3"]["Risk 16%"]),
        parseFloat(result["Experiment 3"]["Risk 30%"])
      ],
      backgroundColor: "rgba(231, 76, 60, 0.6)",
      borderColor: "rgba(231, 76, 60, 1)",
      borderWidth: 1
    }
  ];

  wtpComparisonChartInstance = new Chart(ctx, {
    type: "bar",
    data: { labels, datasets },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Average WTP (USD)" }
        }
      },
      plugins: {
        legend: { position: "top" },
        title: {
          display: true,
          text: "Average WTP for Risk Attributes Across Experiments",
          font: { size: 16 }
        }
      }
    }
  });

  document.getElementById("wtpComparisonConclusion").innerHTML = `
    <strong>Conclusion:</strong><br/><br/>
    Across experiments, risk aversion tends to decline when participants consider 
    equity aspects. In Experiment 3, the average WTP for Risk 
    (combining “Self” and “Others”) is displayed to illustrate how disparity in 
    outcomes can influence preferences.
    <br/><br/>
    <strong>Computed Values:</strong><br/>
    Experiment 1: Risk 8% = $${result["Experiment 1"]["Risk 8%"]}, 
    Risk 16% = $${result["Experiment 1"]["Risk 16%"]}, 
    Risk 30% = $${result["Experiment 1"]["Risk 30%"]} <br/>
    Experiment 2: Risk 8% = $${result["Experiment 2"]["Risk 8%"]}, 
    Risk 16% = $${result["Experiment 2"]["Risk 16%"]}, 
    Risk 30% = $${result["Experiment 2"]["Risk 30%"]} <br/>
    Experiment 3: Risk 8% = $${result["Experiment 3"]["Risk 8%"]}, 
    Risk 16% = $${result["Experiment 3"]["Risk 16%"]}, 
    Risk 30% = $${result["Experiment 3"]["Risk 30%"]}
  `;
}
