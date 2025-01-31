/****************************************************************************
 * script.js
 * Handles:
 *  - Tab navigation
 *  - Attribute input updates (sliders)
 *  - Utility & probability calculations
 *  - WTP bar charts & comparison
 *  - Cost & benefits analysis
 *  - Scenario saving & PDF export
 * Authors:
 *  - Surachat Ngorsuraches (Auburn University, USA)
 *  - Mesfin Genie (NBS, The University of Newcastle, Australia)
 ****************************************************************************/

/** Global variable for storing the current uptake probability */
let currentUptakeProbability = 0;

/** Global array to store saved scenarios within the session */
let savedResults = [];

/** Called when the page loads to set up default tab and scenario table */
window.addEventListener("load", function() {
  openTab('introTab', document.querySelector('.tablink.active'));
  loadSavedResults();
  // Set up dynamic fields for Experiment 3
  document.getElementById("experimentSelect").addEventListener("change", toggleExperimentAttributes);
});

/** 1) TAB SWITCHING */
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

  // If user navigates to the costs tab, render the cost & benefits if a scenario is set
  if (tabId === "costsTab") {
    renderCostsBenefits();
  }
}

/** 2) RANGE SLIDER DISPLAY */
function updateCostDisplay(val) {
  document.getElementById("costValue").textContent = `$${val}`;
}

function updateCostOthersDisplay(val) {
  document.getElementById("costOthersValue").textContent = `$${val}`;
}

/***************************************************************************
 * MAIN COEFFICIENTS FOR EXPERIMENTS
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
    cost: -0.00123, 
    ASC_sd: 0.987
  },
  '2': {
    ASC_optout: -0.338,
    ASC_mean: -0.159,
    efficacy_50: 1.031,
    efficacy_90: 1.780,
    risk_8: -0.054,
    risk_16: -0.305,
    risk_30: -0.347,
    cost: -0.00140,
    ASC_sd: 1.196
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
    costOthers: -0.00041,
    ASC_sd: 1.033
  }
};

/***************************************************************************
 * WTP DATA FOR EACH EXPERIMENT
 ***************************************************************************/
const wtpData = {
  '1': [
    { attribute: "Efficacy 50%", wtp: 0.855 / Math.abs(coefficients['1'].cost), pVal: 0.000, se: 0.074 / Math.abs(coefficients['1'].cost) },
    { attribute: "Efficacy 90%", wtp: 1.558 / Math.abs(coefficients['1'].cost), pVal: 0.000, se: 0.078 / Math.abs(coefficients['1'].cost) },
    { attribute: "Risk 8%",     wtp: -0.034 / Math.abs(coefficients['1'].cost), pVal: 0.689, se: 0.085 / Math.abs(coefficients['1'].cost) },
    { attribute: "Risk 16%",    wtp: -0.398 / Math.abs(coefficients['1'].cost), pVal: 0.000, se: 0.086 / Math.abs(coefficients['1'].cost) },
    { attribute: "Risk 30%",    wtp: -0.531 / Math.abs(coefficients['1'].cost), pVal: 0.000, se: 0.090 / Math.abs(coefficients['1'].cost) },
  ],
  '2': [
    { attribute: "Efficacy 50%", wtp: 1.031 / Math.abs(coefficients['2'].cost), pVal: 0.000, se: 0.078 / Math.abs(coefficients['2'].cost) },
    { attribute: "Efficacy 90%", wtp: 1.780 / Math.abs(coefficients['2'].cost), pVal: 0.000, se: 0.084 / Math.abs(coefficients['2'].cost) },
    { attribute: "Risk 8%",     wtp: -0.054 / Math.abs(coefficients['2'].cost), pVal: 0.550, se: 0.090 / Math.abs(coefficients['2'].cost) },
    { attribute: "Risk 16%",    wtp: -0.305 / Math.abs(coefficients['2'].cost), pVal: 0.001, se: 0.089 / Math.abs(coefficients['2'].cost) },
    { attribute: "Risk 30%",    wtp: -0.347 / Math.abs(coefficients['2'].cost), pVal: 0.000, se: 0.094 / Math.abs(coefficients['2'].cost) },
  ],
  '3': [
    // Self
    { attribute: "Risk 8% (Self)",  wtp: -0.108 / Math.abs(coefficients['3'].cost), pVal: 0.200, se: 0.084 / Math.abs(coefficients['3'].cost) },
    { attribute: "Risk 16% (Self)", wtp: -0.218 / Math.abs(coefficients['3'].cost), pVal: 0.013, se: 0.088 / Math.abs(coefficients['3'].cost) },
    { attribute: "Risk 30% (Self)", wtp: -0.339 / Math.abs(coefficients['3'].cost), pVal: 0.000, se: 0.085 / Math.abs(coefficients['3'].cost) },
    // Others - per user request, still dividing by cost (NOT costOthers)
    { attribute: "Risk 8% (Others)",  wtp: -0.111 / Math.abs(coefficients['3'].cost), pVal: 0.190, se: 0.085 / Math.abs(coefficients['3'].cost) },
    { attribute: "Risk 16% (Others)", wtp: -0.103 / Math.abs(coefficients['3'].cost), pVal: 0.227, se: 0.085 / Math.abs(coefficients['3'].cost) },
    { attribute: "Risk 30% (Others)", wtp: -0.197 / Math.abs(coefficients['3'].cost), pVal: 0.017, se: 0.083 / Math.abs(coefficients['3'].cost) }
  ]
};

