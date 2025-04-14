/**
 * Calculation Helper class for loan-related calculations
 * Centralizes all financial calculation logic
 */
class CalculationHelper {
    /**
     * Calculate EMI based on principal, rate and tenure
     * @param {number} principal - Loan amount
     * @param {number} ratePercent - Annual interest rate in percent
     * @param {number} tenureMonths - Loan tenure in months
     * @returns {number} Monthly EMI amount (rounded)
     */
    calculateEMI(principal, ratePercent, tenureMonths) {
      const monthlyRate = ratePercent / (12 * 100);
      const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / 
                 (Math.pow(1 + monthlyRate, tenureMonths) - 1);
      return Math.round(emi);
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
        return 0; // Return 0 if calculation fails
      }
      
      return Math.ceil(-numerator / denominator);
    }
    
    /**
     * Calculate tenure with extra payment
     * @param {number} principal - Loan amount
     * @param {number} ratePercent - Annual interest rate
     * @param {number} emi - Regular EMI amount
     * @param {number} extraPayment - Additional payment amount
     * @param {number} frequencyFactor - Factor for payment frequency (1 for monthly, etc.)
     * @returns {number} New tenure in months
     */
    calculateTenureWithExtraPayment(principal, ratePercent, emi, extraPayment, frequencyFactor) {
      const monthlyRate = ratePercent / (12 * 100);
      const effectiveExtraPayment = extraPayment * frequencyFactor;
      const totalMonthlyPayment = emi + effectiveExtraPayment;
      
      const numerator = Math.log(1 - ((principal * monthlyRate) / totalMonthlyPayment));
      const denominator = Math.log(1 + monthlyRate);
      
      // Handle edge cases
      if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
        return 0;
      }
      
      return Math.ceil(-numerator / denominator);
    }
    
    /**
     * Calculate total interest paid over loan term
     * @param {number} principal - Loan amount
     * @param {number} emi - Monthly EMI amount
     * @param {number} tenureMonths - Loan tenure in months
     * @returns {number} Total interest paid
     */
    calculateTotalInterest(principal, emi, tenureMonths) {
      return (emi * tenureMonths) - principal;
    }
    
    /**
     * Format a number as currency with thousands separators
     * @param {number} value - The number to format
     * @returns {string} Formatted string
     */
    formatCurrency(value) {
      return value.toLocaleString('en-IN');
    }
  }