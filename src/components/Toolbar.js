import React, { useState } from 'react';
import { FiEye } from 'react-icons/fi';
import './Toolbar.css';
import { i18n } from '../locales/i18n';

const Toolbar = ({ onToggleProperties }) => {
  const [activeMenu, setActiveMenu] = useState(null);

  const handleMenuClick = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleSubmenuClick = (action) => {
    action();
    setActiveMenu(null);
  };

  const menuItems = [
    { 
      label: i18n.t('menu.file'), 
      items: [
        { label: 'New', action: () => console.log('New'), shortcut: 'Ctrl+N' },
        { label: 'Save', action: () => console.log('Save'), shortcut: 'Ctrl+S' }
      ]
    },
    { 
      label: i18n.t('menu.edit'), 
      items: [
        { label: 'Undo', action: () => console.log('Undo'), shortcut: 'Ctrl+Z' },
        { label: 'Redo', action: () => console.log('Redo'), shortcut: 'Ctrl+Y' }
      ]
    },
    { 
      label: i18n.t('menu.view'), 
      items: [
        { 
          label: 'Properties', 
          action: onToggleProperties, 
          shortcut: 'Ctrl+P',
          icon: <FiEye />
        }
      ]
    }
  ];

  return (
    <div className="toolbar">
      <div className="toolbar-menu">
        {menuItems.map((menu, index) => (
          <div 
            key={index}
            className={`menu-item ${activeMenu === index ? 'active' : ''}`}
            onClick={() => handleMenuClick(index)}
          >
            <span>{menu.label}</span>
            {activeMenu === index && (
              <div className="submenu">
                {menu.items.map((item, itemIndex) => (
                  <div 
                    key={itemIndex}
                    className="submenu-item"
                    onClick={() => handleSubmenuClick(item.action)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.shortcut && <span className="shortcut">{item.shortcut}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Toolbar; 