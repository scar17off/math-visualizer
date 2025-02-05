import React from 'react';
import { FaMousePointer, FaPen, FaEraser, FaSlash, FaDotCircle, FaFont, FaBezierCurve } from 'react-icons/fa';
import { TOOL_TYPES } from '../tools/Tools';
import './ToolsWindow.css';

const ToolsWindow = ({ currentTool, onToolSelect }) => {
  const tools = [
    { type: TOOL_TYPES.SELECT, icon: FaMousePointer, label: 'Select' },
    { type: TOOL_TYPES.PEN, icon: FaPen, label: 'Pen' },
    { type: TOOL_TYPES.ERASER, icon: FaEraser, label: 'Eraser' },
    { type: TOOL_TYPES.LINE, icon: FaSlash, label: 'Line' },
    { type: TOOL_TYPES.POINT, icon: FaDotCircle, label: 'Point' },
    { type: TOOL_TYPES.LABEL, icon: FaFont, label: 'Label' },
    { type: TOOL_TYPES.CURVE, icon: FaBezierCurve, label: 'Curve' }
  ];

  return (
    <div className="tools-window">
      {tools.map(tool => (
        <button
          key={tool.type}
          className={`tool-button ${currentTool === tool.type ? 'active' : ''}`}
          onClick={() => onToolSelect(tool.type)}
          title={tool.label}
        >
          <tool.icon />
        </button>
      ))}
    </div>
  );
};

export default ToolsWindow; 