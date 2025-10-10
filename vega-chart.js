// Tennis Players Birth Year Chart using Vega-Lite
// Alternative implementation to chart.js using Vega-Lite for comparison

class VegaTennisChart {
  constructor() {
    this.yearData = [];
    this.spec = null;
    this.view = null;
    this.slider = null;
    this.yearRange = null;
    this.filteredPlayers = null;
  }

  async loadYearData() {
    try {
      const response = await fetch('year_counts_clean.csv');
      const csvText = await response.text();
      const lines = csvText.trim().split('\n');
      
      this.yearData = lines.map(line => {
        const [year, count] = line.split(',');
        return {
          year: parseInt(year),
          count: parseInt(count)
        };
      });
      
      console.log(`Loaded ${this.yearData.length} years of data for Vega-Lite chart`);
      this.initializeChart();
    } catch (error) {
      console.error('Error loading year data:', error);
      this.yearData = [];
      this.initializeChart();
    }
  }

  createVegaSpec(data) {
    return {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "description": "Tennis players by birth year",
      "data": {
        "values": data
      },
      "mark": {
        "type": "bar",
        "color": "#3498db",
        "stroke": "#2980b9",
        "strokeWidth": 1
      },
      "encoding": {
        "x": {
          "field": "year",
          "type": "ordinal",
          "title": "Birth Year",
          "axis": {
            "labelAngle": -45,
            "labelFontSize": 12,
            "titleFontSize": 14,
            "values": [1840, 1850, 1860, 1870, 1880, 1890, 1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000]
          },
          "scale": {
            "bandPaddingInner": 0.1
          }
        },
        "y": {
          "field": "count",
          "type": "quantitative",
          "title": "Number of Players",
          "scale": {
            "zero": true
          },
          "axis": {
            "titleFontSize": 14,
            "labelFontSize": 12
          }
        },
        "tooltip": [
          {
            "field": "year",
            "type": "ordinal",
            "title": "Year"
          },
          {
            "field": "count",
            "type": "quantitative",
            "title": "Players"
          }
        ]
      },
      "width": "container",
      "height": 400,
      "config": {
        "view": {
          "stroke": "transparent"
        },
        "axis": {
          "grid": false,
          "domain": true,
          "ticks": true
        },
        "axisY": {
          "grid": true,
          "gridColor": "#f0f0f0",
          "gridOpacity": 0.5
        }
      }
    };
  }

  async initializeChart() {
    console.log('Initializing Vega-Lite chart with', this.yearData.length, 'data points');
    
    // Check if container exists
    const container = document.getElementById('vegaChart');
    if (!container) {
      console.error('Vega-Lite chart container not found!');
      return;
    }
    
    console.log('Container found:', container);
    
    // Create initial spec with all data
    this.spec = this.createVegaSpec(this.yearData);
    console.log('Vega-Lite spec created:', this.spec);
    
    // Clear container first
    container.innerHTML = '';
    
    // Embed the chart
    try {
      this.view = await vegaEmbed('#vegaChart', this.spec, {
        actions: false,
        renderer: 'svg'
      });
      console.log('Vega-Lite chart embedded successfully', this.view);
    } catch (error) {
      console.error('Error embedding Vega-Lite chart:', error);
      // Fallback: try with canvas renderer
      try {
        this.view = await vegaEmbed('#vegaChart', this.spec, {
          actions: false,
          renderer: 'canvas'
        });
        console.log('Vega-Lite chart embedded with canvas renderer');
      } catch (canvasError) {
        console.error('Error with canvas renderer too:', canvasError);
      }
    }
    
    this.initializeSlider();
  }

  initializeSlider() {
    this.slider = document.getElementById('vegaYearSlider');
    this.yearRange = document.getElementById('vegaYearRange');
    this.filteredPlayers = document.getElementById('vegaFilteredPlayers');

    console.log('Slider elements found:', {
      slider: !!this.slider,
      yearRange: !!this.yearRange,
      filteredPlayers: !!this.filteredPlayers
    });

    if (this.slider) {
      this.slider.addEventListener('input', () => this.updateChart());
      this.updateChart(); // Initialize with all data
    } else {
      console.error('Vega-Lite slider element not found!');
    }
  }

  async updateChart() {
    const maxYear = parseInt(this.slider.value);
    const filteredData = this.yearData.filter(d => d.year <= maxYear);
    
    console.log(`Updating chart with ${filteredData.length} data points up to year ${maxYear}`);
    
    // Create new spec with filtered data
    const newSpec = this.createVegaSpec(filteredData);
    
    // Clear container first
    const container = document.getElementById('vegaChart');
    if (container) {
      container.innerHTML = '';
    }
    
    // Update the chart by re-embedding with new spec
    try {
      this.view = await vegaEmbed('#vegaChart', newSpec, {
        actions: false,
        renderer: 'svg'
      });
      console.log('Chart updated successfully');
    } catch (error) {
      console.error('Error updating chart:', error);
    }
    
    // Update stats
    const totalFiltered = filteredData.reduce((sum, d) => sum + d.count, 0);
    this.filteredPlayers.textContent = totalFiltered.toLocaleString();
    this.yearRange.textContent = `1834 - ${maxYear}`;
  }

  // Public method to initialize everything
  async init() {
    await this.loadYearData();
  }
}

// Initialize the Vega-Lite chart when the page loads
document.addEventListener('DOMContentLoaded', async () => {
  // Wait a bit to ensure all elements are ready
  setTimeout(async () => {
    const vegaTennisChart = new VegaTennisChart();
    await vegaTennisChart.init();
  }, 100);
});
