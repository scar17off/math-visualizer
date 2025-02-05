import React, { useState } from 'react';
import { FiBox, FiCircle, FiHash, FiMaximize2, FiChevronRight, FiChevronDown, FiCompass, FiType } from 'react-icons/fi';
import './PropertiesPanel.css';
import { i18n } from '../locales/i18n';

const PIXELS_PER_CM = 50; 

const formatValue = (value, unit) => {
  switch (unit) {
    case 'pixels':
      return `${value.toFixed(1)}px`;
    case 'cm':
      return `${(value / PIXELS_PER_CM).toFixed(2)}cm`;
    default:
      return `${(value / 25).toFixed(2)} units`;
  }
};

const calculateDistance = (p1, p2) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const calculatePolygonPerimeter = (points) => {
  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    perimeter += calculateDistance(p1, p2);
  }
  return perimeter;
};

const calculatePolygonArea = (points) => {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    area += (p1.x * p2.y - p2.x * p1.y);
  }
  return Math.abs(area) / 2;
};

const isRectangle = (points) => {
  if (points.length !== 4) return false;
  
  
  const sides = [];
  const diagonals = [];
  
  for (let i = 0; i < 4; i++) {
    sides.push(calculateDistance(points[i], points[(i + 1) % 4]));
  }
  diagonals.push(calculateDistance(points[0], points[2]));
  diagonals.push(calculateDistance(points[1], points[3]));
  
  
  const tolerance = 0.1;
  return Math.abs(sides[0] - sides[2]) < tolerance &&
         Math.abs(sides[1] - sides[3]) < tolerance &&
         Math.abs(diagonals[0] - diagonals[1]) < tolerance;
};

const isSquare = (points) => {
  if (!isRectangle(points)) return false;
  
  
  const sides = [];
  for (let i = 0; i < 4; i++) {
    sides.push(calculateDistance(points[i], points[(i + 1) % 4]));
  }
  
  
  const tolerance = 0.1;
  const firstSide = sides[0];
  return sides.every(side => Math.abs(side - firstSide) < tolerance);
};

const isTrapezoid = (points) => {
  if (points.length !== 4) return false;
  
  
  const slopes = [];
  for (let i = 0; i < 4; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % 4];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    slopes.push(Math.abs(dy / dx));
  }
  
  
  const tolerance = 0.1;
  return (Math.abs(slopes[0] - slopes[2]) < tolerance && 
          Math.abs(slopes[1] - slopes[3]) >= tolerance) ||
         (Math.abs(slopes[1] - slopes[3]) < tolerance && 
          Math.abs(slopes[0] - slopes[2]) >= tolerance);
};

const detectFigureType = (points) => {
  if (points.length === 3) return 'Triangle';
  if (points.length === 4) {
    if (isSquare(points)) return 'Square';
    if (isRectangle(points)) return 'Rectangle';
    if (isTrapezoid(points)) return 'Trapezoid';
  }
  if (points.length > 2) return 'Polygon';
  return null;
};

const findConnectedPoints = (selectedItems) => {
  console.log('Selected items:', selectedItems);
  
  
  const uniqueItems = selectedItems.reduce((acc, item) => {
    const key = item.type === 'point' ? 
      `${item.item.x},${item.item.y}` : 
      `${item.item.x1},${item.item.y1}-${item.item.x2},${item.item.y2}`;
    if (!acc.has(key)) {
      acc.set(key, item);
    }
    return acc;
  }, new Map());

  const items = Array.from(uniqueItems.values());
  const points = new Map();
  const lines = items.filter(item => item.type === 'line');
  const pointItems = items.filter(item => item.type === 'point');

  console.log('Found lines:', lines.length, 'points:', pointItems.length);

  
  pointItems.forEach(item => {
    const key = `${item.item.x},${item.item.y}`;
    if (!points.has(key)) {
      points.set(key, {
        point: { x: item.item.x, y: item.item.y },
        connections: new Set()
      });
    }
  });

  
  lines.forEach(line => {
    const startKey = `${line.item.x1},${line.item.y1}`;
    const endKey = `${line.item.x2},${line.item.y2}`;
    console.log('Processing line:', startKey, '->', endKey);

    
    if (!points.has(startKey)) {
      points.set(startKey, {
        point: { x: line.item.x1, y: line.item.y1 },
        connections: new Set()
      });
    }
    if (!points.has(endKey)) {
      points.set(endKey, {
        point: { x: line.item.x2, y: line.item.y2 },
        connections: new Set()
      });
    }

    
    points.get(startKey).connections.add(endKey);
    points.get(endKey).connections.add(startKey);
  });

  console.log('Points map:', Array.from(points.entries()));

  
  const findSimpleCycles = () => {
    const allPoints = Array.from(points.keys());
    if (allPoints.length < 3) return [];

    
    for (let i = 0; i < allPoints.length; i++) {
      const start = allPoints[i];
      const visited = new Set([start]);
      const path = [start];
      
      const findPath = (current, target, minLength) => {
        if (path.length >= minLength && points.get(current).connections.has(target)) {
          return [...path];
        }

        for (const next of points.get(current).connections) {
          if (!visited.has(next)) {
            visited.add(next);
            path.push(next);
            const result = findPath(next, target, minLength);
            if (result) return result;
            path.pop();
            visited.delete(next);
          }
        }
        return null;
      };

      
      const cycle = findPath(start, start, 3);
      if (cycle) {
        console.log('Found cycle:', cycle);
        return cycle;
      }
    }

    return [];
  };

  const cycle = findSimpleCycles();
  if (cycle.length > 0) {
    return cycle.map(key => points.get(key).point);
  }

  console.log('No valid shape found');
  return [];
};

