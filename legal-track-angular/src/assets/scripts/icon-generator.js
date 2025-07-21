// Icon Generator for Legal Flow
// This script generates various sized icons from the gavel symbol

class IconGenerator {
    constructor() {
      this.baseColor = '#1a237e';
      this.accentColor = '#ffd700';
      this.sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
    }
  
    // Create a canvas with the specified size
    createCanvas(size) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      return canvas;
    }
  
    // Draw the legal gavel icon
    drawGavelIcon(ctx, size) {
      const center = size / 2;
      const scale = size / 32; // Base scale for 32px icons
      
      // Clear canvas
      ctx.clearRect(0, 0, size, size);
      
      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, this.baseColor);
      gradient.addColorStop(1, '#3949ab');
      ctx.fillStyle = gradient;
      
      // Create rounded rectangle background
      this.roundRect(ctx, 0, 0, size, size, size * 0.15);
      ctx.fill();
      
      // Draw gavel symbol
      ctx.fillStyle = this.accentColor;
      ctx.font = `${size * 0.6}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add shadow effect
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = size * 0.1;
      ctx.shadowOffsetY = size * 0.05;
      
      // Draw the gavel symbol
      ctx.fillText('⚖', center, center);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }
  
    // Helper function to draw rounded rectangle
    roundRect(ctx, x, y, width, height, radius) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }
  
    // Generate favicon
    generateFavicon(size = 32) {
      const canvas = this.createCanvas(size);
      const ctx = canvas.getContext('2d');
      
      this.drawGavelIcon(ctx, size);
      
      return canvas.toDataURL('image/png');
    }
  
    // Generate Apple Touch Icon
    generateAppleTouchIcon() {
      const canvas = this.createCanvas(180);
      const ctx = canvas.getContext('2d');
      
      this.drawGavelIcon(ctx, 180);
      
      return canvas.toDataURL('image/png');
    }
  
    // Generate all required icon sizes
    generateAllIcons() {
      const icons = {};
      
      this.sizes.forEach(size => {
        const canvas = this.createCanvas(size);
        const ctx = canvas.getContext('2d');
        
        this.drawGavelIcon(ctx, size);
        
        icons[`icon-${size}x${size}`] = canvas.toDataURL('image/png');
      });
      
      return icons;
    }
  
    // Generate and download icons as files
    downloadIcons() {
      const icons = this.generateAllIcons();
      
      // Add special icons
      icons['favicon-32x32'] = this.generateFavicon(32);
      icons['favicon-16x16'] = this.generateFavicon(16);
      icons['apple-touch-icon'] = this.generateAppleTouchIcon();
      
      // Create download links for each icon
      Object.entries(icons).forEach(([name, dataUrl]) => {
        const link = document.createElement('a');
        link.download = `${name}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  
    // Update current page favicon
    updatePageFavicon() {
      const faviconDataUrl = this.generateFavicon(32);
      
      // Update existing favicon
      let favicon = document.querySelector('link[rel="icon"]');
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.type = 'image/png';
        document.head.appendChild(favicon);
      }
      favicon.href = faviconDataUrl;
      
      // Update shortcut icon
      let shortcutIcon = document.querySelector('link[rel="shortcut icon"]');
      if (!shortcutIcon) {
        shortcutIcon = document.createElement('link');
        shortcutIcon.rel = 'shortcut icon';
        shortcutIcon.type = 'image/png';
        document.head.appendChild(shortcutIcon);
      }
      shortcutIcon.href = faviconDataUrl;
    }
  
    // Generate shortcut icons for PWA
    generateShortcutIcons() {
      const shortcuts = {
        'shortcut-dashboard': { icon: '📊', color: '#2196f3' },
        'shortcut-clients': { icon: '👥', color: '#4caf50' },
        'shortcut-folders': { icon: '📁', color: '#ff9800' },
        'shortcut-users': { icon: '👤', color: '#9c27b0' }
      };
  
      const shortcutIcons = {};
  
      Object.entries(shortcuts).forEach(([name, config]) => {
        const canvas = this.createCanvas(96);
        const ctx = canvas.getContext('2d');
        
        // Background
        const gradient = ctx.createLinearGradient(0, 0, 96, 96);
        gradient.addColorStop(0, config.color);
        gradient.addColorStop(1, this.adjustColor(config.color, -20));
        ctx.fillStyle = gradient;
        this.roundRect(ctx, 0, 0, 96, 96, 16);
        ctx.fill();
        
        // Icon
        ctx.fillStyle = '#ffffff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(config.icon, 48, 48);
        
        shortcutIcons[name] = canvas.toDataURL('image/png');
      });
  
      return shortcutIcons;
    }
  
    // Helper function to adjust color brightness
    adjustColor(color, amount) {
      const usePound = color[0] === '#';
      const col = usePound ? color.slice(1) : color;
      const num = parseInt(col, 16);
      let r = (num >> 16) + amount;
      let g = (num >> 8 & 0x00FF) + amount;
      let b = (num & 0x0000FF) + amount;
      r = r > 255 ? 255 : r < 0 ? 0 : r;
      g = g > 255 ? 255 : g < 0 ? 0 : g;
      b = b > 255 ? 255 : b < 0 ? 0 : b;
      return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
    }
  }
  
  // Usage instructions and initialization
  console.log('Legal Flow Icon Generator Ready!');
  console.log('Usage:');
  console.log('const generator = new IconGenerator();');
  console.log('generator.updatePageFavicon(); // Update current page favicon');
  console.log('generator.downloadIcons(); // Download all icon sizes');
  
  // Auto-update favicon when script loads
  if (typeof window !== 'undefined') {
    const generator = new IconGenerator();
    
    // Update favicon immediately
    generator.updatePageFavicon();
    
    // Make generator available globally for manual use
    window.LegalFlowIconGenerator = generator;
    
    console.log('✅ Favicon updated! Legal Flow icon is now active.');
    console.log('💡 Use window.LegalFlowIconGenerator.downloadIcons() to download all icon files.');
  }