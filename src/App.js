import React, { useState, useEffect, useRef } from 'react';
import { FiSettings } from 'react-icons/fi';
import PageControl from './components/PageControl';
import SettingsModal from './components/SettingsModal';
import Config from './config/Config';
import './App.css';
import Renderer from './renderer/Renderer';
import ToolsWindow from './components/ToolsWindow';
import { TOOL_TYPES } from './tools/Tools';
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';
import { i18n } from './locales/i18n';
import { createGeometryAPI } from './api/GeometryAPI';

function App() {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const [currentTool, setCurrentTool] = useState(TOOL_TYPES.PEN);
  const [pageCount, setPageCount] = useState(2);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [config, setConfig] = useState(Config.load());
  const [isPropertiesPanelVisible, setIsPropertiesPanelVisible] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [settings, setSettings] = useState({
    measurementUnit: 'units',
    language: i18n.getCurrentLocale()
  });
  const [rendererInstance, setRendererInstance] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!rendererRef.current) {
      rendererRef.current = new Renderer(canvas);
      setRendererInstance(rendererRef.current);
    }

    const handleResize = () => rendererRef.current.resizeCanvas();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setTool(currentTool);
      if (rendererRef.current?.tools?.select) {
        const selectTool = rendererRef.current.tools.select;
        const currentSelection = selectTool.selectedItems;
        setSelectedItems(currentSelection);
      }
    }
  }, [currentTool]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.pageCount = pageCount;
    }
  }, [pageCount]);

  useEffect(() => {
    if (rendererRef.current?.tools?.select) {
      const selectTool = rendererRef.current.tools.select;
      selectTool.onSelectionChange = (items) => {
        setSelectedItems(items);
      };
    }
  }, []);

  useEffect(() => {
    const savedConfig = Config.load();
    setConfig(savedConfig);
    i18n.setLocale(savedConfig.language || 'en_US');
  }, []);

  useEffect(() => {
    if (rendererRef.current) {
      window.geometryAPI = createGeometryAPI(rendererRef.current);
    }
  }, [rendererRef.current]);

  useEffect(() => {
    const isDarkMode = config?.display?.darkMode;
    console.log('Dark mode state:', isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [config?.display?.darkMode]);

  const handlePageCountChange = (newCount) => {
    setPageCount(newCount);
  };

  const handleSettingsApply = (newSettings) => {
    console.log('New settings being applied:', newSettings);
    Config.save(newSettings);
    setConfig(newSettings);
    
    i18n.setLocale(newSettings.language);
    setIsSettingsOpen(false);

    if (rendererRef.current) {
      rendererRef.current.updateConfig(newSettings);
    }
  };

  return (
    <div className="App">
      <Toolbar 
        key={`toolbar-${i18n.getCurrentLocale()}`}
        onToggleProperties={() => setIsPropertiesPanelVisible(prev => !prev)}
        isPropertiesPanelVisible={isPropertiesPanelVisible}
      />
      <canvas ref={canvasRef} />
      <PropertiesPanel 
        key={`properties-${i18n.getCurrentLocale()}`}
        isVisible={isPropertiesPanelVisible}
        selectedItems={selectedItems}
        measurementUnit={config.notebook.measurementUnit}
        renderer={rendererInstance}
      />
      <PageControl 
        key={`pagecontrol-${i18n.getCurrentLocale()}`}
        pageCount={pageCount} 
        onPageCountChange={handlePageCountChange}
      />
      <ToolsWindow currentTool={currentTool} onToolSelect={setCurrentTool} />
      <button 
        className="settings-button"
        onClick={() => setIsSettingsOpen(true)}
      >
        <FiSettings size={24} />
      </button>
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onApply={handleSettingsApply}
        config={config}
      />
    </div>
  );
}

export default App;
