/****************************************************************************
 * script.js
 * 1) Tab switching
 * 2) Range slider label updates
 * 3) Main DCE coefficients for Experiments 1, 2, 3 with adjusted cost coefficients
 * 4) WTP data for all features with error bars (p-values, SE)
 * 5) Health Plan Uptake Probability bar chart
 * 6) Scenario saving & PDF export
 * 7) Cost-benefit analysis based on literature-reviewed costs
 * 8) Dynamic attribute display based on experiment selection
 * 9) WTP comparison across experiments
 * Authors: Surachat Ngorsuraches (Auburn University, USA), Mesfin Genie (The University of Newcastle, Australia)
 *****************************************************************************/

/** On page load, default to introduction tab and load saved scenarios */
window.onload = function() {
  openTab('introTab', document.querySelector('.tablink.active'));
  loadSavedResults();
  // Display dynamic attributes for Experiment 3
  document.getElementById("experimentSelect").addEventListener("change", toggleExperimentAttributes);
};

/** Tab switching function */
function openTab(tabId, btn) {
  const allTabs = document.getElementsByClassName("tabcontent");
  for (let i=0; i<allTabs.length; i++){
    allTabs[i].style.display = "none";
  }
  const allBtns = document.getElementsByClassName("tablink");
  for (let j=0; j<allBtns.length; j++){
    allBtns[j].classList.remove("active");
  }
  document.getElementById(tabId).style.display = "block";
  btn.classList.add("active");

  // Render charts if navigating to respective tabs
  if (tabId === 'wtpTab') {
    renderWTPChart();
  }
  if (tabId === 'costsTab') {
    renderCostsBenefits();
  }
}

/** Range slider label updates */
function updateCostDisplay(val) {
  document.getElementById("costValue").textContent = val;
}

function updateCostOthersDisplay(val) {
  document.getElementById("costOthersValue").textContent = val;
}

/***************************************************************************
 * MAIN DCE COEFFICIENTS
 * Adjusted cost coefficients by dividing by 100
 ***************************************************************************/
const coefficients = {
  '1': { // Experiment 1
    ASC_optout: -0.553,
    ASC: -0.203,
    efficacy_50: 0.855,
    efficacy_90: 1.558,
    risk_8: -0.034,
    risk_16: -0.398,
    risk_30: -0.531,
    cost: -0.000123, // -0.0123 / 100
    ASC_sd: 0.987
  },
  '2': { // Experiment 2
    ASC_optout: -0.338,
    ASC_mean: -0.159,
    efficacy_50: 1.031,
    efficacy_90: 1.780,
    risk_8: -0.054,
    risk_16: -0.305,
    risk_30: -0.347,
    cost: -0.00014, // -0.0140 / 100
    ASC_sd: 1.196
  },
  '3': { // Experiment 3
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
    cost: -0.0007, // -0.070 / 100
    costOthers: -0.00041, // -0.041 / 100
    ASC_sd: 1.033
  }
};

/***************************************************************************
 * COST COMPONENTS BASED ON LITERATURE REVIEW IN THE USA
 ***************************************************************************/
const costComponents = [
  {
    item: "Advertisement",
    unitCost: 5000.00, // USD
    quantity: 1,
    totalCost: 5000.00
  },
  {
    item: "Training",
    unitCost: 3000.00, // USD
    quantity: 1,
    totalCost: 3000.00
  },
  {
    item: "Delivery Variable Costs",
    unitCost: 1500.00, // USD
    quantity: 1,
    totalCost: 1500.00
  },
  {
    item: "Participant Time and Travel Costs",
    unitCost: 800.00, // USD
    quantity: 1,
    totalCost: 800.00
  },
  {
    item: "Medication Costs (Insulin, Oral Hypoglycemics)",
    unitCost: 2000.00, // USD
    quantity: 1,
    totalCost: 2000.00
  },
  {
    item: "Blood Glucose Monitoring",
    unitCost: 500.00, // USD
    quantity: 1,
    totalCost: 500.00
  },
  {
    item: "Healthcare Provider Visits",
    unitCost: 1200.00, // USD
    quantity: 1,
    totalCost: 1200.00
  },
  {
    item: "Hospitalization for Complications",
    unitCost: 5000.00, // USD
    quantity: 1,
    totalCost: 5000.00
  },
  {
    item: "Patient Time and Travel Costs",
    unitCost: 600.00, // USD
    quantity: 1,
    totalCost: 600.00
  },
  {
    item: "Administrative and Training Costs",
    unitCost: 1000.00, // USD
    quantity: 1,
    totalCost: 1000.00
  }
];

