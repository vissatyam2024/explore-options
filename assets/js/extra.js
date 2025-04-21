/**
  * Extra Payment Scenario manager for the Explore Options component
  */
class ExtraPaymentManager {
  constructor(config = {}) {
    // Default loan parameters
    this.loanData = config.loanData; 
    // || {
    //   amount: 10000000,        // Principal amount (₹1 crore)
    //   currentRate: 9,          // Current interest rate (9%)
    //   newRate: 8.1,            // New interest rate (8.1%)
    //   currentEMI: 89973,       // Current EMI amount
    //   tenure: 240 // months
    // };
    
    // Get DOM elements
    this.extraPaymentSlider = document.getElementById('extraPaymentSlider');
    this.extraPaymentValue = document.querySelector('#extra-payment .slider-value');
    this.frequencySelect = document.getElementById('frequencySelect');
    this.extraPaymentPresetButtons = document.querySelectorAll('#extra-payment .preset-button');
    this.comparisonToggle = document.querySelectorAll('#compare-toggle input[type="radio"]');
    
    // Set default comparison mode
    this.comparisonMode = 'refinanced'; // 'refinanced' or 'original'
    
    // Initialize
    this.initSlider();
    this.initPresetButtons();
    this.initFrequencySelect();
    this.initComparisonToggle();
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
    this.extraPaymentSlider.value = 0; // Default value
    this.extraPaymentSlider.step = 5000; // Step by 1000
    
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
    const presetAmounts = [10000, 50000, 100000, 200000];
    
    this.extraPaymentPresetButtons.forEach((button, index) => {
      if (index < presetAmounts.length) {
        const value = presetAmounts[index];
        button.setAttribute('data-value', value);
        button.textContent = `₹${this.formatCurrency(value)}`;
        
        // Add click handler
        button.addEventListener('click', () => {
          this.extraPaymentSlider.value = value;
          this.updateExtraPaymentImpact();
          
          // Add active class to selected button
          this.extraPaymentPresetButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
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
   * Initialize comparison toggle
   */
  initComparisonToggle() {
    if (!this.comparisonToggle) return;
    
    this.comparisonToggle.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.comparisonMode = e.target.value;
        this.updateExtraPaymentImpact();
      });
    });
  }
  
  /**
   * Update calculations based on current slider value, frequency, and comparison mode
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
    
    // Calculate based on comparison mode
    let baseRate, baseEMI, baseTenure;
    
    if (this.comparisonMode === 'original') {
      // Compare with original loan
      baseRate = this.loanData.currentRate;
      baseEMI = this.loanData.currentEMI;
      baseTenure = this.loanData.tenure;
    } else {
      // Compare with refinanced loan
      baseRate = this.loanData.newRate;
      baseEMI = this.loanData.currentEMI; // Same EMI but lower rate
      
      // Calculate the new tenure with lower rate (before extra payments)
      const monthlyRate = baseRate / 12 / 100;
      baseTenure = Math.ceil(-Math.log(1 - (this.loanData.amount * monthlyRate / baseEMI)) / Math.log(1 + monthlyRate));
    }
    
    // Update metrics based on selected comparison mode
    // Calculate impact on tenure with extra payments
    const totalMonthlyPayment = baseEMI + effectiveMonthly;
    const monthlyRate = baseRate / 12 / 100;
    
    // Calculate new tenure with extra payments using amortization formula
    const newMonths = Math.ceil(-Math.log(1 - (this.loanData.amount * monthlyRate / totalMonthlyPayment)) / Math.log(1 + monthlyRate));
    
    // Calculate months saved compared to base tenure
    const monthsSaved = baseTenure - newMonths;
    
    // Calculate interest savings
// Calculate interest savings
let interestSavingsAmount;
if (this.comparisonMode === 'refinanced' && extraAmount === 0) {
  // Use the already calculated interest savings from the EMI manager
  // Get the EMI manager instance
  const emiManager = window.exploreOptions?.emiManager;
  
  if (emiManager) {
    // Get the current scenario data which includes interest saved
    const emiScenario = emiManager.getCurrentScenario();
    interestSavingsAmount = emiScenario.interestSaved;
  } else {
    // Fallback calculation if EMI manager is not accessible
    const originalTotalPayment = this.loanData.currentEMI * this.loanData.tenure;
    const refinancedTotalPayment = this.loanData.currentEMI * baseTenure;
    interestSavingsAmount = originalTotalPayment - refinancedTotalPayment;
  }
} else {
  // Normal calculation for extra payments
  // Total payment with base plan
  const baseTotalPayment = baseEMI * baseTenure;
  const baseInterestPaid = baseTotalPayment - this.loanData.amount;
  
  // Total payment with extra payments
  const newTotalPayment = (baseEMI * newMonths) + (extraAmount * Math.ceil(newMonths * frequencyFactor));
  const newInterestPaid = newTotalPayment - this.loanData.amount;
  
  // Interest saved from extra payments
  const extraPaymentSavings = baseInterestPaid - newInterestPaid;
  
  // For refinanced loan mode with extra payments, add the savings from refinancing
  if (this.comparisonMode === 'refinanced' && extraAmount > 0) {
    // Get base refinancing savings
    const emiManager = window.exploreOptions?.emiManager;
    let refinancingSavings = 0;
    
    if (emiManager) {
      // Get savings calculated in EMI manager
      const emiScenario = emiManager.getCurrentScenario();
      refinancingSavings = emiScenario.interestSaved;
    } else {
      // Fallback calculation
      const originalTotalPayment = this.loanData.currentEMI * this.loanData.tenure;
      const refinancedTotalPayment = this.loanData.currentEMI * baseTenure;
      refinancingSavings = originalTotalPayment - refinancedTotalPayment;
    }
    
    // Cumulative savings (refinancing + extra payments)
    interestSavingsAmount = refinancingSavings + extraPaymentSavings;
  } else {
    // For original loan mode, just show extra payment savings
    interestSavingsAmount = extraPaymentSavings;
  }
}

// Get metrics elements
const newTenureElement = document.querySelector('#extra-payment .metric:nth-child(1) .metric-value');
const interestSavedElement = document.querySelector('#extra-payment .metric:nth-child(2) .metric-value');

// Update metrics display
if (newTenureElement) {
  newTenureElement.textContent = `${newMonths} months`;
}

if (interestSavedElement) {
  interestSavedElement.textContent = `₹${this.formatCurrency(Math.round(interestSavingsAmount))}`;
  interestSavedElement.classList.add('value-positive');
}
    
    // Update subtext
    const tenureSubtext = document.querySelector('#extra-payment .metric:nth-child(1) .metric-subtext');
    if (tenureSubtext) {
      tenureSubtext.textContent = `was ${baseTenure} months`;
    }
    
    const savingsSubtext = document.querySelector('#extra-payment .metric:nth-child(2) .metric-subtext');
    if (savingsSubtext) {
      // if (this.comparisonMode === 'original') {
        savingsSubtext.textContent = `vs. original loan (${this.loanData.currentRate}%)`;
      // } else {
      //   savingsSubtext.textContent = `vs. optimized loan (${this.loanData.newRate}%)`;
      // }
    }
    
    return {
      extraAmount: extraAmount,
      frequency: frequency,
      effectiveMonthly: effectiveMonthly,
      comparisonMode: this.comparisonMode,
      baseEMI: baseEMI,
      baseRate: baseRate,
      baseTenure: baseTenure,
      newTenure: newMonths,
      monthsSaved: monthsSaved,
      interestSaved: Math.round(interestSavingsAmount)
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
  
  updateLoanData(loanData) {
    console.log("ExtraPaymentManager.updateLoanData called with:", loanData);
    this.loanData = { ...this.loanData, ...loanData };
    this.updateExtraPaymentImpact();
    return this.getCurrentScenario();
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
  
  /**
   * Set the comparison mode
   * @param {string} mode - The comparison mode ('original' or 'refinanced')
   */
  setComparisonMode(mode) {
    if (mode === 'original' || mode === 'refinanced') {
      this.comparisonMode = mode;
      
      // Update radio button if it exists
      const radio = document.querySelector(`#compare-toggle input[value="${mode}"]`);
      if (radio) {
        radio.checked = true;
      }
      
      this.updateExtraPaymentImpact();
    }
  }
}