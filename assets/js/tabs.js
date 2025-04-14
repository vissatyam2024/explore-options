/**
 * Tab navigation functionality for the Explore Options component
 */
class TabManager {
  constructor(config = {}) {
    this.container = typeof config.container === 'string' ? 
    document.querySelector(config.container) : 
    (config.container || document);
    this.tabs = this.container.querySelectorAll('.segment');
    this.tabContents = this.container.querySelectorAll('.scenario-content');
    this.segmentHighlight = this.container.querySelector('.segment-highlight');
    this.activeTab = 'same-tenure'; // Default active tab
    this.onTabChange = config.onTabChange || function() {};
    
    this.initTabs();
  }
  
  /**
   * Initialize tab click handlers
   */
  initTabs() {
    this.tabs.forEach((tab, index) => {
      ttab.addEventListener('click', () => {
        console.log('Tab clicked:', tab);
        this.switchTab(tabId, index);
        
        // Add tap highlight animation
        tab.classList.add('tap-highlight');
        setTimeout(() => tab.classList.remove('tap-highlight'), 300);
      });
    });
  }
  
  /**
   * Switch to a specific tab
   * @param {string} tabId - The ID of the tab to switch to
   * @param {number} index - The index of the tab in the tab array
   */
 // Change this in tabs.js
switchTab(tabId, index) {
  // Update active tab
  this.container.querySelector('.segment.active').classList.remove('active');
  this.tabs[index].classList.add('active');
  
  // Update tab highlight position
  this.segmentHighlight.style.transform = `translateX(${index * 100}%)`;
  
  // Show corresponding content - using querySelector instead of getElementById
  this.container.querySelector('.scenario-content.active').classList.remove('active');
  this.container.querySelector('#' + tabId).classList.add('active');
  
  // Store active tab
  this.activeTab = tabId;
  
  // Call the callback
  this.onTabChange(tabId);
}
  
  /**
   * Get the currently active tab
   * @returns {string} The ID of the active tab
   */
  getActiveTab() {
    return this.activeTab;
  }
  
  /**
   * Programmatically switch to a tab by ID
   * @param {string} tabId - The ID of the tab to switch to
   */
  setActiveTab(tabId) {
    const tabIndex = Array.from(this.tabs).findIndex(tab => 
      tab.getAttribute('data-tab') === tabId
    );
    
    if (tabIndex >= 0) {
      this.switchTab(tabId, tabIndex);
    }
  }
}