/***************************************************************************
 * WILLINGNESS TO PAY DATA FOR ALL ATTRIBUTES
 ***************************************************************************/
const wtpData = {
  '1': [ // Experiment 1
    { attribute: "Efficacy 50%", wtp: coefficients['1'].efficacy_50 / Math.abs(coefficients['1'].cost), pVal: 0.000, se: 0.074 / Math.abs(coefficients['1'].cost) },
    { attribute: "Efficacy 90%", wtp: coefficients['1'].efficacy_90 / Math.abs(coefficients['1'].cost), pVal: 0.000, se: 0.078 / Math.abs(coefficients['1'].cost) },
    { attribute: "Risk 8%", wtp: coefficients['1'].risk_8 / Math.abs(coefficients['1'].cost), pVal: 0.689, se: 0.085 / Math.abs(coefficients['1'].cost) },
    { attribute: "Risk 16%", wtp: coefficients['1'].risk_16 / Math.abs(coefficients['1'].cost), pVal: 0.000, se: 0.086 / Math.abs(coefficients['1'].cost) },
    { attribute: "Risk 30%", wtp: coefficients['1'].risk_30 / Math.abs(coefficients['1'].cost), pVal: 0.000, se: 0.090 / Math.abs(coefficients['1'].cost) }
  ],
  '2': [ // Experiment 2
    { attribute: "Efficacy 50%", wtp: coefficients['2'].efficacy_50 / Math.abs(coefficients['2'].cost), pVal: 0.000, se: 0.078 / Math.abs(coefficients['2'].cost) },
    { attribute: "Efficacy 90%", wtp: coefficients['2'].efficacy_90 / Math.abs(coefficients['2'].cost), pVal: 0.000, se: 0.084 / Math.abs(coefficients['2'].cost) },
    { attribute: "Risk 8%", wtp: coefficients['2'].risk_8 / Math.abs(coefficients['2'].cost), pVal: 0.550, se: 0.090 / Math.abs(coefficients['2'].cost) },
    { attribute: "Risk 16%", wtp: coefficients['2'].risk_16 / Math.abs(coefficients['2'].cost), pVal: 0.001, se: 0.089 / Math.abs(coefficients['2'].cost) },
    { attribute: "Risk 30%", wtp: coefficients['2'].risk_30 / Math.abs(coefficients['2'].cost), pVal: 0.000, se: 0.094 / Math.abs(coefficients['2'].cost) }
  ],
  '3': [ // Experiment 3
    { attribute: "Efficacy 50%", wtp: coefficients['3'].efficacy_50 / Math.abs(coefficients['3'].cost), pVal: 0.000, se: 0.081 / Math.abs(coefficients['3'].cost) },
    { attribute: "Efficacy 90%", wtp: coefficients['3'].efficacy_90 / Math.abs(coefficients['3'].cost), pVal: 0.000, se: 0.075 / Math.abs(coefficients['3'].cost) },
    { attribute: "Risk 8%", wtp: coefficients['3'].risk_8 / Math.abs(coefficients['3'].cost), pVal: 0.200, se: 0.084 / Math.abs(coefficients['3'].cost) },
    { attribute: "Risk 16%", wtp: coefficients['3'].risk_16 / Math.abs(coefficients['3'].cost), pVal: 0.013, se: 0.088 / Math.abs(coefficients['3'].cost) },
    { attribute: "Risk 30%", wtp: coefficients['3'].risk_30 / Math.abs(coefficients['3'].cost), pVal: 0.000, se: 0.085 / Math.abs(coefficients['3'].cost) },
    { attribute: "Risk Others 8%", wtp: coefficients['3'].riskOthers_8 / Math.abs(coefficients['3'].cost), pVal: 0.190, se: 0.085 / Math.abs(coefficients['3'].cost) },
    { attribute: "Risk Others 16%", wtp: coefficients['3'].riskOthers_16 / Math.abs(coefficients['3'].cost), pVal: 0.227, se: 0.085 / Math.abs(coefficients['3'].cost) },
    { attribute: "Risk Others 30%", wtp: coefficients['3'].riskOthers_30 / Math.abs(coefficients['3'].cost), pVal: 0.017, se: 0.083 / Math.abs(coefficients['3'].cost) }
  ]
};

