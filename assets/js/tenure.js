/**
  * Same Tenure Scenario manager for the Explore Options component
  */
class SameTenureManager {
    constructor(config = {}) {
      console.log("SameTenureManager initialized!");
      
      // Default loan parameters
      this.loanData = config.loanData; 
      // || {
      //   amount: 10000000,        // Principal amount (₹1 crore)
      //   currentRate: 9,          // Current interest rate (9%)
      //   newRate: 8.1,            // New interest rate (8.1%)
      //   currentEMI: 89973,       // Current EMI amount
      //   tenure: 240              // months
      // };
      
      console.log("SameTenureManager loan data:", this.loanData);
      
      // Calculate the new EMI if not provided
      if (!this.loanData.newEMI) {
        this.loanData.newEMI = this.calculateEMI(
          this.loanData.amount,
          this.loanData.newRate,
          this.loanData.tenure
        );
      }
      
      // Initialize calculations
      this.updateCalculations();
    }
    
    /**
     * Calculate the EMI amount using loan parameters
     * @param {number} principal - Loan amount
     * @param {number} rate - Annual interest rate in percentage
     * @param {number} tenure - Loan tenure in months
     * @returns {number} EMI amount
     */
    calculateEMI(principal, rate, tenure) {
      const monthlyRate = rate / 12 / 100;
      const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1);
      return Math.round(emi);
    }
    
    /**
     * Update all calculations for the Same Tenure tab
     */
    updateCalculations() {
      console.log("Running Same Tenure calculations with data:", this.loanData);
      
      // Calculate new EMI with new interest rate
      const newEMI = this.calculateEMI(
        this.loanData.amount,
        this.loanData.newRate,
        this.loanData.tenure
      );
      console.log("Calculated new EMI:", newEMI);
      
      // Calculate monthly savings
      const monthlySavings = this.loanData.currentEMI - newEMI;
      console.log("Monthly savings:", monthlySavings);
      
      // Calculate total interest saved over loan term
      const totalInterestSaved = monthlySavings * this.loanData.tenure;
      console.log("Total interest saved:", totalInterestSaved);
      
      // Calculate percentage reduction in EMI
      const percentageReduction = (monthlySavings / this.loanData.currentEMI) * 100;
      console.log("Percentage reduction:", percentageReduction);
      
      // Update DOM with more careful element selection and null checks
      this.updateDOM(newEMI, monthlySavings, totalInterestSaved, percentageReduction);
      
      // Store calculated values for reference
      this.calculatedValues = {
        newEMI: newEMI,
        monthlySavings: monthlySavings,
        totalInterestSaved: totalInterestSaved,
        percentageReduction: percentageReduction
      };
      
      return this.calculatedValues;
    }
    
    /**
     * Update the DOM elements with calculated values
     */
    updateDOM(newEMI, monthlySavings, totalInterestSaved, percentageReduction) {
      // Get DOM elements - do this every time to ensure we have the latest elements
      const newEMIValue = document.querySelector('#same-tenure .metric:nth-child(1) .metric-value');
      const monthlySavingsValue = document.querySelector('#same-tenure .metric:nth-child(2) .metric-value');
      const totalInterestSavedValue = document.querySelector('#same-tenure .metric-row:nth-child(2) .metric .metric-value');
      
      // Get subtext elements
      const newEMISubtext = document.querySelector('#same-tenure .metric:nth-child(1) .metric-subtext');
      const monthlySavingsSubtext = document.querySelector('#same-tenure .metric:nth-child(2) .metric-subtext');
      const totalInterestSavedSubtext = document.querySelector('#same-tenure .metric-row:nth-child(2) .metric .metric-subtext');
      
      console.log("DOM elements for update:", {
        newEMIValue, 
        monthlySavingsValue, 
        totalInterestSavedValue,
        // newEMISubtext,
        // monthlySavingsSubtext,
        // totalInterestSavedSubtext
      });
      
      // Update DOM if elements exist
      if (newEMIValue) {
        newEMIValue.textContent = `₹${this.formatCurrency(newEMI)}`;
      } else {
        console.error("New EMI element not found!");
      }
      
      if (monthlySavingsValue) {
        monthlySavingsValue.textContent = `₹${this.formatCurrency(monthlySavings)}`;
        monthlySavingsValue.classList.add('value-positive');
      } else {
        console.error("Monthly savings element not found!");
      }
      
      if (totalInterestSavedValue) {
        totalInterestSavedValue.textContent = `₹${this.formatCurrency(totalInterestSaved)}`;
        totalInterestSavedValue.classList.add('value-positive');
      } else {
        console.error("Total interest saved element not found!");
      }
      
      // Update subtexts
      if (newEMISubtext) {
        newEMISubtext.textContent = `was ₹${this.formatCurrency(this.loanData.currentEMI)}`;
      }
      
      if (monthlySavingsSubtext) {
        monthlySavingsSubtext.textContent = `${percentageReduction.toFixed(1)}% less`;
      }
      
      if (totalInterestSavedSubtext) {
        totalInterestSavedSubtext.textContent = `over loan term`;
      }
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
     * Get the current scenario data
     * @returns {Object} The current scenario data
     */
    getCurrentScenario() {
      return this.calculatedValues || this.updateCalculations();
    }

    
   
    /**
     * Update the loan data and recalculate
     * @param {Object} loanData - New loan data
     */
    updateLoanData(loanData) {
      console.log("SameTenureManager.updateLoanData called with:", loanData);
      this.loanData = { ...this.loanData, ...loanData };
      this.updateCalculations();
    
    
      
      // Calculate the new EMI if not provided
      if (!this.loanData.newEMI) {
        this.loanData.newEMI = this.calculateEMI(
          this.loanData.amount,
          this.loanData.newRate,
          this.loanData.tenure
        );
      }
      
      return this.updateCalculations();
    }
  } 