/**
  * EMI Scenario manager for the Explore Options component
  */
class EMIManager {
  constructor(config = {}) {
    // Default loan parameters
    this.loanData = config.loanData ;
    // || {
    //   amount: 10000000,      // Principal amount (₹1 crore)
    //   currentRate: 9,        // Current interest rate (9%)
    //   newRate: 8.1,          // New interest rate (8.1%)
    //   currentEMI: 89973,     // Current EMI amount
    //   tenure: 240            // months (fix the syntax error here)
    // };
    
    // Get DOM elements
    this.emiSlider = document.getElementById('emiSlider');
    this.emiValue = document.querySelector('#same-emi .slider-value');
    this.emiPresetButtons = document.querySelectorAll('#same-emi .preset-button');
    
    // Initialize
    this.initSlider();
    this.initPresetButtons();
    this.updateEMIImpact(); // Initialize calculations with the default EMI value
  }
  
  /**
   * Initialize the EMI slider with loan data
   */
  initSlider() {
    if (!this.emiSlider) return;
    
    // Set slider range based on current EMI
    this.emiSlider.min = this.loanData.currentEMI;
    this.emiSlider.max = this.loanData.currentEMI * 3; // Up to 3x current EMI
    this.emiSlider.value = this.loanData.currentEMI;
    // this.emiSlider.step = 1000; // Step by 1000

    
    // Update slider range labels
    const sliderRange = document.querySelector('#same-emi .slider-range');
    if (sliderRange) {
      sliderRange.innerHTML = `
        <span>Current: ₹${this.formatCurrency(this.loanData.currentEMI)}</span>
        <span>3x: ₹${this.formatCurrency(this.loanData.currentEMI * 3)}</span>
      `;
    }
    
    // Add event listener
    this.emiSlider.addEventListener('input', () => this.updateEMIImpact());

  }
  
  /**
   * Initialize preset buttons
   */
  initPresetButtons() {
    // Update preset button values based on current EMI
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
        this.emiPresetButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
      });
                

    });
  }
  
  /**
   * Update calculations based on current slider value
   */
  // In the EMIManager.js file, update the updateEMIImpact() method:

  updateEMIImpact() {
    if (!this.emiSlider) return;
    
    const emiAmount = parseInt(this.emiSlider.value);
    
    // Format with commas
    this.emiValue.textContent = `₹${this.formatCurrency(emiAmount)}`;
    
    // Calculate new tenure based on EMI and NEW interest rate
    const monthlyRate = this.loanData.newRate / 12 / 100;
    
    // Calculate new tenure with new interest rate but same EMI
    const newMonths = Math.ceil(-Math.log(1 - (this.loanData.amount * monthlyRate / emiAmount)) / Math.log(1 + monthlyRate));
    
    // Calculate months saved
    const savedMonths = this.loanData.tenure - newMonths;
    
    // Update tenure metrics
    const newTenure = document.querySelector('#same-emi .metric:nth-child(1) .metric-value');
    const timeSaved = document.querySelector('#same-emi .metric:nth-child(2) .metric-value');

    
    newTenure.textContent = `${newMonths} months`;
    timeSaved.textContent = `${savedMonths} months`;

    // IMPROVED INTEREST SAVINGS CALCULATION
    // Original total payment = original EMI × original tenure
    const originalTotalPayment = this.loanData.currentEMI * this.loanData.tenure;
    // Original total interest paid = total payment - principal
    const originalInterestPaid = originalTotalPayment - this.loanData.amount;
    
    // New total payment = same EMI × new tenure
    const newTotalPayment = emiAmount * newMonths;
    const newInterestPaid = newTotalPayment - this.loanData.amount;

    // Interest saved is the difference in total payments
    const interestSaved = originalInterestPaid - newInterestPaid;
    const totalinterestsaved = document.querySelector('#insterestSaved .metric:nth-child(1) .metric-value');
    totalinterestsaved.textContent = `₹${this.formatCurrency(Math.round(interestSaved))}`;

  
    // Update interest saved display
    const interestSavedValue = document.querySelector('#same-emi .metric-row:nth-child(1) .metric .metric-value');
    if (interestSavedValue) {
      interestSavedValue.textContent = `₹${this.formatCurrency(Math.round(interestSaved))}`;
      // Add the positive CSS class if it's not already there
      interestSavedValue.classList.add('value-positive');
    } else {
      console.error('Interest saved element not found');
    }
    
    // Update subtext to provide context
    const timeSubtext = document.querySelector('#same-emi .metric:nth-child(2) .metric-subtext');
    if (savedMonths <= 0) {
      timeSubtext.textContent = 'adjust EMI to see more impact';
    } else {
      const percentSaved = Math.round((savedMonths / this.loanData.tenure) * 100);
      timeSubtext.textContent = `${percentSaved}% faster payoff`;
    }
    
    // // Update tenure subtext
    const tenureSubtext = document.querySelector('#same-emi .metric:nth-child(1) .metric-subtext');
    tenureSubtext.textContent = `vs ${this.loanData.tenure} months (Left Term)`;
    
    // Update interest saved subtext
    const interestSubtext = document.querySelector('#insterestSaved .metric:nth-child(1) .metric-subtext');
    if (interestSubtext) {
      interestSubtext.textContent = `vs Original Loan`;
    }
    
    // Add console logging to help debug
    console.log('EMI Impact Calculation:', {
      emiAmount,
      newMonths,
      savedMonths,
      originalTotalPayment,
      newTotalPayment,
      interestSaved
    });
    
    return {
      emi: emiAmount,
      newTenure: newMonths,
      timeSaved: savedMonths,
      interestSaved: Math.round(interestSaved)
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
    const emiAmount = parseInt(this.emiSlider.value);
    return this.updateEMIImpact();
  }

  updateLoanData(loanData) {
    console.log("EMIManager.updateLoanData called with:", loanData);
    this.loanData = { ...this.loanData, ...loanData };
    this.updateEMIImpact();
    return this.getCurrentScenario();
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
}