/***************************************************************************
 * HEALTH PLAN UPLOAD PROBABILITY CALCULATION
 ***************************************************************************/
function predictUptake() {
  const scenario = buildScenarioFromInputs();
  if (!scenario) return;

  const experiment = scenario.experiment;
  const coefs = coefficients[experiment];

  // Compute utility
  let utility = 0;

  // Alternative Specific Constants
  if (experiment === '1' || experiment === '2') {
    if (experiment === '2') {
      utility += coefs.ASC_mean;
    } else {
      utility += coefs.ASC;
    }
  } else if (experiment === '3') {
    utility += coefs.ASC_mean;
  }

  // Add attributes
  // Efficacy
  if (scenario.efficacy === '50') {
    utility += coefs.efficacy_50;
  } else if (scenario.efficacy === '90') {
    utility += coefs.efficacy_90;
  }

  // Risk
  if (scenario.risk === '8') {
    utility += coefs.risk_8;
  } else if (scenario.risk === '16') {
    utility += coefs.risk_16;
  } else if (scenario.risk === '30') {
    utility += coefs.risk_30;
  }

  // Cost
  utility += coefs.cost * scenario.cost;

  // Experiment 3 additional attributes
  if (experiment === '3') {
    if (scenario.efficacyOthers === '50') {
      utility += coefs.efficacyOthers_50;
    } else if (scenario.efficacyOthers === '90') {
      utility += coefs.efficacyOthers_90;
    }

    if (scenario.riskOthers === '8') {
      utility += coefs.riskOthers_8;
    } else if (scenario.riskOthers === '16') {
      utility += coefs.riskOthers_16;
    } else if (scenario.riskOthers === '30') {
      utility += coefs.riskOthers_30;
    }

    utility += coefs.costOthers * scenario.costOthers;
  }

  // Compute probabilities using Error-Component Logit
  const exp_utility = Math.exp(utility);
  const exp_optout = Math.exp(coefs.ASC_optout);
  const uptakeProbability = exp_utility / (exp_utility + exp_optout) * 100;

  // Display results
  displayUptakeProbability(uptakeProbability);
}

/***************************************************************************
 * BUILD SCENARIO FROM INPUTS
 ***************************************************************************/
function buildScenarioFromInputs() {
  const experiment = document.getElementById("experimentSelect").value;
  if (!experiment) {
    alert("Please select an experiment.");
    return null;
  }

  const efficacy = document.getElementById("efficacy").value;
  const risk = document.getElementById("risk").value;
  const cost = parseInt(document.getElementById("cost").value, 10);

  // For Experiment 3, additional attributes
  let efficacyOthers = "N/A"; // default reference
  let riskOthers = "N/A"; // default reference
  let costOthers = 0; // default

  if (experiment === '3') {
    efficacyOthers = document.getElementById("efficacyOthers").value;
    riskOthers = document.getElementById("riskOthers").value;
    costOthers = parseInt(document.getElementById("costOthers").value, 10);
  }

  // Basic validation
  if (isNaN(cost) || cost < 0 || cost > 1000) {
    alert("Please select a valid Monthly Out-of-Pocket Cost between $0 and $1000.");
    return null;
  }

  // Additional validation for Experiment 3
  if (experiment === '3') {
    if (!efficacyOthers || !riskOthers) {
      alert("Please select Efficacy and Risk for Others.");
      return null;
    }
    if (isNaN(costOthers) || costOthers < 0 || costOthers > 1000) {
      alert("Please select a valid Monthly Out-of-Pocket Cost for Others between $0 and $1000.");
      return null;
    }
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
 * DISPLAY HEALTH PLAN UPTAKE PROBABILITY
 ***************************************************************************/
let probChartInstance = null;
function displayUptakeProbability(uptakeProbability) {
  const ctx = document.getElementById("probChartMain").getContext("2d");

  if (probChartInstance) {
    probChartInstance.destroy();
  }

  probChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ["Health Plan Uptake Probability"],
      datasets: [{
        label: 'Probability (%)',
        data: [uptakeProbability],
        backgroundColor: uptakeProbability < 30 ? 'rgba(231,76,60,0.6)'
                         : uptakeProbability < 70 ? 'rgba(241,196,15,0.6)'
                                 : 'rgba(39,174,96,0.6)',
        borderColor: uptakeProbability < 30 ? 'rgba(231,76,60,1)'
                      : uptakeProbability < 70 ? 'rgba(241,196,15,1)'
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
          text: `Health Plan Uptake Probability = ${uptakeProbability.toFixed(2)}%`,
          font: { size: 16 }
        }
      }
    }
  });

  // Provide dynamic suggestions
  let interpretation = "";
  if (uptakeProbability < 30) {
    interpretation = "Uptake is relatively low. Consider lowering cost or increasing efficacy.";
  } else if (uptakeProbability < 70) {
    interpretation = "Uptake is moderate. Additional improvements may further boost health plan choice.";
  } else {
    interpretation = "Uptake is high. Maintaining these attributes is recommended.";
  }
  alert(`Predicted probability: ${uptakeProbability.toFixed(2)}%. ${interpretation}`);
}