const FORMULA_VARIANTS = {
  length: [
    { id: 'cartesian', formula: 'L = √(Δx² + Δy²)', name: 'Cartesian' },
    { id: 'parametric', formula: 'L = ∫₀¹ √(dx/dt)² + (dy/dt)² dt', name: 'Parametric' },
    { id: 'polar', formula: 'L = ∫ᵃᵇ √(r²+[dr/dθ]²) dθ', name: 'Polar' }
  ],
  angle: [
    { id: 'arctan', formula: 'θ = arctan(Δy/Δx)', name: 'Arctangent' },
    { id: 'cos', formula: 'θ = arccos(Δx/L)', name: 'Cosine' },
    { id: 'sin', formula: 'θ = arcsin(Δy/L)', name: 'Sine' }
  ],
  area: [
    { id: 'determinant', formula: 'A = ½|∑(xᵢyᵢ₊₁ - xᵢ₊₁yᵢ)|', name: 'Determinant' },
    { id: 'triangulation', formula: 'A = ∑½|xᵢ(yᵢ₊₁-yᵢ₋₁)|', name: 'Triangulation' },
    { id: 'green', formula: 'A = ∮(x dy - y dx)/2', name: "Green's Theorem" }
  ],
  perimeter: [
    { id: 'sum', formula: 'P = sum(sides)', name: 'Sum of Sides' },
    { id: 'integral', formula: 'P = ∮ ds', name: 'Line Integral' }
  ]
};

