/**
 * Explore Options - Main Component
 * A standalone component for exploring loan scenarios
 */
class ExploreOptions {
  constructor(config = {}) {
    this.config = {
      container: config.container || '#explore-options',
      theme: config.theme || 'dark',
      onScenarioChange: config.onScenarioChange || function() {},
      loanData: config.loanData || {
        amount: 10000000,
        currentRate: 9,
        newRate: 8.1,
        currentEMI: 89973,
        tenure: 240 // months
      }
    };
    
    // Initialize managers
    this.initializeManagers();
    
    // Apply theme
    this.applyTheme();
    
    // Set up callbacks
    this.setupCallbacks();
  }
  
  /**
   * Initialize the tab, EMI and extra payment managers
   */
  initializeManagers() {
    // Initialize tab manager
    this.tabManager = new TabManager({
      onTabChange: (tabId) => this.handleTabChange(tabId)
    });
    
    // Initialize EMI manager
    this.emiManager = new EMIManager({
      loanData: this.config.loanData
    });
    
    // Initialize extra payment manager
    this.extraPaymentManager = new ExtraPaymentManager({
      loanData: this.config.loanData
    });
  }
  
  /**
   * Apply the selected theme
   */
  applyTheme() {
    const container = document.querySelector(this.config.container);
    if (container) {
      container.classList.add(`theme-${this.config.theme}`);
    }
  }
  
  /**
   * Set up callbacks for scenario changes
   */
  setupCallbacks() {
    this.handleTabChange(this.tabManager.getActiveTab());
  }
  
  /**
   * Handle tab change events
   * @param {string} tabId - The ID of the selected tab
   */
  handleTabChange(tabId) {
    let scenarioData = {
      type: tabId,
      loanData: this.config.loanData
    };
    
    // Get scenario-specific data
    switch (tabId) {
      case 'same-tenure':
        scenarioData.savings = {
          monthlyEMI: this.config.loanData.currentEMI - this.config.loanData.newEMI,
          totalInterest: (this.config.loanData.currentEMI - this.config.loanData.newEMI) * this.config.loanData.tenure
        };
        break;
        
      case 'same-emi':
        scenarioData.emiScenario = this.emiManager.getCurrentScenario();
        break;
        
      case 'extra-payment':
        scenarioData.extraPaymentScenario = this.extraPaymentManager.getCurrentScenario();
        break;
    }
    
    // Call the callback
    if (typeof this.config.onScenarioChange === 'function') {
      this.config.onScenarioChange(scenarioData);
    }
  }
  
  /**
   * Update the loan data
   * @param {Object} loanData - New loan data
   */
  updateLoanData(loanData) {
    this.config.loanData = { ...this.config.loanData, ...loanData };
    
    // Refresh managers with new data
    this.initializeManagers();
    
    // Re-trigger scenario change
    this.handleTabChange(this.tabManager.getActiveTab());
  }
  
  /**
   * Switch to a specific tab
   * @param {string} tabId - The ID of the tab to switch to
   */
  switchTab(tabId) {
    this.tabManager.setActiveTab(tabId);
  }
  
  /**
   * Get the current scenario data
   * @returns {Object} The current scenario data
   */
  getCurrentScenario() {
    const activeTab = this.tabManager.getActiveTab();
    return this.handleTabChange(activeTab);
  }
}

// Make available globally
window.ExploreOptions = ExploreOptions;