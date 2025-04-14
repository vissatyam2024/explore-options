# Explore Your Options Component

A standalone component for exploring different loan scenarios, including same tenure, same EMI, and extra payment options.

## Features

- Interactive tab navigation between different loan scenarios
- EMI adjustment with real-time calculation updates
- Extra payment options with frequency selection
- Preset buttons for quick scenario exploration
- Responsive design for mobile and desktop

## Getting Started

### Prerequisites

- Modern web browser with JavaScript enabled
- Visual Studio Code with Live Server extension (for local development)

### Installation

1. Clone or download this repository
2. Open the folder in Visual Studio Code
3. Right-click on `index.html` and select "Open with Live Server"
4. The component will be available at http://127.0.0.1:5500/explore-options/

## Usage

### Basic Initialization

```html
<div id="explore-options"></div>

<script src="assets/js/tabs.js"></script>
<script src="assets/js/emi.js"></script>
<script src="assets/js/extra.js"></script>
<script src="assets/js/main.js"></script>

<script>
  const exploreOptions = new ExploreOptions({
    container: '#explore-options',
    loanData: {
      amount: 100000,
      currentRate: 10,
      newRate: 8.7,
      currentEMI: 2000,
      newEMI: 1086,
      tenure: 12 // months
    },
    onScenarioChange: function(scenarioData) {
      console.log('Scenario changed:', scenarioData);
    }
  });
</script>
```

### Configuration Options

The component accepts the following configuration options:

| Option | Type | Description |
|--------|------|-------------|
| `container` | String | CSS selector for the container element |
| `loanData` | Object | Loan data for calculations |
| `theme` | String | Theme ('dark' or 'light') |
| `onScenarioChange` | Function | Callback when scenario changes |

### Loan Data Object

| Property | Type | Description |
|----------|------|-------------|
| `amount` | Number | Loan amount |
| `currentRate` | Number | Current interest rate (%) |
| `newRate` | Number | New interest rate (%) |
| `currentEMI` | Number | Current EMI amount |
| `newEMI` | Number | New EMI amount with new rate |
| `tenure` | Number | Loan tenure in months |

### Methods

The component exposes the following methods:

- `updateLoanData(loanData)`: Update the loan data and refresh calculations
- `switchTab(tabId)`: Switch to a specific tab ('same-tenure', 'same-emi', 'extra-payment')
- `getCurrentScenario()`: Get data for the current scenario

## Customization

### Styling

The component uses CSS variables for theming. You can override these variables for customization:

```css
#explore-options {
  --accent-color: #0088cc;
  --positive-color: #00cc88;
  --panel-background: rgba(0,0,0,0.1);
}
```

## Integration

To integrate with other systems:

1. Include the component files in your project
2. Initialize with your loan data
3. Use the callback function to receive scenario changes
4. Update the component when loan data changes

## License

This project is licensed under the MIT License - see the LICENSE file for details.