/***************************************************************************
 * WTP CHART WITH ERROR BARS
 ***************************************************************************/
let wtpChartInstance = null;
function renderWTPChart() {
  const experiment = document.getElementById("experimentSelect").value;
  if (!experiment) {
    alert("Please select an experiment in the Inputs tab.");
    return;
  }

  const data = wtpData[experiment];
  if (!data) {
    alert("No WTP data available for the selected experiment.");
    return;
  }

  const ctx = document.getElementById("wtpChartMain").getContext("2d");

  if (wtpChartInstance) {
    wtpChartInstance.destroy();
  }

  const labels = data.map(item => item.attribute);
  const values = data.map(item => item.wtp);
  const errors = data.map(item => item.se);
  const colors = data.map(item => item.wtp >=0 ? 'rgba(39,174,96,0.6)' : 'rgba(231,76,60,0.6)');

  const dataConfig = {
    labels: labels,
    datasets: [{
      label: "WTP (USD)",
      data: values,
      backgroundColor: colors,
      borderColor: values.map(v => v >=0 ? 'rgba(39,174,96,1)' : 'rgba(231,76,60,1)'),
      borderWidth: 1,
      error: errors
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
          text: `Willingness to Pay (USD) for Attributes - Experiment ${experiment}`,
          font: { size: 16 }
        },
        tooltip: {
          callbacks: {
            afterBody: function(context) {
              const index = context[0].dataIndex;
              const se = wtpData[experiment][index].se.toFixed(2);
              const pVal = wtpData[experiment][index].pVal;
              return `SE: ${se}, p-value: ${pVal}`;
            }
          }
        }
      }
    },
    plugins: [{
      // Draw vertical error bars
      id: 'errorbars',
      afterDraw: chart => {
        const {
          ctx,
          scales: { x, y }
        } = chart;

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
            // main line
            ctx.moveTo(centerX, topY);
            ctx.lineTo(centerX, bottomY);
            // top cap
            ctx.moveTo(centerX - 5, topY);
            ctx.lineTo(centerX + 5, topY);
            // bottom cap
            ctx.moveTo(centerX - 5, bottomY);
            ctx.lineTo(centerX + 5, bottomY);
            ctx.stroke();
            ctx.restore();
          }
        });
      }
    }]
  });
}

/***************************************************************************
 * COSTS & BENEFITS ANALYSIS
 ***************************************************************************/
let costsChartInstance = null;
let benefitsChartInstance = null;

const QALY_SCENARIOS_VALUES = {
  low: 0.02,
  moderate: 0.05,
  high: 0.1
};

const VALUE_PER_QALY = 50000; // USD 50,000

