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
  initializeManagers() {
    const containerElement = document.querySelector(this.config.container);
    
    // Initialize calculation helper
    this.calculationHelper = new CalculationHelper();
    
    // Initialize tab manager
    this.tabManager = new TabManager({
      container: containerElement,
      onTabChange: (tabId) => this.handleTabChange(tabId)
    });
    
    // Calculate new EMI before initializing managers
    const newEMI = this.calculationHelper.calculateEMI(
      this.config.loanData.amount,
      this.config.loanData.newRate,
      this.config.loanData.tenure
    );
    
    // Add newEMI to loanData
    this.config.loanData.newEMI = newEMI;
    
    // Initialize EMI manager
    this.emiManager = new EMIManager({
      container: containerElement,
      loanData: this.config.loanData,
      calculationHelper: this.calculationHelper
    });
    
    // Initialize extra payment manager
    this.extraPaymentManager = new ExtraPaymentManager({
      container: containerElement,
      loanData: this.config.loanData,
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
  
  /**
   * Update Same EMI tab calculations
   * Method added for direct interaction with UI controls
   * @param {number} emiAmount - The new EMI amount
   */
  updateSameEmiCalculations(emiAmount) {
    // Calculate new tenure at new rate with specified EMI
    const newTenure = this.calculationHelper.calculateTenure(
      this.loanData.amount, 
      this.loanData.newRate, 
      emiAmount
    );
    
    // Calculate months saved
    const monthsSaved = Math.max(0, this.loanData.tenure - newTenure);
    
    // Calculate interest saved
    const originalTotalInterest = this.calculationHelper.calculateTotalInterest(
      this.loanData.amount,
      this.loanData.currentEMI,
      this.loanData.tenure
    );
    
    const newTotalInterest = this.calculationHelper.calculateTotalInterest(
      this.loanData.amount,
      emiAmount,
      newTenure
    );
    
    const interestSaved = Math.max(0, originalTotalInterest - newTotalInterest);
    
    // Update UI
    const newTenureElement = document.querySelector('#same-emi .metric:nth-child(1) .metric-value');
    const timeSavedElement = document.querySelector('#same-emi .metric:nth-child(2) .metric-value');
    const interestSavedElement = document.querySelector('#same-emi .metric-row:nth-child(3) .metric-value');
    
    if (newTenureElement) newTenureElement.textContent = `${newTenure} months`;
    if (timeSavedElement) timeSavedElement.textContent = `${monthsSaved} months`;
    if (interestSavedElement) interestSavedElement.textContent = `₹${this.calculationHelper.formatCurrency(Math.round(interestSaved))}`;
    
    // Update subtexts
    const timeSubtext = document.querySelector('#same-emi .metric:nth-child(2) .metric-subtext');
    if (timeSubtext) {
      if (monthsSaved === 0) {
        timeSubtext.textContent = 'adjust EMI to see impact';
      } else {
        const percentSaved = Math.round((monthsSaved / this.loanData.tenure) * 100);
        timeSubtext.textContent = `${percentSaved}% faster payoff`;
      }
    }
    
    return {
      emi: emiAmount,
      newTenure: newTenure,
      originalTenure: this.loanData.tenure,
      monthsSaved: monthsSaved,
      interestSaved: interestSaved
    };
  }
  
  /**
   * Update Extra Payment tab calculations
   * Method added for direct interaction with UI controls
   * @param {number} extraAmount - The extra payment amount
   * @param {string} frequency - Payment frequency (monthly, quarterly, etc.)
   */
  updateExtraPaymentCalculations(extraAmount, frequency) {
    // Get current frequency if not provided
    if (!frequency) {
      const frequencySelect = document.getElementById('frequencySelect');
      frequency = frequencySelect ? frequencySelect.value : 'monthly';
    }
    
    // Calculate frequency factor
    let frequencyFactor = 1;
    let frequencyText = '';
    
    switch(frequency) {
      case 'monthly': frequencyFactor = 1; frequencyText = 'monthly'; break;
      case 'quarterly': frequencyFactor = 1/3; frequencyText = 'quarterly'; break;
      case 'half-yearly': frequencyFactor = 1/6; frequencyText = 'half-yearly'; break;
      case 'yearly': frequencyFactor = 1/12; frequencyText = 'yearly'; break;
    }
    
    // Calculate new tenure
    const baselineTenure = this.calculationHelper.calculateTenureWithExtraPayment(
      this.loanData.amount, 
      this.loanData.newRate, 
      this.loanData.newEMI,
      0, 
      1
    );
    
    const newTenure = this.calculationHelper.calculateTenureWithExtraPayment(
      this.loanData.amount, 
      this.loanData.newRate, 
      this.loanData.newEMI,
      extraAmount, 
      frequencyFactor
    );
    
    // Calculate interest savings
    const baselineInterest = (this.loanData.newEMI * baselineTenure) - this.loanData.amount;
    const effectiveExtraPayment = extraAmount * frequencyFactor;
    const totalPaid = (this.loanData.newEMI * newTenure) + (effectiveExtraPayment * newTenure);
    const newTotalInterest = totalPaid - this.loanData.amount;
    const interestSaved = Math.max(0, baselineInterest - newTotalInterest);
    
    // Calculate months saved
    const monthsSaved = Math.max(0, baselineTenure - newTenure);
    
    // Update UI
    const newTenureElement = document.querySelector('#extra-payment .metric:nth-child(1) .metric-value');
    const interestSavedElement = document.querySelector('#extra-payment .metric:nth-child(2) .metric-value');
    
    if (newTenureElement) newTenureElement.textContent = `${newTenure} months`;
    if (interestSavedElement) interestSavedElement.textContent = `₹${this.calculationHelper.formatCurrency(Math.round(interestSaved))}`;
    
    // Update subtexts
    const tenureSubtext = document.querySelector('#extra-payment .metric:nth-child(1) .metric-subtext');
    if (tenureSubtext) {
      if (monthsSaved > 0) {
        tenureSubtext.textContent = `save ${monthsSaved} months`;
      } else {
        tenureSubtext.textContent = `same as without extra`;
      }
    }
    
    const savingsSubtext = document.querySelector('#extra-payment .metric:nth-child(2) .metric-subtext');
    if (savingsSubtext) {
      savingsSubtext.textContent = `with ${frequencyText} extra payments`;
    }
    
    return {
      extraAmount: extraAmount,
      frequency: frequency,
      frequencyFactor: frequencyFactor,
      newTenure: newTenure,
      baselineTenure: baselineTenure,
      monthsSaved: monthsSaved,
      interestSaved: interestSaved
    };
  }
/**
 * Update Same EMI calculations with a new EMI value
 * @param {number} value - The new EMI value
 */
updateSameEmiCalculations(value) {
  this.emiManager.setEMI(value);
  this.handleTabChange('same-emi');
}

/**
 * Update Extra Payment calculations with new values
 * @param {number} value - The extra payment amount
 * @param {string} frequency - The payment frequency (optional)
 */
updateExtraPaymentCalculations(value, frequency) {
  this.extraPaymentManager.setExtraPayment(value);
  if (frequency) {
    this.extraPaymentManager.setFrequency(frequency);
  }
  this.handleTabChange('extra-payment');
}

}