/***************************************************************************
 * PREDICT UPTAKE PROBABILITY
 ***************************************************************************/
function predictUptake() {
  const scenario = buildScenarioFromInputs();
  if (!scenario) return;

  const exp = scenario.experiment;
  const coefs = coefficients[exp];

  let utility = 0;

  // Alt-Specific Constants
  if (exp === '1') {
    utility += coefs.ASC;
  } else if (exp === '2') {
    utility += coefs.ASC_mean;
  } else if (exp === '3') {
    utility += coefs.ASC_mean;
  }

  // Efficacy
  if (scenario.efficacy === '50') utility += coefs.efficacy_50;
  if (scenario.efficacy === '90') utility += coefs.efficacy_90;

  // Risk
  if (scenario.risk === '8')  utility += coefs.risk_8;
  if (scenario.risk === '16') utility += coefs.risk_16;
  if (scenario.risk === '30') utility += coefs.risk_30;

  // Cost for self
  utility += coefs.cost * scenario.cost;

  // Additional for Experiment 3
  if (exp === '3') {
    if (scenario.efficacyOthers === '50') utility += coefs.efficacyOthers_50;
    if (scenario.efficacyOthers === '90') utility += coefs.efficacyOthers_90;

    if (scenario.riskOthers === '8')  utility += coefs.riskOthers_8;
    if (scenario.riskOthers === '16') utility += coefs.riskOthers_16;
    if (scenario.riskOthers === '30') utility += coefs.riskOthers_30;

    utility += coefs.costOthers * scenario.costOthers;
  }

  const exp_utility = Math.exp(utility);
  const exp_optout = Math.exp(coefs.ASC_optout);
  const uptakeProbability = (exp_utility / (exp_utility + exp_optout)) * 100;
  
  currentUptakeProbability = uptakeProbability;
  displayUptakeProbability(uptakeProbability);
}

function displayUptakeProbability(prob) {
  const ctx = document.getElementById("probChartMain").getContext("2d");
  if (window.probChartInstance) {
    window.probChartInstance.destroy();
  }

  window.probChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ["Health Plan Uptake Probability"],
      datasets: [{
        label: 'Probability (%)',
        data: [prob],
        backgroundColor: prob < 30 ? 'rgba(231,76,60,0.6)'
          : prob < 70 ? 'rgba(241,196,15,0.6)'
          : 'rgba(39,174,96,0.6)',
        borderColor: prob < 30 ? 'rgba(231,76,60,1)'
          : prob < 70 ? 'rgba(241,196,15,1)'
          : 'rgba(39,174,96,1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      indexAxis: 'y',
      scales: {
        x: {
          beginAtZero: true,
          max: 100
        }
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `Health Plan Uptake Probability = ${prob.toFixed(2)}%`,
          font: { size: 16 }
        }
      }
    }
  });

  let advice = "";
  if (prob < 30) {
    advice = "Uptake is relatively low. Consider lowering cost or improving efficacy.";
  } else if (prob < 70) {
    advice = "Uptake is moderate. Additional improvements may boost health plan choice further.";
  } else {
    advice = "Uptake is high. Maintaining these attributes is recommended.";
  }
  alert(`Predicted Probability: ${prob.toFixed(2)}%. ${advice}`);
}

/***************************************************************************
 * BUILD SCENARIO FROM INPUTS
 ***************************************************************************/