function renderCostsBenefits() {
  const scenario = buildScenarioFromInputs();
  if (!scenario) return;

  const experiment = scenario.experiment;
  const coefs = coefficients[experiment];

  // Compute total treatment cost based on cost components
  let totalCost = 0;

  // Fixed costs
  costComponents.forEach(component => {
    totalCost += component.totalCost;
  });

  // Compute uptake probability to determine variable costs
  const uptakeMatch = document.getElementById("probChartMain").getContext("2d").canvas.parentElement.querySelector('h3').textContent.match(/= (\d+(\.\d+)?)%/);
  const uptake = uptakeMatch ? parseFloat(uptakeMatch[1]) : 0;
  const uptakeFraction = uptake / 100;

  // Variable costs based on uptake probability
  costComponents.forEach(component => {
    if (component.unitCost === 0) return; // Skip zero cost components
    if (component.item === "Advertisement" || component.item === "Training") {
      // These are fixed costs already added
      return;
    }
    totalCost += component.totalCost * uptakeFraction;
  });

  // Number of participants based on uptake probability
  const numberOfParticipants = Math.round(701 * uptakeFraction);

  // QALY Gain
  const qalyScenario = document.getElementById("qalySelect").value;
  const qalyPerParticipant = QALY_SCENARIOS_VALUES[qalyScenario];
  
  // Total QALY Gains
  const totalQALY = numberOfParticipants * qalyPerParticipant;

  // Monetised Benefits
  const monetizedBenefits = totalQALY * VALUE_PER_QALY;

  // Net Benefit
  const netBenefit = monetizedBenefits - totalCost;

  // Prepare Cost Components Display
  const costComponentsDisplay = [
    ...costComponents.map(c => ({ item: c.item, value: c.totalCost }))
  ];

  // Display in Costs & Benefits Tab
  const costsTab = document.getElementById("costsBenefitsResults");
  costsTab.innerHTML = '';

  // Create Cost Components Table
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
      ${costComponentsDisplay.map(c => `
        <tr>
          <td>${c.item}</td>
          <td>$${c.value.toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  `;
  costsTab.appendChild(table);

  // Add Summary Calculations
  const summaryDiv = document.createElement("div");
  summaryDiv.id = "summaryCalculations";
  summaryDiv.innerHTML = `
    <h3>Cost &amp; Benefits Analysis</h3>
    <p><strong>Health Plan Uptake Probability:</strong> ${uptake.toFixed(2)}%</p>
    <p><strong>Number of Participants:</strong> ${numberOfParticipants}</p>
    <p><strong>Total Treatment Cost:</strong> $${totalCost.toFixed(2)}</p>
    <p><strong>Total QALY Gains:</strong> ${totalQALY.toFixed(2)} QALYs</p>
    <p><strong>Monetised Benefits:</strong> $${monetizedBenefits.toLocaleString()}</p>
    <p><strong>Net Benefit:</strong> $${netBenefit.toLocaleString()}</p>
  `;
  costsTab.appendChild(summaryDiv);

  // Render Cost & Benefit Charts Side by Side
  const chartsDiv = document.createElement("div");
  chartsDiv.className = "chart-grid";

  // Total Treatment Cost Chart
  const costChartBox = document.createElement("div");
  costChartBox.className = "chart-box";
  costChartBox.innerHTML = `<h3>Total Treatment Cost</h3><canvas id="costChart"></canvas>`;
  chartsDiv.appendChild(costChartBox);

  // Monetised Benefits Chart
  const benefitChartBox = document.createElement("div");
  benefitChartBox.className = "chart-box";
  benefitChartBox.innerHTML = `<h3>Monetised QALY Benefits</h3><canvas id="benefitChart"></canvas>`;
  chartsDiv.appendChild(benefitChartBox);

  costsTab.appendChild(chartsDiv);

  // Render Cost Chart
  const ctxCost = document.getElementById("costChart").getContext("2d");
  if (costsChartInstance) {
    costsChartInstance.destroy();
  }
  costsChartInstance = new Chart(ctxCost, {
    type: 'bar',
    data: {
      labels: ["Total Treatment Cost"],
      datasets: [{
        label: 'USD',
        data: [totalCost],
        backgroundColor: 'rgba(231,76,60,0.6)',
        borderColor: 'rgba(192,57,43,1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Total Treatment Cost',
          font: { size: 16 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: totalCost * 1.2
        }
      }
    }
  });

  // Render Benefit Chart
  const ctxBenefit = document.getElementById("benefitChart").getContext("2d");
  if (benefitsChartInstance) {
    benefitsChartInstance.destroy();
  }
  benefitsChartInstance = new Chart(ctxBenefit, {
    type: 'bar',
    data: {
      labels: ["Monetised QALY Benefits"],
      datasets: [{
        label: 'USD',
        data: [monetizedBenefits],
        backgroundColor: 'rgba(39,174,96,0.6)',
        borderColor: 'rgba(27, 163, 156,1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Monetised QALY Benefits',
          font: { size: 16 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: monetizedBenefits * 1.2
        }
      }
    }
  });
}

/***************************************************************************
 * SAVE SCENARIO
 ***************************************************************************/
let savedResults = [];

function saveScenario() {
  const scenario = buildScenarioFromInputs();
  if (!scenario) return;

  // Ensure uptake has been predicted
  const uptakeMatch = document.getElementById("probChartMain").getContext("2d").canvas.parentElement.querySelector('h3').textContent.match(/= (\d+(\.\d+)?)%/);
  const uptake = uptakeMatch ? parseFloat(uptakeMatch[1]) : null;

  if (uptake === null || uptake === 0) {
    alert("Please predict the Health Plan Uptake Probability before saving the scenario.");
    return;
  }

  const experiment = scenario.experiment;
  const experimentName = `Experiment ${experiment}`;

  const savedResult = {
    name: `Scenario ${savedResults.length + 1}`,
    experiment: experimentName,
    efficacy: scenario.efficacy,
    risk: scenario.risk,
    cost: scenario.cost,
    efficacyOthers: experiment === '3' ? scenario.efficacyOthers : 'N/A',
    riskOthers: experiment === '3' ? scenario.riskOthers : 'N/A',
    costOthers: experiment === '3' ? scenario.costOthers : 'N/A',
    uptake: uptake.toFixed(2)
  };

  savedResults.push(savedResult);
  localStorage.setItem('savedResults', JSON.stringify(savedResults));

  // Update the table
  addScenarioToTable(savedResult);
  alert(`"${savedResult.name}" has been saved successfully.`);

  // Update WTP Comparison
  renderWTPComparison();
}

/***************************************************************************
 * ADD SCENARIO TO TABLE
 ***************************************************************************/
function addScenarioToTable(result) {
  const tableBody = document.querySelector("#scenarioTable tbody");
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${result.name}</td>
    <td>${result.experiment}</td>
    <td>${result.efficacy}</td>
    <td>${result.risk}</td>
    <td>$${result.cost}</td>
    <td>${result.efficacyOthers}</td>
    <td>${result.riskOthers}</td>
    <td>$${result.costOthers}</td>
    <td>${result.uptake}</td>
  `;

  tableBody.appendChild(row);
}

/***************************************************************************
 * LOAD SAVED RESULTS FROM LOCAL STORAGE
 ***************************************************************************/
function loadSavedResults() {
  const storedResults = JSON.parse(localStorage.getItem('savedResults')) || [];
  storedResults.forEach(result => {
    addScenarioToTable(result);
  });
  renderWTPComparison();
}

/***************************************************************************
 * TOGGLE ADDITIONAL ATTRIBUTES FOR EXPERIMENT 3
 ***************************************************************************/
function toggleExperimentAttributes() {
  const experiment = document.getElementById("experimentSelect").value;
  if (experiment === '3') {
    document.getElementById("efficacyOthersDiv").style.display = "block";
    document.getElementById("riskOthersDiv").style.display = "block";
    document.getElementById("costOthersDiv").style.display = "block";
  } else {
    document.getElementById("efficacyOthersDiv").style.display = "none";
    document.getElementById("riskOthersDiv").style.display = "none";
    document.getElementById("costOthersDiv").style.display = "none";
  }
}

/***************************************************************************
 * EXPORT TO PDF FUNCTION
 ***************************************************************************/
function exportToPDF() {
  if (savedResults.length < 1) {
    alert("No scenarios saved to export.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let currentY = margin;

  doc.setFontSize(16);
  doc.text("T2DM Equity-Efficiency Decision Aid Tool - Scenarios Comparison", pageWidth / 2, currentY, { align: 'center' });
  currentY += 10;

  savedResults.forEach((scenario, index) => {
    // Check if adding this scenario exceeds the page height
    if (currentY + 80 > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFontSize(14);
    doc.text(`${scenario.name}: ${scenario.experiment}`, margin, currentY);
    currentY += 7;

    doc.setFontSize(12);
    doc.text(`Efficacy: ${scenario.efficacy}%`, margin, currentY);
    currentY += 5;
    doc.text(`Risk: ${scenario.risk}%`, margin, currentY);
    currentY += 5;
    doc.text(`Monthly Out-of-Pocket Cost: $${scenario.cost}`, margin, currentY);
    currentY += 5;
    if (scenario.efficacyOthers !== 'N/A') {
      doc.text(`Efficacy Others: ${scenario.efficacyOthers}%`, margin, currentY);
      currentY += 5;
    }
    if (scenario.riskOthers !== 'N/A') {
      doc.text(`Risk Others: ${scenario.riskOthers}%`, margin, currentY);
      currentY += 5;
    }
    if (scenario.costOthers !== 'N/A') {
      doc.text(`Monthly Out-of-Pocket Cost Others: $${scenario.costOthers}`, margin, currentY);
      currentY += 5;
    }
    doc.text(`Health Plan Uptake Probability: ${scenario.uptake}%`, margin, currentY);
    currentY += 10;
  });

  doc.save("Scenarios_Comparison.pdf");
}

/***************************************************************************
 * WTP COMPARISON ACROSS EXPERIMENTS
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

  // Aggregate WTP for Risk attributes per experiment
  const riskAttributes = ["Risk 8%", "Risk 16%", "Risk 30%", "Risk Others 8%", "Risk Others 16%", "Risk Others 30%"];
  const wtpPerExperiment = {
    '1': [],
    '2': [],
    '3': []
  };

  savedResults.forEach(scenario => {
    const experiment = scenario.experiment.split(' ')[1];
    if (wtpData[experiment]) {
      wtpData[experiment].forEach(item => {
        if (riskAttributes.includes(item.attribute)) {
          wtpPerExperiment[experiment].push(item.wtp);
        }
      });
    }
  });

  // Calculate average WTP for Risk attributes per experiment
  const avgWTP = {};
  for (let exp in wtpPerExperiment) {
    const data = wtpPerExperiment[exp];
    if (data.length > 0) {
      avgWTP[`Experiment ${exp}`] = (data.reduce((a, b) => a + b, 0) / data.length).toFixed(2);
    }
  }

  const labels = Object.keys(avgWTP);
  const values = Object.values(avgWTP);
  const colors = ['rgba(39,174,96,0.6)', 'rgba(241,196,15,0.6)', 'rgba(231,76,60,0.6)'];

  wtpComparisonChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: "Average WTP for Risk Attributes (USD)",
        data: values,
        backgroundColor: colors,
        borderColor: colors.map(color => color.replace('0.6', '1')),
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
          text: 'Average WTP for Risk Attributes Across Experiments',
          font: { size: 16 }
        }
      }
    }
  });

  // Render Conclusion
  renderWTPConclusion(avgWTP);
}

function renderWTPConclusion(avgWTP) {
  const conclusion = document.getElementById("wtpConclusion");
  const exp1 = avgWTP["Experiment 1"] || "N/A";
  const exp2 = avgWTP["Experiment 2"] || "N/A";
  const exp3 = avgWTP["Experiment 3"] || "N/A";

  conclusion.innerHTML = `
    <strong>Conclusion:</strong> Across experiments, risk aversion progressively declined when equity considerations were introduced. In a self-focused setup (Experiment 1), respondents showed strong risk aversion with an average WTP of $${exp1}. This aversion decreased notably as the experiments incorporated equity considerations, particularly in Experiment 2, where health outcomes were equal between respondents (“self”) and others with poorer health conditions, resulting in an average WTP of $${exp2}. This reduction in risk aversion suggests a greater tolerance for potential risk of side effects when the health needs of others with poorer health conditions are also considered, which aligns with studies that emphasize broader ethical considerations in decision-making under risk (Arrieta et al., 2017). However, the reduction in risk aversion was less pronounced moving from Experiment 1 to Experiment 3, where health outcomes were unequal between the “self” and “others”, with an average WTP of $${exp3}. This suggests that disparities in health outcomes may reduce respondents’ willingness to accept personal risks.
  `;
}

/***************************************************************************
 * Scenario Comparison (Display Saved Scenarios and WTP Comparison)
 * This functionality is handled within the Scenarios Tab and WTP Comparison Chart
 ***************************************************************************/

/***************************************************************************
 * Scenario Comparison is integrated within the Scenarios Tab using the WTP Comparison Chart
 * The conclusion is displayed below the chart
 ***************************************************************************/

/***************************************************************************
 * HELPER FUNCTIONS
 ***************************************************************************/
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/***************************************************************************
 * HELPER: Predict and Render Uptake Probability
 ***************************************************************************/
function renderProbChart() {
  predictUptake();
}
