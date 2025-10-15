/**
 * Performance monitoring and analytics
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      conversionTimes: [],
      fileSizes: [],
      errorCounts: 0,
      successCounts: 0
    };
  }

  startTiming(label) {
    performance.mark(`${label}-start`);
  }

  endTiming(label) {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    
    const measure = performance.getEntriesByName(label)[0];
    this.metrics.conversionTimes.push({
      label,
      duration: measure.duration,
      timestamp: Date.now()
    });
    
    return measure.duration;
  }

  recordSuccess(fileSize) {
    this.metrics.successCounts++;
    this.metrics.fileSizes.push(fileSize);
  }

  recordError() {
    this.metrics.errorCounts++;
  }

  getStats() {
    const avgConversionTime = this.metrics.conversionTimes.length > 0
      ? this.metrics.conversionTimes.reduce((sum, m) => sum + m.duration, 0) / this.metrics.conversionTimes.length
      : 0;

    const avgFileSize = this.metrics.fileSizes.length > 0
      ? this.metrics.fileSizes.reduce((sum, size) => sum + size, 0) / this.metrics.fileSizes.length
      : 0;

    return {
      totalConversions: this.metrics.successCounts + this.metrics.errorCounts,
      successRate: this.metrics.successCounts / (this.metrics.successCounts + this.metrics.errorCounts) * 100,
      avgConversionTime: Math.round(avgConversionTime),
      avgFileSize: Math.round(avgFileSize),
      ...this.metrics
    };
  }
}

/**
 * Privacy-friendly analytics (no personal data)
 */
export class Analytics {
  constructor() {
    this.events = [];
    this.isEnabled = this.checkConsent();
  }

  checkConsent() {
    return localStorage.getItem('analytics-consent') === 'true';
  }

  requestConsent() {
    const consent = confirm('Would you like to help improve this tool by sharing anonymous usage statistics? No personal data is collected.');
    localStorage.setItem('analytics-consent', consent.toString());
    this.isEnabled = consent;
    return consent;
  }

  track(event, data = {}) {
    if (!this.isEnabled) return;

    const eventData = {
      event,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      screen: {
        width: screen.width,
        height: screen.height
      },
      ...data
    };

    this.events.push(eventData);
    
    // In a real app, you might send this to your analytics service
    console.log('Analytics Event:', eventData);
    
    // Store locally for now
    this.saveToLocal();
  }

  saveToLocal() {
    try {
      const stored = JSON.parse(localStorage.getItem('analytics-events') || '[]');
      const allEvents = [...stored, ...this.events].slice(-100); // Keep last 100 events
      localStorage.setItem('analytics-events', JSON.stringify(allEvents));
      this.events = [];
    } catch (error) {
      console.warn('Failed to save analytics data:', error);
    }
  }

  getLocalData() {
    try {
      return JSON.parse(localStorage.getItem('analytics-events') || '[]');
    } catch (error) {
      return [];
    }
  }
}