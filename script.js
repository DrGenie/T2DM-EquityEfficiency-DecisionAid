/****************************************************************************
 * script.js
 * 1) Tab switching
 * 2) Range slider label updates
 * 3) Main DCE coefficients for Experiments 1, 2, 3 with updated cost coefficients
 * 4) WTP data for all features with error bars (p-values, SE)
 * 5) Health Plan Uptake Probability bar chart
 * 6) Scenario saving & PDF export (session-based)
 * 7) Cost-benefit analysis based on literature-reviewed costs
 * 8) Dynamic attribute display based on experiment selection
 * 9) WTP comparison across experiments focusing on risk attributes
 * 10) Enforce selection of all attributes with specific validation messages
 * 11) Remove Filter by Uptake Probability
 * 12) Tooltip enhancements
 * 13) Customized Conclusion in WTP Comparison
 * Authors: Surachat Ngorsuraches (Auburn University, USA), Mesfin Genie (The University of Newcastle, Australia)
 *****************************************************************************/

/** Global variable to store current uptake probability */
let currentUptakeProbability = 0;

/** On page load, default to introduction tab and initialize */
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
    allBtns[j].setAttribute("aria-selected", "false");
  }
  document.getElementById(tabId).style.display = "block";
  btn.classList.add("active");
  btn.setAttribute("aria-selected", "true");

  // Render charts if navigating to respective tabs
  if (tabId === 'wtpTab') {
    // Do not auto-render WTP charts; require user action
  }
  if (tabId === 'costsTab') {
    renderCostsBenefits();
  }
}

/** Range slider label updates */
function updateCostDisplay(val) {
  document.getElementById("costValue").textContent = `$${val}`;
}

function updateCostOthersDisplay(val) {
  document.getElementById("costOthersValue").textContent = `$${val}`;
}

function updateEfficacyDisplay(val) {
  document.getElementById("efficacyValue").textContent = `${val}%`;
}

function updateEfficacyOthersDisplay(val) {
  document.getElementById("efficacyOthersValue").textContent = `${val}%`;
}

function updateRiskDisplay(val) {
  document.getElementById("riskValue").textContent = `${val}%`;
}

function updateRiskOthersDisplay(val) {
  document.getElementById("riskOthersValue").textContent = `${val}%`;
}

