# Explore Your Loan Options

A modular loan scenario explorer component that dynamically calculates all values based on the input loan data. This component is designed for easy integration with API data sources and follows a clean, multi-file architecture.

## Features

- Dynamic calculations: All values derive from the base loan data
- Pre-populated Same EMI tab showing impact of lower interest rate
- Customizable Extra Payment options with fixed preset values
- Multi-file architecture for better code organization and maintainability 
- API-ready design for seamless integration with data services

## File Structure

```
explore-options/
├── index.html            # HTML structure and CSS styles
├── calculationHelper.js  # Centralized financial calculation functions
├── tabs.js               # Tab navigation functionality
├── emi.js                # Same EMI tab functionality
├── extra.js              # Extra Payment tab functionality  
├── main.js               # Main controller and coordination logic
└── README.md             # Documentation
```

## Installation

1. Clone or download this repository
2. Place all files in your web server directory, maintaining the file structure
3. Open index.html in a browser or serve through a web server

## Usage

### Basic Initialization

```javascript
const exploreOptions = new ExploreOptions({
  container: '#explore-options',
  loanData: {
    amount: 10000000,        // Principal amount (₹1 crore)
    currentRate: 9,          // Current interest rate (9%)
    newRate: 8.1,            // New interest rate (8.1%)
    currentEMI: 89973,       // Current EMI amount
    tenure: 240              // Loan tenure in months (20 years)
  },
  onScenarioChange: function(scenarioData) {
    console.log('Scenario changed:', scenarioData);
  }
});
```

### API Integration

```javascript
// Example of fetching data from an API
fetch('https://api.example.com/loan-data')
  .then(response => response.json())
  .then(data => {
    // Update the component with API data
    exploreOptions.updateLoanData(data);
  })
  .catch(error => {
    console.error('Error fetching loan data:', error);
  });
```

## Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `container` | String | CSS selector for the container element |
| `loanData` | Object | Loan data for calculations |
| `onScenarioChange` | Function | Callback when scenario changes |

## Loan Data Object

| Property | Type | Description |
|----------|------|-------------|
| `amount` | Number | Loan amount |
| `currentRate` | Number | Current interest rate (%) |
| `newRate` | Number | New interest rate (%) |
| `currentEMI` | Number | Current EMI amount |
| `tenure` | Number | Loan tenure in months |

## Component Architecture

The component is built using a modular architecture:

1. **CalculationHelper**: Centralizes all financial calculation logic
2. **TabManager**: Handles tab navigation and selection
3. **EMIManager**: Manages the Same EMI tab with slider and calculations
4. **ExtraPaymentManager**: Manages the Extra Payment tab with slider, frequency selector, and calculations
5. **ExploreOptions**: Main controller that coordinates the other managers

## Customization

### Same EMI Tab

- Uses multiples of current EMI (1x, 1.5x, 2x, 3x) for preset buttons
- Slider ranges from current EMI to 3x current EMI
- Pre-filled with calculated values showing impact of lower interest rate

### Extra Payment Tab

- Uses fixed preset values: ₹10k, ₹20k, ₹50k, ₹1L, ₹2L
- Slider ranges from 0 to ₹5,00,000
- Frequency selector with monthly, quarterly, half-yearly, and yearly options

## Integration with SURE Platform

This component is designed to be integrated within the SURE liability management platform, specifically for analyzing home loan refinancing options.

```javascript
// Example of integration with SURE platform
document.querySelector('#analyze-loan-button').addEventListener('click', function() {
  // Get current loan data from SURE platform
  const loanData = SURE.getCurrentLoanData();
  
  // Initialize the loan analyzer
  const loanAnalyzer = new ExploreOptions({
    container: '#loan-analyzer-container',
    loanData: loanData,
    onScenarioChange: function(scenario) {
      SURE.saveLoanScenario(scenario);
    }
  });
  
  // Show the analyzer interface
  document.querySelector('#loan-analyzer-modal').classList.add('visible');
});
```

## Browser Compatibility

- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers on iOS and Android

## License

This project is licensed under the MIT License.