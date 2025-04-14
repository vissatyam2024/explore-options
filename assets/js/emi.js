/**
 * EMI Scenario manager for the Explore Options component
 * Handles calculations for keeping same EMI with lower interest rate
 */
class EMIManager {
  constructor(config = {}) {
    this.container = config.container || document;
    this.calculationHelper = config.calculationHelper;
    
    // Store loan data reference - passed from main component
    this.loanData = config.loanData || {
      amount: 10000000,
      currentRate: 9,
      newRate: 8.1,
      currentEMI: 89973,
      newEMI: 84267,
      tenure: 240 // months
    };
    
    // Get DOM elements
    this.emiSlider = this.container.getElementById('emiSlider');
    this.emiValue = this.container.querySelector('#same-emi .slider-value');
    this.emiPresetButtons = this.container.querySelectorAll('#same-emi .preset-button');
    
    // Initialize
    this.initSlider();
    this.initPresetButtons();
    this.updateEMIImpact(); // Initialize calculations with pre-filled values
  }
  
  /**
   * Initialize the EMI slider with loan data
   */
  initSlider() {
    if (!this.emiSlider) return;
    
    // Set slider range based on current EMI - dynamically calculated
    const minEMI = this.loanData.currentEMI;
    const maxEMI = this.loanData.currentEMI * 3; // Up to 3x current EMI
    
    this.emiSlider.min = minEMI;
    this.emiSlider.max = maxEMI;
    this.emiSlider.value = minEMI; // Start with current EMI
    this.emiSlider.step = Math.max(100, Math.round(minEMI * 0.01)); // 1% of EMI as step
    
    // Update slider range labels
    const sliderRange = this.container.querySelector('#same-emi .slider-range');
    if (sliderRange) {
      sliderRange.innerHTML = `
        <span>Current: ₹${this.formatCurrency(minEMI)}</span>
        <span>3x: ₹${this.formatCurrency(maxEMI)}</span>
      `;
    }
    
    // Set initial value display
    if (this.emiValue) {
      this.emiValue.textContent = `₹${this.formatCurrency(minEMI)}`;
    }
    
    // Add event listener
    this.emiSlider.addEventListener('input', () => this.updateEMIImpact());
  }
  
  /**
   * Initialize preset buttons
   */
  initPresetButtons() {
    // Update preset button values based on current EMI - dynamically calculated
    this.emiPresetButtons.forEach(button => {
      const ratio = parseFloat(button.getAttribute('data-ratio') || 1);
      const value = Math.round(this.loanData.currentEMI * ratio);
      button.setAttribute('data-value', value);
      
      // Set button text
      if (ratio === 1) {
        button.textContent = 'Current EMI';
      } else {
        button.textContent = `${ratio}x EMI`;
      }
      
      // Add click handler
      button.addEventListener('click', () => {
        this.emiSlider.value = value;
        this.updateEMIImpact();
      });
    });
  }
  
  /**
   * Calculate loan tenure based on principal, rate and EMI
   * @param {number} principal - Loan amount
   * @param {number} ratePercent - Annual interest rate in percent
   * @param {number} emi - Monthly EMI amount
   * @returns {number} Tenure in months
   */
  calculateTenure(principal, ratePercent, emi) {
    const monthlyRate = ratePercent / (12 * 100);
    // Formula: n = -log(1 - P*r/EMI) / log(1+r)
    // Where n = tenure in months, P = principal, r = monthly rate, EMI = monthly payment
    const numerator = Math.log(1 - ((principal * monthlyRate) / emi));
    const denominator = Math.log(1 + monthlyRate);
    
    // Handle edge cases
    if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
      return this.loanData.tenure; // Return original tenure if calculation fails
    }
    