/***************************************************************************
 * MAIN DCE COEFFICIENTS
 * Updated cost coefficients as per instructions
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
    cost: -0.00123, // Updated
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
    cost: -0.00140, // Updated
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
    cost: -0.0007,       // Updated
    costOthers: -0.00041, // Updated
    ASC_sd: 1.033
  }
};

/***************************************************************************
 * COST COMPONENTS BASED ON TARGETED LITERATURE REVIEW IN THE USA
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
 * Updated WTP computations based on new cost coefficients
 * Corrected "Risk Others" to divide by coefficients['3'].cost instead of costOthers
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
    // Self Attributes
    { attribute: "Risk 8% (Self)", wtp: coefficients['3'].risk_8 / Math.abs(coefficients['3'].cost), pVal: 0.200, se: 0.084 / Math.abs(coefficients['3'].cost) },
    { attribute: "Risk 16% (Self)", wtp: coefficients['3'].risk_16 / Math.abs(coefficients['3'].cost), pVal: 0.013, se: 0.088 / Math.abs(coefficients['3'].cost) },
    { attribute: "Risk 30% (Self)", wtp: coefficients['3'].risk_30 / Math.abs(coefficients['3'].cost), pVal: 0.000, se: 0.085 / Math.abs(coefficients['3'].cost) },
    // Others Attributes
    { attribute: "Risk 8% (Others)", wtp: coefficients['3'].riskOthers_8 / Math.abs(coefficients['3'].cost), pVal: 0.190, se: 0.085 / Math.abs(coefficients['3'].cost) },
    { attribute: "Risk 16% (Others)", wtp: coefficients['3'].riskOthers_16 / Math.abs(coefficients['3'].cost), pVal: 0.227, se: 0.085 / Math.abs(coefficients['3'].cost) },
    { attribute: "Risk 30% (Others)", wtp: coefficients['3'].riskOthers_30 / Math.abs(coefficients['3'].cost), pVal: 0.017, se: 0.083 / Math.abs(coefficients['3'].cost) }
  ]
};

/***************************************************************************
 * HEALTH PLAN UPTAKE PROBABILITY CALCULATION
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

    // Retain costOthers for other calculations
    utility += coefs.costOthers * scenario.costOthers;
  }

  // Compute probabilities using Error-Component Logit
  const exp_utility = Math.exp(utility);
  const exp_optout = Math.exp(coefs.ASC_optout);
  const uptakeProbability = exp_utility / (exp_utility + exp_optout) * 100;

  // Store the uptake probability globally
  currentUptakeProbability = uptakeProbability;

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
  let costOthers = "N/A"; // default

  if (experiment === '3') {
    efficacyOthers = document.getElementById("efficacyOthers").value;
    riskOthers = document.getElementById("riskOthers").value;
    costOthers = parseInt(document.getElementById("costOthers").value, 10);
  }

  // Basic validation for all experiments
  let missingFields = [];
  if (!efficacy) missingFields.push("Efficacy");
  if (!risk) missingFields.push("Risk");
  if (isNaN(cost) || cost < 0 || cost > 1000) missingFields.push("Cost");

  // Additional validation for Experiment 3
  if (experiment === '3') {
    if (!efficacyOthers) missingFields.push("Efficacy Others");
    if (!riskOthers) missingFields.push("Risk Others");
    if (isNaN(costOthers) || costOthers < 0 || costOthers > 1000) missingFields.push("Cost Others");
  }

  if (missingFields.length > 0) {
    alert(`Please select the following attributes: ${missingFields.join(", ")}.`);
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
 * DISPLAY WTP CHART
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
  const colors = data.map(item => item.wtp >=0 ? 'rgba(52, 152, 219, 0.6)' : 'rgba(231,76,60,0.6)');

  const dataConfig = {
    labels: labels,
    datasets: [{
      label: "WTP (USD)",
      data: values,
      backgroundColor: colors,
      borderColor: values.map(v => v >=0 ? 'rgba(52, 152, 219, 1)' : 'rgba(231,76,60,1)'),
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
          text: `Willingness to Pay (USD) for Risk Attributes - Experiment ${experiment}`,
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

  // Render Conclusion with dynamic WTP values
  renderWTPConclusion(experiment);
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
  const uptake = currentUptakeProbability;
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
        backgroundColor: 'rgba(52, 152, 219, 0.6)',
        borderColor: 'rgba(52, 152, 219, 1)',
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
  const uptake = currentUptakeProbability;

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
  // Removed localStorage to prevent persistence across sessions

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
 * LOAD SAVED RESULTS FROM SESSION STORAGE
 ***************************************************************************/
