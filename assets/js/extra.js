/**
 * Extra Payment Scenario manager for the Explore Options component
 */
class ExtraPaymentManager {
  constructor(config = {}) {
    // Default loan parameters
    this.loanData = config.loanData || {
      amount: 100000,
      currentRate: 10,
      newRate: 8.7,
      currentEMI: 2000,
      newEMI: 1086,
      tenure: 12 // months
    };
    
    // Get DOM elements
    this.extraPaymentSlider = document.getElementById('extraPaymentSlider');
    this.extraPaymentValue = document.querySelector('#extra-payment .slider-value');
    this.frequencySelect = document.getElementById('frequencySelect');
    this.extraPaymentPresetButtons = document.querySelectorAll('#extra-payment .preset-button');
    
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
    this.extraPaymentSlider.max = 500000; // Up to 5 lacs
    this.extraPaymentSlider.value = 10000; // Default value
    this.extraPaymentSlider.step = 1000; // Step by 1000
    
    // Update slider range labels
    const sliderRange = document.querySelector('#extra-payment .slider-range');
    if (sliderRange) {
      sliderRange.innerHTML = `
        <span>₹0</span>
        <span>₹${this.formatCurrency(500000)}</span>
      `;
    }
    
    // Add event listener
    this.extraPaymentSlider.addEventListener('input', () => this.updateExtraPaymentImpact());
  }
  
  /**
   * Initialize preset buttons
   */
  initPresetButtons() {
    // Set preset amounts
    const presetAmounts = [5000, 10000, 50000, 100000];
    
    this.extraPaymentPresetButtons.forEach((button, index) => {
      if (index < presetAmounts.length) {
        const value = presetAmounts[index];
        button.setAttribute('data-value', value);
        button.textContent = `₹${this.formatCurrency(value)}`;
        
        // Add click handler
        button.addEventListener('click', () => {
          this.extraPaymentSlider.value = value;
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
   * Update calculations based on current slider value and frequency
   */
  updateExtraPaymentImpact() {
    if (!this.extraPaymentSlider || !this.frequencySelect) return;
    
    const extraAmount = parseInt(this.extraPaymentSlider.value);
    const frequency = this.frequencySelect.value;
    
    // Format the displayed amount with commas
    this.extraPaymentValue.textContent = `₹${this.formatCurrency(extraAmount)}`;
    
    // Apply frequency factor
    let frequencyFactor = 1;
    switch(frequency) {
      case 'monthly': frequencyFactor = 1; break;
      case 'quarterly': frequencyFactor = 1/3; break;
      case 'half-yearly': frequencyFactor = 1/6; break;
      case 'yearly': frequencyFactor = 1/12; break;
    }
    
    // Calculate effective monthly extra payment
    const effectiveMonthly = extraAmount * frequencyFactor;
    
    // Update metrics based on effective monthly payment
    const newTenure = document.querySelector('#extra-payment .metric:nth-child(1) .metric-value');
    const interestSaved = document.querySelector('#extra-payment .metric:nth-child(2) .metric-value');
    
    // Calculate impact on tenure
    // This is a simplified calculation - in real app would use more complex formula
    const totalMonthlyPayment = this.loanData.newEMI + effectiveMonthly;
    const paymentRatio = totalMonthlyPayment / this.loanData.newEMI;
    const newMonths = Math.max(1, Math.round(this.loanData.tenure / paymentRatio));
    const monthsSaved = this.loanData.tenure - newMonths;
    const interestSavingsAmount = Math.round(monthsSaved * this.loanData.newEMI);
    
    newTenure.textContent = `${newMonths} months`;
    interestSaved.textContent = `₹${this.formatCurrency(interestSavingsAmount)}`;
    
    // Update subtext
    const tenureSubtext = document.querySelector('#extra-payment .metric:nth-child(1) .metric-subtext');
    tenureSubtext.textContent = `was ${this.loanData.tenure} months`;
    
    const savingsSubtext = document.querySelector('#extra-payment .metric:nth-child(2) .metric-subtext');
    
    if (frequency === 'monthly') {
      savingsSubtext.textContent = 'with monthly extra payments';
    } else {
      savingsSubtext.textContent = `with ${frequency} extra payments`;
    }
    
    return {
      extraAmount: extraAmount,
      frequency: frequency,
      effectiveMonthly: effectiveMonthly,
      newTenure: newMonths,
      monthsSaved: monthsSaved,
      interestSaved: interestSavingsAmount
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
      this.extraPaymentSlider.value = amount;
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
}