    return Math.ceil(-numerator / denominator);
  }
  
  /**
   * Calculate total interest paid over loan tenure
   * @param {number} principal - Loan amount
   * @param {number} emi - Monthly EMI amount
   * @param {number} tenureMonths - Loan tenure in months
   * @returns {number} Total interest paid
   */
  calculateTotalInterest(principal, emi, tenureMonths) {
    return (emi * tenureMonths) - principal;
  }
  
  /**
   * Update calculations based on current slider value
   */
  updateEMIImpact() {
    if (!this.emiSlider) return;
    
    const emiAmount = parseInt(this.emiSlider.value);
    
    // Format with commas
    if (this.emiValue) {
      this.emiValue.textContent = `₹${this.formatCurrency(emiAmount)}`;
    }
    
    // Get DOM elements for metrics
    const newTenureElement = document.querySelector('#same-emi .metric:nth-child(1) .metric-value');
    const timeSavedElement = document.querySelector('#same-emi .metric:nth-child(2) .metric-value');
    const interestSavedElement = document.querySelector('#same-emi .metric-row:nth-child(3) .metric-value');
    
    if (!newTenureElement || !timeSavedElement || !interestSavedElement) return;
    
    // 1. Calculate original tenure at original rate
    const originalTenure = this.loanData.tenure;
    
    // 2. Calculate new tenure at new rate with current EMI
    const newTenure = this.calculateTenure(
      this.loanData.amount, 
      this.loanData.newRate, 
      emiAmount
    );
    
    // 3. Calculate months saved
    const monthsSaved = Math.max(0, originalTenure - newTenure);
    
    // 4. Calculate original total interest
    const originalTotalInterest = this.calculateTotalInterest(
      this.loanData.amount,
      this.loanData.currentEMI,
      originalTenure
    );
    
    // 5. Calculate new total interest
    const newTotalInterest = this.calculateTotalInterest(
      this.loanData.amount,
      emiAmount,
      newTenure
    );
    
    // 6. Calculate interest saved
    const interestSaved = Math.max(0, originalTotalInterest - newTotalInterest);
    
    // Update UI elements
    newTenureElement.textContent = `${newTenure} months`;
    timeSavedElement.textContent = `${monthsSaved} months`;
    interestSavedElement.textContent = `₹${this.formatCurrency(Math.round(interestSaved))}`;
    
    // Update subtexts
    const timeSubtext = document.querySelector('#same-emi .metric:nth-child(2) .metric-subtext');
    if (timeSubtext) {
      if (monthsSaved === 0) {
        timeSubtext.textContent = 'adjust EMI to see impact';
      } else {
        const percentSaved = Math.round((monthsSaved / originalTenure) * 100);
        timeSubtext.textContent = `${percentSaved}% faster payoff`;
      }
    }
    
    const tenureSubtext = document.querySelector('#same-emi .metric:nth-child(1) .metric-subtext');
    if (tenureSubtext) {
      tenureSubtext.textContent = `was ${originalTenure} months`;
    }
    
    const interestSubtext = document.querySelector('#same-emi .metric-row:nth-child(3) .metric-subtext');
    if (interestSubtext) {
      interestSubtext.textContent = `vs. original loan`;
    }
    
    return {
      emi: emiAmount,
      newTenure: newTenure,
      originalTenure: originalTenure,
      monthsSaved: monthsSaved,
      interestSaved: interestSaved
    };
  }
  
  /**
   * Format a number as currency with thousands separators
   * @param {number} value - The number to format
   * @returns {string} Formatted string
   */
  formatCurrency(value) {
    return value.toLocaleString('en-IN');
  }
  
  /**
   * Get the current EMI scenario data
   * @returns {Object} The current EMI scenario data
   */
  getCurrentScenario() {
    return this.updateEMIImpact();
  }
  
  /**
   * Set the EMI slider to a specific value
   * @param {number} value - The value to set
   */
  setEMI(value) {
    if (this.emiSlider) {
      this.emiSlider.value = value;
      this.updateEMIImpact();
    }
  }
  
  /**
   * Update loan data reference
   * @param {Object} loanData - New loan data
   */
  updateLoanData(loanData) {
    this.loanData = loanData;
    this.initSlider();
    this.initPresetButtons();
    this.updateEMIImpact();
  }
}