function loadSavedResults() {
  // Removed localStorage loading to prevent persistence across sessions
  savedResults = [];
  const tableBody = document.querySelector("#scenarioTable tbody");
  tableBody.innerHTML = ''; // Clear any existing rows
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
 * FILTER FUNCTIONALITY FOR SCENARIOS
 * Removed Filter by Uptake Probability
 ***************************************************************************/
function filterScenarios() {
  const experimentFilter = document.getElementById("filterExperiment").value;

  const tableBody = document.querySelector("#scenarioTable tbody");
  const rows = tableBody.getElementsByTagName("tr");

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName("td");
    const experiment = cells[1].textContent;

    let display = true;

    if (experimentFilter !== "all" && experiment !== experimentFilter) {
      display = false;
    }

    rows[i].style.display = display ? "" : "none";
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
 * WTP COMPARISON ACROSS EXPERIMENTS FOCUSING ON RISK ATTRIBUTES
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

  // Initialize data storage
  const riskAttributes = ["Risk 8%", "Risk 16%", "Risk 30%"];
  const riskAttributesOthers = ["Risk 8% (Others)", "Risk 16% (Others)", "Risk 30% (Others)"];

  // Calculate average WTP for risk attributes across experiments
  const avgWTP = {
    "Experiment 1": { "Risk 8%": [], "Risk 16%": [], "Risk 30%": [] },
    "Experiment 2": { "Risk 8%": [], "Risk 16%": [], "Risk 30%": [] },
    "Experiment 3": { "Risk 8% (Self)": [], "Risk 16% (Self)": [], "Risk 30% (Self)": [], "Risk 8% (Others)": [], "Risk 16% (Others)": [], "Risk 30% (Others)": [] }
  };

  savedResults.forEach(scenario => {
    const experiment = scenario.experiment;
    if (!avgWTP[experiment]) return;

    // Find WTP data for the experiment
    const experimentNumber = experiment.split(' ')[1];
    const data = wtpData[experimentNumber];
    if (!data) return;

    data.forEach(item => {
      if (item.attribute.startsWith("Risk ") && !item.attribute.includes("(Others)")) {
        avgWTP[experiment][item.attribute].push(item.wtp);
      }
      if (item.attribute.startsWith("Risk ") && item.attribute.includes("(Others)")) {
        avgWTP[experiment][item.attribute].push(item.wtp);
      }
    });
  });

  // Compute average WTP
  const computedAvgWTP = {
    "Experiment 1": {
      "Risk 8%": avgWTP["Experiment 1"]["Risk 8%"].length > 0 ? (avgWTP["Experiment 1"]["Risk 8%"].reduce((a, b) => a + b, 0) / avgWTP["Experiment 1"]["Risk 8%"].length).toFixed(2) : 0,
      "Risk 16%": avgWTP["Experiment 1"]["Risk 16%"].length > 0 ? (avgWTP["Experiment 1"]["Risk 16%"].reduce((a, b) => a + b, 0) / avgWTP["Experiment 1"]["Risk 16%"].length).toFixed(2) : 0,
      "Risk 30%": avgWTP["Experiment 1"]["Risk 30%"].length > 0 ? (avgWTP["Experiment 1"]["Risk 30%"].reduce((a, b) => a + b, 0) / avgWTP["Experiment 1"]["Risk 30%"].length).toFixed(2) : 0
    },
    "Experiment 2": {
      "Risk 8%": avgWTP["Experiment 2"]["Risk 8%"].length > 0 ? (avgWTP["Experiment 2"]["Risk 8%"].reduce((a, b) => a + b, 0) / avgWTP["Experiment 2"]["Risk 8%"].length).toFixed(2) : 0,
      "Risk 16%": avgWTP["Experiment 2"]["Risk 16%"].length > 0 ? (avgWTP["Experiment 2"]["Risk 16%"].reduce((a, b) => a + b, 0) / avgWTP["Experiment 2"]["Risk 16%"].length).toFixed(2) : 0,
      "Risk 30%": avgWTP["Experiment 2"]["Risk 30%"].length > 0 ? (avgWTP["Experiment 2"]["Risk 30%"].reduce((a, b) => a + b, 0) / avgWTP["Experiment 2"]["Risk 30%"].length).toFixed(2) : 0
    },
    "Experiment 3": {
      "Risk 8% (Self)": avgWTP["Experiment 3"]["Risk 8% (Self)"].length > 0 ? (avgWTP["Experiment 3"]["Risk 8% (Self)"].reduce((a, b) => a + b, 0) / avgWTP["Experiment 3"]["Risk 8% (Self)"].length).toFixed(2) : 0,
      "Risk 16% (Self)": avgWTP["Experiment 3"]["Risk 16% (Self)"].length > 0 ? (avgWTP["Experiment 3"]["Risk 16% (Self)"].reduce((a, b) => a + b, 0) / avgWTP["Experiment 3"]["Risk 16% (Self)"].length).toFixed(2) : 0,
      "Risk 30% (Self)": avgWTP["Experiment 3"]["Risk 30% (Self)"].length > 0 ? (avgWTP["Experiment 3"]["Risk 30% (Self)"].reduce((a, b) => a + b, 0) / avgWTP["Experiment 3"]["Risk 30% (Self)"].length).toFixed(2) : 0,
      "Risk 8% (Others)": avgWTP["Experiment 3"]["Risk 8% (Others)"].length > 0 ? (avgWTP["Experiment 3"]["Risk 8% (Others)"].reduce((a, b) => a + b, 0) / avgWTP["Experiment 3"]["Risk 8% (Others)"].length).toFixed(2) : 0,
      "Risk 16% (Others)": avgWTP["Experiment 3"]["Risk 16% (Others)"].length > 0 ? (avgWTP["Experiment 3"]["Risk 16% (Others)"].reduce((a, b) => a + b, 0) / avgWTP["Experiment 3"]["Risk 16% (Others)"].length).toFixed(2) : 0,
      "Risk 30% (Others)": avgWTP["Experiment 3"]["Risk 30% (Others)"].length > 0 ? (avgWTP["Experiment 3"]["Risk 30% (Others)"].reduce((a, b) => a + b, 0) / avgWTP["Experiment 3"]["Risk 30% (Others)"].length).toFixed(2) : 0
    }
  };

  // Prepare chart data
  const labels = ["Risk 8%", "Risk 16%", "Risk 30%"];
  const datasets = [];

  // Experiment 1
  datasets.push({
    label: "Experiment 1",
    data: [
      parseFloat(computedAvgWTP["Experiment 1"]["Risk 8%"]),
      parseFloat(computedAvgWTP["Experiment 1"]["Risk 16%"]),
      parseFloat(computedAvgWTP["Experiment 1"]["Risk 30%"])
    ],
    backgroundColor: 'rgba(52, 152, 219, 0.6)',
    borderColor: 'rgba(52, 152, 219, 1)',
    borderWidth: 1
  });

  // Experiment 2
  datasets.push({
    label: "Experiment 2",
    data: [
      parseFloat(computedAvgWTP["Experiment 2"]["Risk 8%"]),
      parseFloat(computedAvgWTP["Experiment 2"]["Risk 16%"]),
      parseFloat(computedAvgWTP["Experiment 2"]["Risk 30%"])
    ],
    backgroundColor: 'rgba(46, 204, 113, 0.6)',
    borderColor: 'rgba(46, 204, 113, 1)',
    borderWidth: 1
  });

  // Experiment 3
  // To average Self and Others, we'll average their WTPs
  const avgRisk8 = (parseFloat(computedAvgWTP["Experiment 3"]["Risk 8% (Self)"]) + parseFloat(computedAvgWTP["Experiment 3"]["Risk 8% (Others)"])) / 2;
  const avgRisk16 = (parseFloat(computedAvgWTP["Experiment 3"]["Risk 16% (Self)"]) + parseFloat(computedAvgWTP["Experiment 3"]["Risk 16% (Others)"])) / 2;
  const avgRisk30 = (parseFloat(computedAvgWTP["Experiment 3"]["Risk 30% (Self)"]) + parseFloat(computedAvgWTP["Experiment 3"]["Risk 30% (Others)"])) / 2;

  datasets.push({
    label: "Experiment 3",
    data: [
      isNaN(avgRisk8) ? 0 : avgRisk8.toFixed(2),
      isNaN(avgRisk16) ? 0 : avgRisk16.toFixed(2),
      isNaN(avgRisk30) ? 0 : avgRisk30.toFixed(2)
    ],
    backgroundColor: 'rgba(231, 76, 60, 0.6)',
    borderColor: 'rgba(231, 76, 60, 1)',
    borderWidth: 1
  });

  wtpComparisonChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: datasets
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
          text: 'Average WTP for Risk Attributes Across Experiments',
          font: { size: 16 }
        }
      }
    }
  });

  // Render Conclusion with dynamic average WTP values
  renderWTPComparisonConclusion(computedAvgWTP);
}

