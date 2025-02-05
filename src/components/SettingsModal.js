import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { i18n } from '../locales/i18n';
import './SettingsModal.css';

const LANGUAGES = [
  { code: 'en_US', label: 'English - US' },
  { code: 'uk_UA', label: 'Ukrainian - UA' },
  { code: 'ru_RU', label: 'Russian - RU' }
];

const UNITS = [
  { value: 'units', label: 'Grid Units' },
  { value: 'pixels', label: 'Pixels' },
  { value: 'cm', label: 'Centimeters' }
];

const SECTIONS = {
  general: {
    title: 'General Settings',
    keys: ['language', 'notebook']
  },
  display: {
    title: 'Display',
    keys: ['showGrid', 'showDots', 'showAngleMeasurements']
  },
  tools: {
    title: 'Tool Settings',
    subsections: {
      pen: {
        title: 'Pen Tool',
        keys: ['width', 'color', 'opacity']
      },
      eraser: {
        title: 'Eraser Tool',
        keys: ['radius', 'opacity']
      },
      point: {
        title: 'Point Tool',
        keys: ['radius', 'color']
      }
    }
  },
  appearance: {
    title: 'Appearance',
    subsections: {
      notebook: {
        title: 'Notebook',
        keys: ['gridSize', 'pageWidth', 'pageHeight', 'cornerRadius', 'measurementUnit']
      },
      colors: {
        title: 'Colors',
        keys: ['gridLines', 'marginLine', 'border', 'background', 'stroke', 'angle']
      },
      lines: {
        title: 'Lines',
        keys: ['gridLineWidth', 'gridLineBlur', 'marginLineWidth', 'marginLineBlur', 'borderWidth']
      }
    }
  }
};