const PropertyItem = ({ prop, measurementUnit }) => {
  const [isVariantsOpen, setIsVariantsOpen] = React.useState(false);
  const [currentVariant, setCurrentVariant] = React.useState(0);
  const variants = FORMULA_VARIANTS[prop.formulaType] || [];

  
  const getCalculation = () => {
    if (!variants.length) return prop.calculation;

    const variant = variants[currentVariant];
    switch (variant.id) {
      case 'cartesian':
      case 'arctan':
      case 'sum':
      case 'determinant':
        return prop.calculation;
      
      case 'cos':
      case 'sin':
        
        if (Array.isArray(prop.calculation)) {
          const angle = prop.calculation[1].split('= ')[1]; 
          const length = prop.length || 1; 
          
          if (variant.id === 'cos') {
            return [
              `θ = arccos(Δx/L)`,
              `= ${angle}`
            ];
          } else {
            return [
              `θ = arcsin(Δy/L)`,
              `= ${angle}`
            ];
          }
        }
        return prop.calculation;

      case 'parametric':
        return [
          i18n.t('formulas.using.parametric'), 
          'L = ∫₀¹ √(dx/dt)² + (dy/dt)² dt', 
          prop.calculation.split('\n')[1]
        ];
        
      case 'polar':
        return [
          i18n.t('formulas.using.polar'), 
          'L = ∫ᵃᵇ √(r²+[dr/dθ]²) dθ', 
          prop.calculation.split('\n')[1]
        ];
        
      case 'triangulation':
        return [
          i18n.t('formulas.using.triangulation'), 
          'A = ∑½|xᵢ(yᵢ₊₁-yᵢ₋₁)|', 
          prop.calculation.split('\n')[1]
        ];
        
      case 'green':
        return [
          i18n.t('formulas.using.greensTheorem'), 
          'A = ∮(x dy - y dx)/2', 
          prop.calculation.split('\n')[1]
        ];
        
      case 'integral':
        return [
          i18n.t('formulas.using.lineIntegral'), 
          'P = ∮ ds', 
          prop.calculation.split('\n')[1]
        ];
        
      default:
        return prop.calculation;
    }
  };
  
  return (
    <div className="property-item">
      <div className="property-icon">{prop.icon}</div>
      <div className="property-info">
        <div className="property-header">
          <span className="property-label">{prop.label}</span>
          <div className="formula-container">
            <span className="property-formula">
              {variants.length > 0 ? variants[currentVariant].formula : prop.formula}
            </span>
            {variants.length > 0 && (
              <button 
                className={`formula-variants-toggle ${isVariantsOpen ? 'open' : ''}`}
                onClick={() => setIsVariantsOpen(!isVariantsOpen)}
              >
                {isVariantsOpen ? <FiChevronDown /> : <FiChevronRight />}
              </button>
            )}
          </div>
        </div>
        {isVariantsOpen && variants.length > 0 && (
          <div className="formula-variants">
            {variants.map((variant, index) => (
              <button
                key={variant.id}
                className={`variant-button ${index === currentVariant ? 'active' : ''}`}
                onClick={() => {
                  setCurrentVariant(index);
                  setIsVariantsOpen(false);
                }}
              >
                <span className="variant-name">{variant.name}</span>
                <span className="variant-formula">{variant.formula}</span>
              </button>
            ))}
          </div>
        )}
        <div className="property-calculation">
          {Array.isArray(getCalculation()) ? (
            getCalculation().map((line, i) => (
              <div key={i} className="calculation-line">
                {line}
              </div>
            ))
          ) : (
            getCalculation()
          )}
        </div>
      </div>
    </div>
  );
};

const formatCalculation = (type, value, unit) => {
  switch (type) {
    case 'perimeter':
      return `= ${formatValue(value, unit)}`;
    case 'area':
      return `= ${formatValue(value, unit)}²`;
    default:
      return `= ${formatValue(value, unit)}`;
  }
};

