import { TOOL_TYPES } from '../tools/Tools';

export default class Config {
  static DEFAULT_CONFIG = {
    notebook: {
      gridSize: 25,
      pageWidth: 800,
      pageHeight: 1000,
      cornerRadius: 15,
      defaultPageCount: 2,
      maxPages: 10,
      measurementUnit: 'cm'
    },
    display: {
      showDots: true,
      showGrid: true,
      showAngleMeasurements: true
    },
    colors: {
      gridLines: '#E2E8F0',
      marginLine: '#FF9999',
      border: '#000000',
      background: '#FFFFFF',
      stroke: '#000000',
      angle: '#000000'
    },
    lines: {
      gridLineWidth: 0.8,
      gridLineBlur: 0.8,
      marginLineWidth: 1.5,
      marginLineBlur: 1.2,
      borderWidth: 1
    },
    tools: {
      pen: {
        width: 2,
        color: '#0062ff',
        opacity: 1
      },
      eraser: {
        radius: 20,
        opacity: 0.8
      },
      point: {
        radius: 4,
        color: '#000000'
      }
    },
    language: 'en_US'
  };

  static load() {
    const savedConfig = localStorage.getItem('appConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
    return this.DEFAULT_CONFIG;
  }

  static save(config) {
    localStorage.setItem('appConfig', JSON.stringify(config));
  }
} 