const formatSettingName = (key) => {
  const translations = {
    angle: 'Angle Color',
    showAngleMeasurements: 'Show Angle Measurements',
    stroke: 'Stroke Color',
    
  };
  
  return translations[key] || key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

const SettingsModal = ({ isOpen, onClose, onApply, config }) => {
  const defaultConfig = {
    notebook: {
      gridSize: 25,
      pageWidth: 800,
      pageHeight: 1000,
      cornerRadius: 15,
      measurementUnit: 'cm'
    },
    display: {
      showGrid: true,
      showDots: true,
      showAngleMeasurements: true
    },
    colors: {
      gridLines: '#E2E8F0',
      marginLine: '#FF9999',
      border: '#000000',
      background: '#FFFFFF',
      stroke: '#000000',
      angle: '#4299e1'
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
    language: i18n.getCurrentLocale()
  };

  const [settings, setSettings] = useState(defaultConfig);

  useEffect(() => {
    if (config) {
      setSettings({
        ...defaultConfig,
        ...config,
        display: {
          ...defaultConfig.display,
          ...config.display
        },
        colors: {
          ...defaultConfig.colors,
          ...config.colors
        },
        lines: {
          ...defaultConfig.lines,
          ...config.lines
        },
        tools: {
          ...defaultConfig.tools,
          ...config.tools
        },
        notebook: {
          ...defaultConfig.notebook,
          ...config.notebook
        }
      });
    }
  }, [config]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(settings);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const updateNestedSetting = (path, value) => {
    console.log('Updating setting:', path, value); 
    const pathParts = path.split('.');
    setSettings(prev => {
      const newSettings = { ...prev };
      let current = newSettings;
      
      
      if (pathParts[0] === 'display') {
        newSettings.display = {
          ...prev.display,
          [pathParts[1]]: value
        };
        return newSettings;
      }
      
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
          current[pathParts[i]] = {};
        }
        current[pathParts[i]] = { ...current[pathParts[i]] };
        current = current[pathParts[i]];
      }
      
      current[pathParts[pathParts.length - 1]] = value;
      return newSettings;
    });
  };

  const renderSettingInput = (key, value, section) => {
    const fullPath = section ? `${section}.${key}` : key;
    
    if (typeof value === 'boolean') {
      return (
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={value}
            onChange={e => updateNestedSetting(fullPath, e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
      );
    }
    if (typeof value === 'number') {
      return (
        <input
          type="number"
          value={value}
          onChange={e => updateNestedSetting(fullPath, parseFloat(e.target.value))}
        />
      );
    }
    if (typeof value === 'string' && value.startsWith('#')) {
      return (
        <input
          type="color"
          value={value}
          onChange={e => updateNestedSetting(fullPath, e.target.value)}
        />
      );
    }
    return (
      <input
        type="text"
        value={value}
        onChange={e => updateNestedSetting(fullPath, e.target.value)}
      />
    );
  };

  const renderToolSection = (sectionName, sectionConfig) => {
    const subsection = SECTIONS.tools.subsections[sectionName];
    if (!subsection) {
      return null;
    }

    const toolConfig = settings.tools?.[sectionName];
    if (!toolConfig) return null;

    return (
      <div key={sectionName} className="tool-settings">
        <h4>{subsection.title}</h4>
        {Object.entries(toolConfig)
          .filter(([key]) => subsection.keys.includes(key))
          .map(([key, value]) => (
            <div key={key} className="settings-label">
              <span>{formatSettingName(key)}</span>
              {renderSettingInput(key, value, `tools.${sectionName}`)}
            </div>
          ))}
      </div>
    );
  };

  const renderAppearanceSection = (sectionName, sectionConfig) => {
    const subsection = SECTIONS.appearance.subsections[sectionName];
    if (!subsection) {
      return null;
    }

    return (
      <div key={sectionName} className="tool-settings">
        <h4>{subsection.title}</h4>
        {Object.entries(settings[sectionName] || {})
          .filter(([key]) => subsection.keys.includes(key))
          .map(([key, value]) => (
            <div key={key} className="settings-label">
              <span>{formatSettingName(key)}</span>
              {renderSettingInput(key, value, sectionName)}
            </div>
          ))}
      </div>
    );
  };

  const renderDisplaySection = () => {
    return (
      <div className="tool-settings">
        <h4>{i18n.t('settings.display.title')}</h4>
        {SECTIONS.display.keys.map(key => (
          <div key={key} className="settings-label">
            <span>{i18n.t(`settings.display.${key}`)}</span>
            {renderSettingInput(key, settings.display?.[key], 'display')}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* General Settings */}
        <div className="settings-section">
          <h3>{SECTIONS.general.title}</h3>
          <div className="settings-group">
            <label>Language</label>
            <select 
              value={settings.language}
              onChange={e => setSettings(prev => ({ ...prev, language: e.target.value }))}
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="settings-group">
            <label>Measurement Units</label>
            <select 
              value={settings.notebook?.measurementUnit}
              onChange={e => setSettings(prev => ({
                ...prev,
                notebook: { ...prev.notebook, measurementUnit: e.target.value }
              }))}
            >
              {UNITS.map(unit => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Display Settings */}
        <div className="settings-section">
          <h3>{i18n.t('settings.display.title')}</h3>
          {renderDisplaySection()}
        </div>

        {/* Tool Settings */}
        <div className="settings-section">
          <h3>{SECTIONS.tools.title}</h3>
          {Object.keys(SECTIONS.tools.subsections)
            .map(toolName => renderToolSection(toolName, settings.tools?.[toolName]))}
        </div>

        {/* Appearance Settings */}
        <div className="settings-section">
          <h3>{SECTIONS.appearance.title}</h3>
          {Object.keys(SECTIONS.appearance.subsections)
            .map(sectionName => renderAppearanceSection(sectionName, settings[sectionName]))}
        </div>

        <div className="settings-actions">
          <button onClick={handleCancel}>Cancel</button>
          <button onClick={handleApply}>Apply</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 