const PropertiesPanel = ({ isVisible, selectedItems, measurementUnit, renderer }) => {
  const [showAngle, setShowAngle] = useState(false);

  
  const calculateAngle = (points) => {
    if (points.length < 2) return null;
    
    const p1 = points[0];
    const p2 = points[1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    return angle;
  };

  const calculateProperties = () => {
    if (selectedItems.length === 1) {
      const item = selectedItems[0];
      switch (item.type) {
        case 'line':
          const dx = item.item.x2 - item.item.x1;
          const dy = item.item.y2 - item.item.y1;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          return {
            type: i18n.t('figures.line'),
            properties: [
              { 
                label: i18n.t('properties.length'),
                formulaType: 'length',
                formula: 'L = √(Δx² + Δy²)',
                calculation: [
                  `L = √((${dx.toFixed(0)})² + (${dy.toFixed(0)})²)`,
                  `= ${formatValue(length, measurementUnit)}`
                ],
                icon: <FiMaximize2 />
              },
              { 
                label: i18n.t('properties.angle'),
                formulaType: 'angle',
                formula: 'θ = arctan(Δy/Δx)',
                calculation: [
                  `θ = arctan(${dy.toFixed(0)}/${dx.toFixed(0)})`,
                  `= ${angle.toFixed(1)}°`
                ],
                icon: <FiHash />
              }
            ]
          };
        case 'point':
          return {
            type: i18n.t('figures.point'),
            properties: [
              { 
                label: i18n.t('properties.position'),
                formula: 'P(x, y)',
                calculation: `P(${formatValue(item.item.x, measurementUnit)}, ${formatValue(item.item.y, measurementUnit)})`,
                icon: <FiHash />
              }
            ]
          };
        default:
          return null;
      }
    } else if (selectedItems.length > 1) {
      const connectedPoints = findConnectedPoints(selectedItems);
      
      if (connectedPoints.length < 3) {
        return {
          type: i18n.t('figures.figure'),
          properties: [
            { 
              label: i18n.t('properties.info'),
              formula: i18n.t('properties.selectPoints'),
              calculation: i18n.t('properties.selectPointsHint'),
              icon: <FiBox />
            }
          ]
        };
      }

      const points = connectedPoints.map(point => ({
        x: point.x,
        y: point.y
      }));

      const figureType = detectFigureType(points);
      const perimeter = calculatePolygonPerimeter(points);
      const area = calculatePolygonArea(points);

      let properties = [
        {
          label: i18n.t('properties.perimeter'),
          formulaType: 'perimeter',
          formula: i18n.t('calculations.perimeter.sumOfSides'),
          calculation: `P = s₁ + s₂ + s₃\n${formatCalculation('perimeter', perimeter, measurementUnit)}`,
          icon: <FiMaximize2 />
        }
      ];

      
      const areaProperty = {
        label: i18n.t('properties.area'),
        formulaType: 'area',
        icon: <FiCircle />
      };

      switch (figureType) {
        case 'Square':
          const side = calculateDistance(points[0], points[1]);
          areaProperty.formula = i18n.t('calculations.area.square');
          areaProperty.calculation = `A = ${formatValue(side, measurementUnit)}²\n${formatCalculation('area', area, measurementUnit)}`;
          break;
        case 'Rectangle':
          const width = calculateDistance(points[0], points[1]);
          const height = calculateDistance(points[1], points[2]);
          areaProperty.formula = i18n.t('calculations.area.rectangle');
          areaProperty.calculation = `A = ${formatValue(width, measurementUnit)} × ${formatValue(height, measurementUnit)}\n${formatCalculation('area', area, measurementUnit)}`;
          break;
        case 'Trapezoid':
          const a = calculateDistance(points[0], points[1]);
          const b = calculateDistance(points[2], points[3]);
          const h = calculateHeight(points);
          areaProperty.formula = i18n.t('calculations.area.trapezoid');
          areaProperty.calculation = `A = ½(${formatValue(a, measurementUnit)} + ${formatValue(b, measurementUnit)}) × ${formatValue(h, measurementUnit)}\n${formatCalculation('area', area, measurementUnit)}`;
          break;
        default:
          areaProperty.formula = i18n.t('calculations.area.determinant');
          areaProperty.calculation = `A = ½|det(vertices)|\n${formatCalculation('area', area, measurementUnit)}`;
      }

      properties.push(areaProperty);

      return {
        type: i18n.t(`figures.${figureType.toLowerCase()}`),
        properties
      };
    }
    return null;
  };

  const props = calculateProperties();

  const promptForLabel = () => {
    const point = selectedItems[0]?.item;
    if (!point) return;
    
    const label = prompt(i18n.t('properties.enterLabel'), point.label || '');
    if (label !== null) {
      point.label = label;
    }
  };

  return (
    <div className={`properties-panel ${!isVisible ? 'hidden' : ''}`}>
      <div className="properties-header">
        <h2>{props?.type || i18n.t('properties.title')}</h2>
        <div className="header-buttons">
          {selectedItems.some(item => item.type === 'point') && (
            <>
              <button 
                className="tool-button"
                onClick={promptForLabel}
                title={i18n.t('properties.addLabel')}
              >
                <FiType />
              </button>
              <button 
                className={`angle-button ${
                  selectedItems.find(item => item.type === 'point')?.item.showAngle ? 'active' : ''
                }`}
                onClick={() => {
                  renderer.toggleAngles();
                  setShowAngle(!showAngle);
                }}
                title={i18n.t('properties.showAngle')}
              >
                <FiCompass />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="properties-content">
        {props ? (
          props.properties.map((prop, index) => (
            <PropertyItem key={index} prop={prop} measurementUnit={measurementUnit} />
          ))
        ) : (
          <div className="no-selection">{i18n.t('properties.noSelection')}</div>
        )}
      </div>
    </div>
  );
};


const calculateHeight = (points) => {
  
  const slopes = points.map((p, i) => {
    const nextP = points[(i + 1) % 4];
    return Math.atan2(nextP.y - p.y, nextP.x - p.x);
  });

  let parallelIndex = -1;
  for (let i = 0; i < 4; i++) {
    if (Math.abs(slopes[i] - slopes[(i + 2) % 4]) < 0.1) {
      parallelIndex = i;
      break;
    }
  }

  if (parallelIndex === -1) return 0;

  
  const a = calculateDistance(points[parallelIndex], points[(parallelIndex + 1) % 4]);
  const b = calculateDistance(points[(parallelIndex + 2) % 4], points[(parallelIndex + 3) % 4]);
  const area = calculatePolygonArea(points);
  return (2 * area) / (a + b);
};

export default PropertiesPanel; 