/**
 * Tab navigation functionality for the Explore Options component
 */
class TabManager {
  constructor(config = {}) {
    this.tabs = document.querySelectorAll('.segment');
    this.tabContents = document.querySelectorAll('.scenario-content');
    this.segmentHighlight = document.querySelector('.segment-highlight');
    this.activeTab = 'same-tenure'; // Default active tab
    this.onTabChange = config.onTabChange || function() {};
    
    this.initTabs();
  }
  
  /**
   * Initialize tab click handlers
   */
  initTabs() {
    this.tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
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
  switchTab(tabId, index) {
    // Update active tab
    document.querySelector('.segment.active').classList.remove('active');
    this.tabs[index].classList.add('active');
    
    // Update tab highlight position
    this.segmentHighlight.style.transform = `translateX(${index * 100}%)`;
    
    // Show corresponding content
    document.querySelector('.scenario-content.active').classList.remove('active');
    document.getElementById(tabId).classList.add('active');
    
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