/***************************************************************************
 * HELPER FUNCTION TO GET PROFESSIONAL COLORS
 ***************************************************************************/
function getColor(index) {
  const colors = [
    'rgba(52, 152, 219, 0.6)',  // Blue
    'rgba(46, 204, 113, 0.6)',  // Green
    'rgba(231, 76, 60, 0.6)',   // Red
    'rgba(243, 156, 18, 0.6)'   // Orange
  ];
  return colors[index % colors.length];
}

/***************************************************************************
 * RENDER WTP COMPARISON CONCLUSION
 ***************************************************************************/
function renderWTPComparisonConclusion(computedAvgWTP) {
  const conclusion = document.getElementById("wtpComparisonConclusion");
  let conclusionText = `<strong>Conclusion:</strong> 
  <br/><br/>
  Across experiments, risk aversion progressively declined when equity considerations were introduced. In a self-focused setup, respondents showed strong risk aversion. This aversion decreased notably when they were asked to consider equal health outcomes between themselves and others with poorer health conditions, suggesting a greater tolerance for the risk of side effects when the health needs of others are also considered. However, the reduction in risk aversion was less pronounced when respondents considered unequal health outcomes between themselves and others, suggesting that disparities in health outcomes might reduce respondents’ willingness to accept personal risks.
  
  <br/><br/>
  <strong>Average WTP for Risk Attributes:</strong>
  <ul>
    <li><strong>Experiment 1:</strong>
      <ul>
        <li>Risk 8%: $${computedAvgWTP["Experiment 1"]["Risk 8%"]}</li>
        <li>Risk 16%: $${computedAvgWTP["Experiment 1"]["Risk 16%"]}</li>
        <li>Risk 30%: $${computedAvgWTP["Experiment 1"]["Risk 30%"]}</li>
      </ul>
    </li>
    <li><strong>Experiment 2:</strong>
      <ul>
        <li>Risk 8%: $${computedAvgWTP["Experiment 2"]["Risk 8%"]}</li>
        <li>Risk 16%: $${computedAvgWTP["Experiment 2"]["Risk 16%"]}</li>
        <li>Risk 30%: $${computedAvgWTP["Experiment 2"]["Risk 30%"]}</li>
      </ul>
    </li>
    <li><strong>Experiment 3:</strong>
      <ul>
        <li>Risk 8%: $${computedAvgWTP["Experiment 3"]["Risk 8%"]}</li>
        <li>Risk 16%: $${computedAvgWTP["Experiment 3"]["Risk 16%"]}</li>
        <li>Risk 30%: $${computedAvgWTP["Experiment 3"]["Risk 30%"]}</li>
      </ul>
    </li>
  </ul>
  `;

  conclusion.innerHTML = conclusionText;
}