function buildScenarioFromInputs() {
  const experiment = document.getElementById("experimentSelect").value;
  const efficacy = document.getElementById("efficacy").value;
  const risk = document.getElementById("risk").value;
  const cost = parseInt(document.getElementById("cost").value, 10);

  let efficacyOthers = "N/A";
  let riskOthers = "N/A";
  let costOthers = "N/A";

  if (experiment === "3") {
    efficacyOthers = document.getElementById("efficacyOthers").value;
    riskOthers = document.getElementById("riskOthers").value;
    costOthers = parseInt(document.getElementById("costOthers").value, 10);
  }

  const missing = [];
  if (!experiment) missing.push("Experiment");
  if (!efficacy)  missing.push("Efficacy");
  if (!risk)      missing.push("Risk");
  if (isNaN(cost)) missing.push("Cost");

  if (experiment === "3") {
    if (!efficacyOthers) missing.push("Efficacy (Others)");
    if (!riskOthers) missing.push("Risk (Others)");
    if (isNaN(costOthers)) missing.push("Cost (Others)");
  }

  if (missing.length > 0) {
    alert(`Please select or enter the following: ${missing.join(", ")}`);
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
 * WTP CHART
 ***************************************************************************/
let wtpChartInstance = null;
function renderWTPChart() {
  const experiment = document.getElementById("experimentSelect").value;
  if (!experiment) {
    alert("Please select an experiment first.");
    return;
  }
  if (!wtpData[experiment]) {
    alert("No WTP data available for this experiment.");
    return;
  }

  const dataArr = wtpData[experiment];
  const ctx = document.getElementById("wtpChartMain").getContext("2d");

  if (wtpChartInstance) {
    wtpChartInstance.destroy();
  }

  const labels = dataArr.map(item => item.attribute);
  const values = dataArr.map(item => item.wtp);
  const errors = dataArr.map(item => item.se);
  const colors = values.map(val => (val >= 0 ? 'rgba(52, 152, 219, 0.6)' : 'rgba(231,76,60,0.6)'));

  const dataConfig = {
    labels: labels,
    datasets: [{
      label: "WTP (USD)",
      data: values,
      backgroundColor: colors,
      borderColor: values.map(val => (val >= 0 ? 'rgba(52, 152, 219, 1)' : 'rgba(231,76,60,1)')),
      borderWidth: 1
    }]
  };

  wtpChartInstance = new Chart(ctx, {
    type: 'bar',
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
          text: `Willingness to Pay (USD) - Experiment ${experiment}`,
          font: { size: 16 }
        },
        tooltip: {
          callbacks: {
            afterBody: function(context) {
              const idx = context[0].dataIndex;
              const seVal = errors[idx].toFixed(2);
              const pVal = dataArr[idx].pVal;
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
        chart.getDatasetMeta(0).data.forEach((bar, i) => {
          const centerX = bar.x;
          const value = values[i];
          const se = errors[i];
          if (se && typeof se === 'number') {
            const topY = y.getPixelForValue(value + se);
            const bottomY = y.getPixelForValue(value - se);

            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            // Main error line
            ctx.moveTo(centerX, topY);
            ctx.lineTo(centerX, bottomY);
            // Caps
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
}

/***************************************************************************
 * SCENARIO SAVING
 ***************************************************************************/
function saveScenario() {
  const scenario = buildScenarioFromInputs();
  if (!scenario) return;

  if (currentUptakeProbability === 0) {
    alert("Please calculate the Health Plan Uptake Probability before saving.");
    return;
  }

  const experimentName = `Experiment ${scenario.experiment}`;
  const savedScenario = {
    name: `Scenario ${savedResults.length + 1}`,
    experiment: experimentName,
    efficacy: scenario.efficacy,
    risk: scenario.risk,
    cost: scenario.cost,
    efficacyOthers: scenario.experiment === '3' ? scenario.efficacyOthers : 'N/A',
    riskOthers: scenario.experiment === '3' ? scenario.riskOthers : 'N/A',
    costOthers: scenario.experiment === '3' ? scenario.costOthers : 'N/A',
    uptake: currentUptakeProbability.toFixed(2)
  };

  savedResults.push(savedScenario);
  addScenarioToTable(savedScenario);
  alert(`"${savedScenario.name}" has been saved successfully.`);
  renderWTPComparison();
}

/***************************************************************************
 * ADD SCENARIO TO TABLE
 ***************************************************************************/
function addScenarioToTable(scenario) {
  const tableBody = document.querySelector("#scenarioTable tbody");
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${scenario.name}</td>
    <td>${scenario.experiment}</td>
    <td>${scenario.efficacy}</td>
    <td>${scenario.risk}</td>
    <td>$${scenario.cost}</td>
    <td>${scenario.efficacyOthers}</td>
    <td>${scenario.riskOthers}</td>
    <td>$${scenario.costOthers}</td>
    <td>${scenario.uptake}</td>
  `;
  tableBody.appendChild(row);
}

/***************************************************************************
 * LOAD SAVED RESULTS (CLEARS ANY PREVIOUS)
 ***************************************************************************/
function loadSavedResults() {
  savedResults = [];
  const tableBody = document.querySelector("#scenarioTable tbody");
  tableBody.innerHTML = '';
}

/***************************************************************************
 * TOGGLE EXPERIMENT 3 FIELDS
 ***************************************************************************/
function toggleExperimentAttributes() {
  const experiment = document.getElementById("experimentSelect").value;
  const isExp3 = (experiment === '3');
  document.getElementById("efficacyOthersDiv").style.display = isExp3 ? 'block' : 'none';
  document.getElementById("riskOthersDiv").style.display = isExp3 ? 'block' : 'none';
  document.getElementById("costOthersDiv").style.display = isExp3 ? 'block' : 'none';
}

/***************************************************************************
 * FILTER SCENARIOS
 ***************************************************************************/
function filterScenarios() {
  const filterValue = document.getElementById("filterExperiment").value;
  const rows = document.querySelectorAll("#scenarioTable tbody tr");

  rows.forEach(row => {
    const experimentCell = row.cells[1].textContent; 
    if (filterValue === "all") {
      row.style.display = "";
    } else if (experimentCell === filterValue) {
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
    alert("No scenarios to export. Please save at least one scenario.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let currentY = margin;

  doc.setFontSize(16);
  doc.text("T2DM Equity-Efficiency Decision Aid Tool - Scenario Comparison", pageWidth / 2, currentY, { align: 'center' });
  currentY += 10;

  savedResults.forEach((scn, index) => {
    if (currentY + 50 > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFontSize(14);
    doc.text(`Scenario ${index + 1}: ${scn.name}`, margin, currentY);
    currentY += 7;

    doc.setFontSize(12);
    doc.text(`Experiment: ${scn.experiment}`, margin, currentY); currentY += 5;
    doc.text(`Efficacy (Self): ${scn.efficacy}%`, margin, currentY); currentY += 5;
    doc.text(`Risk (Self): ${scn.risk}%`, margin, currentY); currentY += 5;
    doc.text(`Monthly Cost (Self): $${scn.cost}`, margin, currentY); currentY += 5;
    if (scn.efficacyOthers !== 'N/A') {
      doc.text(`Efficacy (Others): ${scn.efficacyOthers}%`, margin, currentY); currentY += 5;
    }
    if (scn.riskOthers !== 'N/A') {
      doc.text(`Risk (Others): ${scn.riskOthers}%`, margin, currentY); currentY += 5;
    }
    if (scn.costOthers !== 'N/A') {
      doc.text(`Monthly Cost (Others): $${scn.costOthers}`, margin, currentY); currentY += 5;
    }
    doc.text(`Health Plan Uptake Probability: ${scn.uptake}%`, margin, currentY); 
    currentY += 10;
  });

  doc.save("Scenarios_Comparison.pdf");
}

/***************************************************************************
 * RENDER WTP COMPARISON
 ***************************************************************************/
let wtpComparisonChartInstance = null;
function renderWTPComparison() {
  // If no scenarios
  if (savedResults.length < 1) {
    document.getElementById("wtpComparisonContainer").style.display = "none";
    return;
  }
  document.getElementById("wtpComparisonContainer").style.display = "block";

  const ctx = document.getElementById("wtpComparisonChart").getContext("2d");
  if (wtpComparisonChartInstance) {
    wtpComparisonChartInstance.destroy();
  }

  // Prepare data structure
  const averageWTP = {
    "Experiment 1": { Risk: [] },
    "Experiment 2": { Risk: [] },
    "Experiment 3": { "Risk (Self)": [], "Risk (Others)": [] }
  };

  savedResults.forEach(scn => {
    const exp = scn.experiment; 
    if (!averageWTP[exp]) return;

    const expNum = exp.split(' ')[1]; 
    const dataArr = wtpData[expNum];
    if (!dataArr) return;

    dataArr.forEach(item => {
      if (item.attribute.includes("(Others)")) {
        averageWTP[exp]["Risk (Others)"].push(item.wtp);
      } else {
        averageWTP[exp]["Risk"].push(item.wtp);
        if (exp === "Experiment 3") {
          averageWTP[exp]["Risk (Self)"].push(item.wtp);
        }
      }
    });
  });

  // Compute average WTP
  const computedAvg = {
    "Experiment 1": {
      "Risk 8%": avg(averageWTP["Experiment 1"].Risk),
      "Risk 16%": avg(averageWTP["Experiment 1"].Risk),
      "Risk 30%": avg(averageWTP["Experiment 1"].Risk),
    },
    "Experiment 2": {
      "Risk 8%": avg(averageWTP["Experiment 2"].Risk),
      "Risk 16%": avg(averageWTP["Experiment 2"].Risk),
      "Risk 30%": avg(averageWTP["Experiment 2"].Risk),
    },
    "Experiment 3": {
      // Combined average of self + others
      "Risk 8%": computeCombinedAvg(averageWTP["Experiment 3"]["Risk (Self)"], averageWTP["Experiment 3"]["Risk (Others)"]),
      "Risk 16%": computeCombinedAvg(averageWTP["Experiment 3"]["Risk (Self)"], averageWTP["Experiment 3"]["Risk (Others)"]),
      "Risk 30%": computeCombinedAvg(averageWTP["Experiment 3"]["Risk (Self)"], averageWTP["Experiment 3"]["Risk (Others)"])
    }
  };

  // Chart data
  const labels = ["Risk 8%", "Risk 16%", "Risk 30%"];
  const datasets = [
    {
      label: "Experiment 1",
      data: [
        parseFloat(computedAvg["Experiment 1"]["Risk 8%"]),
        parseFloat(computedAvg["Experiment 1"]["Risk 16%"]),
        parseFloat(computedAvg["Experiment 1"]["Risk 30%"])
      ],
      backgroundColor: 'rgba(52, 152, 219, 0.6)',
      borderColor: 'rgba(52, 152, 219, 1)',
      borderWidth: 1
    },
    {
      label: "Experiment 2",
      data: [
        parseFloat(computedAvg["Experiment 2"]["Risk 8%"]),
        parseFloat(computedAvg["Experiment 2"]["Risk 16%"]),
        parseFloat(computedAvg["Experiment 2"]["Risk 30%"])
      ],
      backgroundColor: 'rgba(46, 204, 113, 0.6)',
      borderColor: 'rgba(46, 204, 113, 1)',
      borderWidth: 1
    },
    {
      label: "Experiment 3",
      data: [
        parseFloat(computedAvg["Experiment 3"]["Risk 8%"]),
        parseFloat(computedAvg["Experiment 3"]["Risk 16%"]),
        parseFloat(computedAvg["Experiment 3"]["Risk 30%"])
      ],
      backgroundColor: 'rgba(231, 76, 60, 0.6)',
      borderColor: 'rgba(231, 76, 60, 1)',
      borderWidth: 1
    }
  ];

  wtpComparisonChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Average WTP (USD)'
          }
        }
      },
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text: "Average WTP for Risk Across Experiments",
          font: { size: 16 }
        }
      }
    }
  });

  // Render a textual conclusion
  renderWTPComparisonConclusion(computedAvg);
}

function avg(arr) {
  if (!arr || arr.length === 0) return 0;
  const sum = arr.reduce((acc, val) => acc + val, 0);
  return (sum / arr.length).toFixed(2);
}

// For Experiment 3, combining Self + Others
function computeCombinedAvg(selfArr, othersArr) {
  if ((!selfArr || selfArr.length === 0) && (!othersArr || othersArr.length === 0)) return 0;
  const selfAvg = selfArr.length > 0 ? (selfArr.reduce((acc, val) => acc + val, 0) / selfArr.length) : 0;
  const othersAvg = othersArr.length > 0 ? (othersArr.reduce((acc, val) => acc + val, 0) / othersArr.length) : 0;
  return ((selfAvg + othersAvg) / 2).toFixed(2);
}

function renderWTPComparisonConclusion(avgData) {
  const el = document.getElementById("wtpComparisonConclusion");
  el.innerHTML = `
  <strong>Conclusion:</strong><br/><br/>
  Across experiments, risk aversion progressively declined when equity considerations were introduced. 
  In a self-focused setup, respondents showed strong risk aversion. This aversion decreased notably when 
  they considered equal health outcomes for others with poorer health. However, the reduction in risk 
  aversion was less pronounced when outcomes were unequal, suggesting that disparities might reduce 
  willingness to accept personal risks.
  <br/><br/>
  <strong>Average WTP for Risk (USD):</strong> (combined or simplified for Exp. 3)
  <ul>
    <li><strong>Experiment 1</strong>: 
      <ul>
        <li>Risk 8%: $${avgData["Experiment 1"]["Risk 8%"]}</li>
        <li>Risk 16%: $${avgData["Experiment 1"]["Risk 16%"]}</li>
        <li>Risk 30%: $${avgData["Experiment 1"]["Risk 30%"]}</li>
      </ul>
    </li>
    <li><strong>Experiment 2</strong>:
      <ul>
        <li>Risk 8%: $${avgData["Experiment 2"]["Risk 8%"]}</li>
        <li>Risk 16%: $${avgData["Experiment 2"]["Risk 16%"]}</li>
        <li>Risk 30%: $${avgData["Experiment 2"]["Risk 30%"]}</li>
      </ul>
    </li>
    <li><strong>Experiment 3</strong> (Self + Others averaged):
      <ul>
        <li>Risk 8%: $${avgData["Experiment 3"]["Risk 8%"]}</li>
        <li>Risk 16%: $${avgData["Experiment 3"]["Risk 16%"]}</li>
        <li>Risk 30%: $${avgData["Experiment 3"]["Risk 30%"]}</li>
      </ul>
    </li>
  </ul>
  `;
}

/***************************************************************************
 * COSTS & BENEFITS
 ***************************************************************************/
let costsChartInstance = null;
let benefitsChartInstance = null;

const QALY_SCENARIOS_VALUES = {
  low: 0.02,
  moderate: 0.05,
  high: 0.1
};

const VALUE_PER_QALY = 50000;

function renderCostsBenefits() {
  const scenario = buildScenarioFromInputs();
  if (!scenario) return;

  const uptake = currentUptakeProbability;
  const uptakeFraction = uptake / 100;
  let totalCost = 0;

  // Fixed costs
  costComponents.forEach(item => {
    totalCost += item.totalCost;
  });

  // Variable costs scale with uptake fraction
  costComponents.forEach(item => {
    if (item.item === "Advertisement" || item.item === "Training") {
      // already added as fixed
    } else {
      totalCost += item.totalCost * uptakeFraction;
    }
  });

  // Number of participants
  const participants = Math.round(701 * uptakeFraction);

  // QALY Gains
  const qalyLevel = document.getElementById("qalySelect").value;
  const qalyPerPerson = QALY_SCENARIOS_VALUES[qalyLevel];
  const totalQALY = participants * qalyPerPerson;
  const monetizedBenefits = totalQALY * VALUE_PER_QALY;
  const netBenefit = monetizedBenefits - totalCost;

  const container = document.getElementById("costsBenefitsResults");
  container.innerHTML = '';

  // Table of cost components
  const table = document.createElement("table");
  table.id = "costComponentsTable";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Cost Item</th>
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
  container.appendChild(table);

  // Summary
  const summaryDiv = document.createElement("div");
  summaryDiv.id = "summaryCalculations";
  summaryDiv.innerHTML = `
    <h3>Cost &amp; Benefits Analysis</h3>
    <p><strong>Health Plan Uptake Probability:</strong> ${uptake.toFixed(2)}%</p>
    <p><strong>Number of Participants:</strong> ${participants}</p>
    <p><strong>Total Treatment Cost:</strong> $${totalCost.toFixed(2)}</p>
    <p><strong>Total QALY Gains:</strong> ${totalQALY.toFixed(2)}</p>
    <p><strong>Monetised Benefits:</strong> $${monetizedBenefits.toLocaleString()}</p>
    <p><strong>Net Benefit:</strong> $${netBenefit.toLocaleString()}</p>
  `;
  container.appendChild(summaryDiv);

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

  container.appendChild(chartDiv);

  // Cost Chart
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
        borderColor: "rgba(192, 57, 43,1)",
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
      labels: ["Monetised QALY Benefits"],
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
