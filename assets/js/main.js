/**
 * Explore Options - Main Component
 * Main controller that coordinates the Tabs, EMI, and Extra Payment managers
 */
class ExploreOptions {
  constructor(config = {}) {
    // Store container reference
    this.container = document.querySelector(config.container || '#explore-options');
    this.onScenarioChange = config.onScenarioChange || function() {};
    
    // Initialize loan data with defaults or provided values
    this.loanData = config.loanData || {
      amount: 10000000,        // Principal amount (₹1 crore)
      currentRate: 9,          // Current interest rate (9%)
      newRate: 8.1,            // New interest rate (8.1%)
      currentEMI: 89973,       // Current EMI amount
      tenure: 240              // Loan tenure in months (20 years)
    };
    
    // Create calculation helper - centralized calculation functions
    this.calculationHelper = new CalculationHelper();
    
    // Calculate the new EMI if not provided
    if (!this.loanData.newEMI) {
      this.loanData.newEMI = this.calculationHelper.calculateEMI(
        this.loanData.amount,
        this.loanData.newRate,
        this.loanData.tenure
      );
    }
    
    // Initialize managers with shared loan data
    this.initManagers();
    
    // Initialize Same Tenure tab data
    this.initSameTenureTab();
  }
  
  /**
   * Initialize tab, EMI, and extra payment managers
   */
  initManagers() {
    // Create tab manager
    this.tabManager = new TabManager({
      container: this.container,
      onTabChange: (tabId) => this.handleTabChange(tabId)
    });
    
    // Create EMI manager
    this.emiManager = new EMIManager({
      container: this.container,
      loanData: this.loanData,
      calculationHelper: this.calculationHelper
    });
    
    // Create extra payment manager
    this.extraPaymentManager = new ExtraPaymentManager({
      container: this.container,
      loanData: this.loanData,
      calculationHelper: this.calculationHelper
    });
  }
  
  /**
   * Initialize Same Tenure tab with calculated values
   */
  initSameTenureTab() {
    // Get DOM elements
    const newEMIElement = this.container.querySelector('#same-tenure .metric:nth-child(1) .metric-value');
    const monthlySavingElement = this.container.querySelector('#same-tenure .metric:nth-child(2) .metric-value');
    const interestSavingElement = this.container.querySelector('#same-tenure .metric-row:nth-child(2) .metric-value');
    
    if (!newEMIElement || !monthlySavingElement || !interestSavingElement) return;
    
    // Calculate values
    const monthlySaving = this.loanData.currentEMI - this.loanData.newEMI;
    const totalInterestSaving = monthlySaving * this.loanData.tenure;
    
    // Update UI
    newEMIElement.textContent = `₹${this.calculationHelper.formatCurrency(this.loanData.newEMI)}`;
    monthlySavingElement.textContent = `₹${this.calculationHelper.formatCurrency(monthlySaving)}`;
    interestSavingElement.textContent = `₹${this.calculationHelper.formatCurrency(totalInterestSaving)}`;
    
    // Update subtexts
    const emiSubtext = this.container.querySelector('#same-tenure .metric:nth-child(1) .metric-subtext');
    const savingSubtext = this.container.querySelector('#same-tenure .metric:nth-child(2) .metric-subtext');
    
    if (emiSubtext) {
      emiSubtext.textContent = `was ₹${this.calculationHelper.formatCurrency(this.loanData.currentEMI)}`;
    }
    
    if (savingSubtext) {
      const savingPercent = Math.round((monthlySaving / this.loanData.currentEMI) * 100);
      savingSubtext.textContent = `${savingPercent}% less`;
    }
  }
  
  /**
   * Handle tab changes and trigger appropriate updates
   * @param {string} tabId - The ID of the selected tab
   */
  handleTabChange(tabId) {
    let scenarioData = {
      type: tabId,
      loanData: this.loanData
    };
    
    // Get scenario-specific data
    switch (tabId) {
      case 'same-tenure':
        const monthlySaving = this.loanData.currentEMI - this.loanData.newEMI;
        scenarioData.savings = {
          monthlyEMI: monthlySaving,
          totalInterest: monthlySaving * this.loanData.tenure
        };
        break;
        
      case 'same-emi':
        scenarioData.emiScenario = this.emiManager.getCurrentScenario();
        break;
        
      case 'extra-payment':
        scenarioData.extraPaymentScenario = this.extraPaymentManager.getCurrentScenario();
        break;
    }
    
    // Call the callback with scenario data
    if (typeof this.onScenarioChange === 'function') {
      this.onScenarioChange(scenarioData);
    }
  }
  
  /**
   * Update loan data and refresh all calculations
   * @param {Object} newLoanData - New loan data from API
   */
  updateLoanData(newLoanData) {
    // Update loan data
    this.loanData = { ...this.loanData, ...newLoanData };
    
    // Calculate the new EMI if not provided
    if (!this.loanData.newEMI) {
      this.loanData.newEMI = this.calculationHelper.calculateEMI(
        this.loanData.amount,
        this.loanData.newRate,
        this.loanData.tenure
      );
    }
    
    // Update all managers
    this.emiManager.updateLoanData(this.loanData);
    this.extraPaymentManager.updateLoanData(this.loanData);
    
    // Update Same Tenure tab
    this.initSameTenureTab();
    
    // Refresh active tab data
    this.handleTabChange(this.tabManager.getActiveTab());
  }
}