/***************************************************************************
 * INITIALIZE TOOLTIP FUNCTIONALITY
 ***************************************************************************/
document.addEventListener("DOMContentLoaded", function() {
  // Handle tooltip display on hover and focus for accessibility
  const infoIcons = document.querySelectorAll('.attribute-icon svg');
  infoIcons.forEach(icon => {
    icon.addEventListener('mouseover', function() {
      const tooltip = this.parentElement.querySelector('.tooltip');
      if (tooltip) {
        tooltip.style.visibility = 'visible';
        tooltip.style.opacity = '1';
      }
    });
    icon.addEventListener('mouseout', function() {
      const tooltip = this.parentElement.querySelector('.tooltip');
      if (tooltip) {
        tooltip.style.visibility = 'hidden';
        tooltip.style.opacity = '0';
      }
    });
    icon.addEventListener('focus', function() {
      const tooltip = this.parentElement.querySelector('.tooltip');
      if (tooltip) {
        tooltip.style.visibility = 'visible';
        tooltip.style.opacity = '1';
      }
    });
    icon.addEventListener('blur', function() {
      const tooltip = this.parentElement.querySelector('.tooltip');
      if (tooltip) {
        tooltip.style.visibility = 'hidden';
        tooltip.style.opacity = '0';
      }
    });
  });
});

/***************************************************************************
 * DEFINE RENDER PROBABILITY CHART FUNCTION
 ***************************************************************************/
function renderProbChart() {
  predictUptake();
}
