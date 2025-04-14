/**
 * Extra Payment Scenario manager for the Explore Options component
 * Handles calculations for extra payments with dynamic loan data
 */
class ExtraPaymentManager {
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
    this.extraPaymentSlider = this.container.getElementById('extraPaymentSlider');
    this.extraPaymentValue = this.container.querySelector('#extra-payment .slider-value');
    this.frequencySelect = this.container.getElementById('frequencySelect');
    this.extraPaymentPresetButtons = this.container.querySelectorAll('#extra-payment .preset-button');
    
    // Set default extra payment to 10% of EMI
    this.defaultExtraPayment = Math.round(this.loanData.currentEMI * 0.1);
    
    // Initialize
    this.initSlider();
    this.initPresetButtons();
    this.initFrequencySelect();
    this.updateExtraPaymentImpact(); // Initialize calculations
  }
  
  /**
   * Initialize the extra payment slider
   */
  initSlider() {
    if (!this.extraPaymentSlider) return;
    
    // Set slider range
    this.extraPaymentSlider.min = 0;
    this.extraPaymentSlider.max = 500000; // Fixed at 5,00,000 as requested
    this.extraPaymentSlider.value = this.defaultExtraPayment;
    this.extraPaymentSlider.step = 1000; // Step by 1,000
    
    // Update slider range labels
    const sliderRange = this.container.querySelector('#extra-payment .slider-range');
    if (sliderRange) {
      sliderRange.innerHTML = `
        <span>₹0</span>
        <span>₹5,00,000</span>
      `;
    }
    
    // Set initial value display
    if (this.extraPaymentValue) {
      this.extraPaymentValue.textContent = `₹${this.formatCurrency(this.defaultExtraPayment)}`;
    }
    
    // Add event listener
    this.extraPaymentSlider.addEventListener('input', () => this.updateExtraPaymentImpact());
  }
  
  /**
   * Initialize preset buttons with fixed values as requested
   */
  initPresetButtons() {
    // Use the fixed preset amounts requested
    const presetAmounts = [10000, 20000, 50000, 100000, 200000];
    
    this.extraPaymentPresetButtons.forEach((button, index) => {
      if (index < presetAmounts.length) {
        const value = presetAmounts[index];
        button.setAttribute('data-value', value);
        
        // Format button text with proper Indian currency format
        if (value >= 100000) {
          const lakhValue = value / 100000;
          button.textContent = `₹${lakhValue}L`;
        } else if (value >= 1000) {
          const kValue = value / 1000;
          button.textContent = `₹${kValue}k`;
        } else {
          button.textContent = `₹${this.formatCurrency(value)}`;
        }
        
        // Add click handler
        button.addEventListener('click', () => {
          this.extraPaymentSlider.value = Math.min(value, this.extraPaymentSlider.max);
          this.updateExtraPaymentImpact();
        });
      }
    });
  }
  
  /**
   * Initialize frequency select dropdown
   */
  initFrequencySelect() {
    if (!this.frequencySelect) return;
    
    // Ensure the dropdown has the correct options
    this.frequencySelect.innerHTML = `
      <option value="monthly">Monthly</option>
      <option value="quarterly">Quarterly</option>
      <option value="half-yearly">Half Yearly</option>
      <option value="yearly">Yearly</option>
    `;
    
    // Add event listener
    this.frequencySelect.addEventListener('change', () => this.updateExtraPaymentImpact());
  }
  
  /**
   * Update calculations based on current extra payment and frequency
   */
  updateExtraPaymentImpact() {
    if (!this.extraPaymentSlider || !this.frequencySelect) return;
    
    const extraAmount = parseInt(this.extraPaymentSlider.value);
    const frequency = this.frequencySelect.value;
    
    // Format the displayed amount with commas
    if (this.extraPaymentValue) {
      this.extraPaymentValue.textContent = `₹${this.formatCurrency(extraAmount)}`;
    }
    
    // Apply frequency factor
    let frequencyFactor = 1;
    let frequencyText = '';
    
    switch(frequency) {
      case 'monthly':
        frequencyFactor = 1;
        frequencyText = 'monthly';
        break;
      case 'quarterly':
        frequencyFactor = 1/3;
        frequencyText = 'quarterly';
        break;
      case 'half-yearly':
        frequencyFactor = 1/6;
        frequencyText = 'half-yearly';
        break;
      case 'yearly':
        frequencyFactor = 1/12;
        frequencyText = 'yearly';
        break;
    }
    
    // Get DOM elements for metrics
    const newTenureElement = this.container.querySelector('#extra-payment .metric:nth-child(1) .metric-value');
    const interestSavedElement = this.container.querySelector('#extra-payment .metric:nth-child(2) .metric-value');
    
    if (!newTenureElement || !interestSavedElement) return;
    
    // Calculate baseline tenure at new rate (after refinancing)
    const baselineTenure = this.calculationHelper.calculateTenureWithExtraPayment(
      this.loanData.amount, 
      this.loanData.newRate, 
      this.loanData.newEMI,
      0, 
      1
    );
    
    // Calculate new tenure with extra payments
    const newTenure = this.calculationHelper.calculateTenureWithExtraPayment(
      this.loanData.amount, 
      this.loanData.newRate, 
      this.loanData.newEMI,
      extraAmount, 
      frequencyFactor
    );
    
    // Calculate baseline total interest (at new rate without extra payments)
    const baselineInterest = (this.loanData.newEMI * baselineTenure) - this.loanData.amount;
    
    // Calculate new total interest with extra payments
    const effectiveExtraPayment = extraAmount * frequencyFactor;
    const totalPaid = (this.loanData.newEMI * newTenure) + (effectiveExtraPayment * newTenure);
    const newTotalInterest = totalPaid - this.loanData.amount;
    
    // Calculate interest savings
    const interestSaved = Math.max(0, baselineInterest - newTotalInterest);
    
    // Calculate months saved
    const monthsSaved = Math.max(0, baselineTenure - newTenure);
    
    // Update UI elements
    newTenureElement.textContent = `${newTenure} months`;
    interestSavedElement.textContent = `₹${this.formatCurrency(Math.round(interestSaved))}`;
    
    // Update subtexts
    const tenureSubtext = this.container.querySelector('#extra-payment .metric:nth-child(1) .metric-subtext');
    if (tenureSubtext) {
      if (monthsSaved > 0) {
        tenureSubtext.textContent = `save ${monthsSaved} months`;
      } else {
        tenureSubtext.textContent = `same as without extra`;
      }
    }
    
    const savingsSubtext = this.container.querySelector('#extra-payment .metric:nth-child(2) .metric-subtext');
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
   * Format a number as currency with thousands separators
   * @param {number} value - The number to format
   * @returns {string} Formatted string
   */
  formatCurrency(value) {
    return value.toLocaleString('en-IN');
  }
  
  /**
   * Get the current extra payment scenario data
   * @returns {Object} The current extra payment scenario data
   */
  getCurrentScenario() {
    return this.updateExtraPaymentImpact();
  }
  
  /**
   * Set the extra payment amount
   * @param {number} amount - The amount to set
   */
  setExtraPayment(amount) {
    if (this.extraPaymentSlider) {
      this.extraPaymentSlider.value = Math.min(amount, this.extraPaymentSlider.max);
      this.updateExtraPaymentImpact();
    }
  }
  
  /**
   * Set the payment frequency
   * @param {string} frequency - The frequency to set (monthly, quarterly, etc.)
   */
  setFrequency(frequency) {
    if (this.frequencySelect) {
      this.frequencySelect.value = frequency;
      this.updateExtraPaymentImpact();
    }
  }
  
  /**
   * Update loan data reference
   * @param {Object} loanData - New loan data
   */
  updateLoanData(loanData) {
    this.loanData = loanData;
    this.defaultExtraPayment = Math.round(this.loanData.currentEMI * 0.1);
    this.initSlider();
    this.initPresetButtons();
    this.updateExtraPaymentImpact();
  }
}