/**
  * EMI Scenario manager for the Explore Options component
  */
class EMIManager {
  constructor(config = {}) {
    // Default loan parameters
    this.loanData = config.loanData || {
      amount: 10000000,        // Principal amount (₹1 crore)
      currentRate: 9,          // Current interest rate (9%)
      newRate: 8.1,            // New interest rate (8.1%)
      currentEMI: 89973,       // Current EMI amount
      tenure: 240 / months
    };
    
    // Get DOM elements
    this.emiSlider = document.getElementById('emiSlider');
    this.emiValue = document.querySelector('#same-emi .slider-value');
    this.emiPresetButtons = document.querySelectorAll('#same-emi .preset-button');
    
    // Initialize
    this.initSlider();
    this.initPresetButtons();
    this.updateEMIImpact(); // Initialize calculations
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
      });
    });
  }
  
  /**
   * Update calculations based on current slider value
   */
  updateEMIImpact() {
    if (!this.emiSlider) return;
    
    const emiAmount = parseInt(this.emiSlider.value);
    
    // Format with commas
    this.emiValue.textContent = `₹${this.formatCurrency(emiAmount)}`;
    
    // Update metrics based on slider
    const newTenure = document.querySelector('#same-emi .metric:nth-child(1) .metric-value');
    const timeSaved = document.querySelector('#same-emi .metric:nth-child(2) .metric-value');
    
    // Calculate new tenure based on EMI increase
    const emiRatio = emiAmount / this.loanData.currentEMI;
    const newMonths = Math.max(1, Math.round(this.loanData.tenure / emiRatio));
    const savedMonths = this.loanData.tenure - newMonths;
    
    newTenure.textContent = `${newMonths} months`;
    timeSaved.textContent = `${savedMonths} months`;
    
    // Update interest saved based on time saved
    const interestSavedValue = document.querySelector('#same-emi .metric-row:nth-child(3) .metric-value');
    const interestSaved = Math.round(savedMonths * this.loanData.newEMI);
    interestSavedValue.textContent = `₹${this.formatCurrency(interestSaved)}`;
    
    // Update subtext to provide context
    const timeSubtext = document.querySelector('#same-emi .metric:nth-child(2) .metric-subtext');
    if (savedMonths === 0) {
      timeSubtext.textContent = 'adjust EMI to see impact';
    } else {
      const percentSaved = Math.round((savedMonths / this.loanData.tenure) * 100);
      timeSubtext.textContent = `${percentSaved}% faster payoff`;
    }
    
    return {
      emi: emiAmount,
      newTenure: newMonths,
      timeSaved: savedMonths,
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
    const emiAmount = parseInt(this.emiSlider.value);
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
}