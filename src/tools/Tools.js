import { StrokeEffect, PointEffect, LineEffect, EraserEffect } from './Effects';

export const TOOL_TYPES = {
  SELECT: 'select',
  PEN: 'pen',
  ERASER: 'eraser',
  LINE: 'line',
  POINT: 'point',
  LABEL: 'label',
  CURVE: 'curve'
};

class Tool {
  constructor(renderer) {
    this.renderer = renderer;
    this.isActive = false;
    this.startX = 0;
    this.startY = 0;
  }

  onMouseDown(x, y) {}
  onMouseMove(x, y) {}
  onMouseUp(x, y) {}
  draw(ctx) {}
}

export class SelectTool extends Tool {
  constructor(renderer) {
    super(renderer);
    this.selectedItems = [];
    this.modifiers = {};
    this.onSelectionChange = null;
  }

  activate() {
    super.activate();
    this.updateSelection(this.selectedItems);
  }

  updateSelection(newSelection) {
    this.selectedItems = newSelection;
    if (this.onSelectionChange) {
      console.log('Selection updated:', this.selectedItems);
      this.onSelectionChange([...this.selectedItems]);
    }
  }

  findConnectedItems(startItem) {
    const connected = new Set();
    const toVisit = [startItem];
    
    while (toVisit.length > 0) {
      const current = toVisit.pop();
      const key = current.type === 'point' ? 
        `${current.item.x},${current.item.y}` : 
        `${current.item.x1},${current.item.y1}-${current.item.x2},${current.item.y2}`;
      
      if (connected.has(key)) continue;
      connected.add(key);

      
      const { points, lines } = this.renderer.drawingHistory;
      
      if (current.type === 'point') {
        
        lines.forEach(line => {
          if (this.renderer.drawingHistory.erasedAt.has(line.timestamp)) return;
          
          if ((line.x1 === current.item.x && line.y1 === current.item.y) ||
              (line.x2 === current.item.x && line.y2 === current.item.y)) {
            toVisit.push({ type: 'line', item: line });
            
            
            const otherPoint = points.find(p => 
              !this.renderer.drawingHistory.erasedAt.has(p.timestamp) &&
              ((line.x1 === p.x && line.y1 === p.y) || 
               (line.x2 === p.x && line.y2 === p.y)) &&
              !(p.x === current.item.x && p.y === current.item.y)
            );
            if (otherPoint) {
              toVisit.push({ type: 'point', item: otherPoint });
            }
          }
        });
      } else if (current.type === 'line') {
        
        points.forEach(point => {
          if (this.renderer.drawingHistory.erasedAt.has(point.timestamp)) return;
          
          if ((point.x === current.item.x1 && point.y === current.item.y1) ||
              (point.x === current.item.x2 && point.y === current.item.y2)) {
            toVisit.push({ type: 'point', item: point });
          }
        });
      }
    }

    
    const result = [];
    const seen = new Set();
    
    const { points, lines } = this.renderer.drawingHistory;
    points.forEach(point => {
      const key = `${point.x},${point.y}`;
      if (connected.has(key) && !seen.has(key)) {
        seen.add(key);
        result.push({ type: 'point', item: point });
      }
    });
    
    lines.forEach(line => {
      const key = `${line.x1},${line.y1}-${line.x2},${line.y2}`;
      if (connected.has(key) && !seen.has(key)) {
        seen.add(key);
        result.push({ type: 'line', item: line });
      }
    });

    return result;
  }

  findConnectedLines(point) {
    return this.renderer.drawingHistory.lines.filter(line => 
      (Math.abs(line.x1 - point.x) < 1 && Math.abs(line.y1 - point.y) < 1) ||
      (Math.abs(line.x2 - point.x) < 1 && Math.abs(line.y2 - point.y) < 1)
    );
  }

  handleSelection(x, y) {
    const threshold = 10;
    const { points, lines, strokes } = this.renderer.drawingHistory;
    let selectedItem = null;

    
    for (const point of points) {
      if (!this.renderer.drawingHistory.erasedAt.has(point.timestamp) && 
          point.isNearPoint(x, y, threshold)) {
        selectedItem = { type: 'point', item: point };
        
        const connectedLines = this.findConnectedLines(point);
        
        if (this.modifiers.shift) {
          
          const newSelection = [...this.selectedItems];
          if (!newSelection.some(item => item.type === 'point' && item.item === point)) {
            newSelection.push(selectedItem);
            newSelection.push(...connectedLines.map(line => ({ type: 'line', item: line })));
          }
          this.updateSelection(newSelection);
        } else if (this.modifiers.ctrl) {
          
          const existingIndex = this.selectedItems.findIndex(
            item => item.type === 'point' && item.item === point
          );
          if (existingIndex === -1) {
            this.updateSelection([
              ...this.selectedItems,
              selectedItem,
              ...connectedLines.map(line => ({ type: 'line', item: line }))
            ]);
          } else {
            const newSelection = this.selectedItems.filter(
              item => !(item.type === 'point' && item.item === point)
            );
            this.updateSelection(newSelection);
          }
        } else {
          
          this.updateSelection([
            selectedItem,
            ...connectedLines.map(line => ({ type: 'line', item: line }))
          ]);
        }
        break;
      }
    }

    
    if (!selectedItem) {
      
      for (const line of lines) {
        if (!this.renderer.drawingHistory.erasedAt.has(line.timestamp) && 
            line.isNearPoint(x, y, threshold)) {
          selectedItem = { type: 'line', item: line };
          this.updateSelection(this.modifiers.ctrl ? 
            [...this.selectedItems, selectedItem] : [selectedItem]);
          break;
        }
      }

      
      if (!selectedItem) {
        for (const stroke of strokes) {
          if (!this.renderer.drawingHistory.erasedAt.has(stroke.timestamp) && 
              stroke.isNearPoint(x, y, threshold)) {
            selectedItem = { type: 'stroke', item: stroke };
            this.updateSelection(this.modifiers.ctrl ? 
              [...this.selectedItems, selectedItem] : [selectedItem]);
            break;
          }
        }
      }
    }

    
    if (!selectedItem && !this.modifiers.ctrl && !this.modifiers.shift) {
      this.updateSelection([]);
    }
  }

  onMouseDown(x, y, modifiers) {
    this.modifiers = modifiers;
    this.handleSelection(x, y);
  }

  draw(ctx) {
    this.selectedItems.forEach(({ type, item }) => {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 120, 255, 0.8)';
      ctx.lineWidth = 2;

      switch (type) {
        case 'point':
          ctx.beginPath();
          ctx.arc(item.x, item.y, 6, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case 'line':
          ctx.beginPath();
          ctx.moveTo(item.x1, item.y1);
          ctx.lineTo(item.x2, item.y2);
          ctx.stroke();
          break;
        case 'stroke':
          ctx.beginPath();
          ctx.moveTo(item.points[0][0], item.points[0][1]);
          item.points.slice(1).forEach(point => {
            ctx.lineTo(point[0], point[1]);
          });
          ctx.stroke();
          break;
      }
      ctx.restore();
    });
  }
}

export class PenTool extends Tool {
  constructor(renderer) {
    super(renderer);
    this.points = [];
    this.fx = {
      stroke: {
        color: '#000000',
        width: 2,
        style: 'smooth',
        opacity: 1
      }
    };
  }

  onMouseDown(x, y) {
    this.isActive = true;
    this.points = [[x, y]];
  }

  onMouseMove(x, y) {
    if (this.isActive) {
      this.points.push([x, y]);
    }
  }

  onMouseUp() {
    this.isActive = false;
    if (this.points.length > 1) {
      this.renderer.addStroke(this.points, this.fx.stroke);
    }
  }

  draw(ctx) {
    if (this.points.length < 2) return;
    new StrokeEffect(this.points, this.fx.stroke).apply(ctx);
  }
}

export class EraserTool extends Tool {
  constructor(renderer) {
    super(renderer);
    this.fx = {
      preview: {
        color: '#000000',
        width: 2,
        radius: 20,
        opacity: 0.8
      }
    };
  }

  onMouseDown(x, y) {
    this.isActive = true;
    this.startX = x;
    this.startY = y;
    this.erase(x, y);
  }

  onMouseMove(x, y) {
    this.startX = x;
    this.startY = y;
    if (this.isActive) {
      this.erase(x, y);
    }
  }

  onMouseUp() {
    this.isActive = false;
  }

  erase(x, y) {
    this.renderer.eraseAt(x, y, this.fx.preview.radius);
  }

  draw(ctx) {
    if (this.startX === undefined) return;
    new EraserEffect(this.startX, this.startY, this.fx.preview).apply(ctx);
  }
}

export class LineTool extends Tool {
  constructor(renderer) {
    super(renderer);
    this.snapRadius = renderer.GRID_SIZE * 0.8;
    this.startPoint = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.fx = {
      line: {
        color: '#000000',
        width: 2,
        style: 'solid'
      },
      preview: {
        color: '#666666',
        width: 1,
        style: 'dashed',
        opacity: 0.5
      }
    };
  }

  findNearestPoint(x, y) {
    const points = this.renderer.getPoints();
    let nearest = null;
    let minDistSq = this.snapRadius * this.snapRadius;

    for (const point of points) {
      const dx = point.x - x;
      const dy = point.y - y;
      const distSq = dx * dx + dy * dy;
      
      if (distSq < minDistSq) {
        minDistSq = distSq;
        nearest = point;
      }
    }

    return nearest;
  }

  onMouseDown(x, y) {
    const nearestPoint = this.findNearestPoint(x, y);
    if (!nearestPoint) return;

    if (!this.startPoint) {
      this.startPoint = nearestPoint;
    } else {
      if (nearestPoint !== this.startPoint) {
        this.renderer.addLine(
          this.startPoint.x, this.startPoint.y,
          nearestPoint.x, nearestPoint.y,
          this.fx.line
        );
        this.startPoint = null;
      }
    }
  }

  onMouseMove(x, y) {
    this.mouseX = x;
    this.mouseY = y;
  }

  draw(ctx) {
    if (this.startPoint) {
      const nearestPoint = this.findNearestPoint(this.mouseX, this.mouseY);
      if (nearestPoint && nearestPoint !== this.startPoint) {
        new LineEffect(
          this.startPoint.x, this.startPoint.y,
          nearestPoint.x, nearestPoint.y,
          this.fx.preview
        ).apply(ctx);
      }
    }
  }

  cancel() {
    this.startPoint = null;
  }
}

export class PointTool extends Tool {
  constructor(renderer) {
    super(renderer);
    this.fx = {
      point: {
        color: '#000000',
        radius: 4,
        fill: true,
        stroke: false
      },
      preview: {
        color: '#000000',
        radius: 4,
        fill: true,
        stroke: false,
        opacity: 0.3
      }
    };
  }

  getGridStep(modifiers = {}) {
    const baseStep = this.renderer.GRID_SIZE;
    if (modifiers.shift) return baseStep * 0.25;
    if (modifiers.ctrl) return baseStep * 0.5;
    return baseStep;
  }

  findSnapPoint(x, y, modifiers = {}) {
    const gridStep = this.getGridStep(modifiers);
    const snapX = Math.round(x / gridStep) * gridStep;
    const snapY = Math.round(y / gridStep) * gridStep;
    return [snapX, snapY];
  }

  onMouseDown(x, y, modifiers) {
    const [snapX, snapY] = this.findSnapPoint(x, y, modifiers);
    this.renderer.addPoint(snapX, snapY, this.fx.point);
  }

  onMouseMove(x, y, modifiers) {
    const [snapX, snapY] = this.findSnapPoint(x, y, modifiers);
    this.startX = snapX;
    this.startY = snapY;
  }

  draw(ctx) {
    if (this.startX === undefined) return;
    new PointEffect(this.startX, this.startY, this.fx.preview).apply(ctx);
  }
}

export class LabelTool extends Tool {
  constructor(renderer) {
    super(renderer);
    this.text = '';
    this.isEditing = false;
    this.editX = 0;
    this.editY = 0;
    this.input = null;
    this.previewX = 0;
    this.previewY = 0;
    this.fx = {
      preview: {
        color: '#666666',
        opacity: 0.5
      }
    };
  }

  onMouseDown(x, y) {
    if (this.isEditing) return;
    
    this.isEditing = true;
    this.editX = x;
    this.editY = y;

    
    const input = document.createElement('input');
    input.type = 'text';
    input.style.position = 'fixed';
    
    
    const rect = this.renderer.canvas.getBoundingClientRect();
    const screenPos = this.renderer.camera.worldToScreen(x, y);
    
    
    const canvasX = screenPos.x + rect.left;
    const canvasY = screenPos.y + rect.top;
    
    input.style.left = `${canvasX}px`;
    input.style.top = `${canvasY}px`;
    input.style.transform = 'translate(-50%, -50%)';
    
    input.style.background = 'white';
    input.style.border = '1px solid #ccc';
    input.style.padding = '4px';
    input.style.zIndex = '1000';

    input.addEventListener('blur', () => this.commitLabel());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.commitLabel();
      } else if (e.key === 'Escape') {
        this.cancelLabel();
      }
    });

    document.body.appendChild(input);
    input.focus();
    this.input = input;
  }

  commitLabel() {
    if (!this.input) return;
    
    const text = this.input.value.trim();
    if (text) {
      this.renderer.drawingHistory.labels = this.renderer.drawingHistory.labels || [];
      this.renderer.drawingHistory.labels.push({
        x: this.editX,
        y: this.editY,
        text,
        timestamp: Date.now()
      });
    }
    
    this.cancelLabel();
  }

  cancelLabel() {
    if (this.input) {
      this.input.remove();
      this.input = null;
    }
    this.isEditing = false;
  }

  draw(ctx) {
    if (!this.isEditing) {
      ctx.save();
      
      
      ctx.strokeStyle = this.fx.preview.color;
      ctx.fillStyle = this.fx.preview.color;
      ctx.globalAlpha = this.fx.preview.opacity;
      
      
      ctx.beginPath();
      ctx.moveTo(this.previewX, this.previewY - 10);
      ctx.lineTo(this.previewX, this.previewY + 10);
      ctx.stroke();
      
      
      ctx.beginPath();
      ctx.moveTo(this.previewX - 5, this.previewY - 10);
      ctx.lineTo(this.previewX + 5, this.previewY - 10);
      ctx.moveTo(this.previewX - 5, this.previewY + 10);
      ctx.lineTo(this.previewX + 5, this.previewY + 10);
      ctx.stroke();
      
      
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('T', this.previewX, this.previewY - 15);
      
      ctx.restore();
    }
  }

  onMouseMove(x, y) {
    if (!this.isEditing) {
      this.previewX = x;
      this.previewY = y;
    }
  }
}

export class CurveTool extends Tool {
  constructor(renderer) {
    super(renderer);
    this.points = [];  
    this.isDragging = false;
    this.previewPoint = null;
    this.fx = {
      curve: {
        color: '#000000',
        width: 2
      },
      preview: {
        color: '#666666',
        width: 1,
        opacity: 0.5
      },
      hover: {
        color: '#4299e1',
        radius: 6,
        opacity: 0.3
      }
    };
  }

  findNearestPoint(x, y) {
    const points = this.renderer.drawingHistory.points;
    let nearest = null;
    let minDistSq = 100; 

    for (const point of points) {
      if (this.renderer.drawingHistory.erasedAt.has(point.timestamp)) continue;
      
      const dx = point.x - x;
      const dy = point.y - y;
      const distSq = dx * dx + dy * dy;
      
      if (distSq < minDistSq) {
        minDistSq = distSq;
        nearest = point;
      }
    }

    return nearest;
  }

  onMouseDown(x, y) {
    const nearestPoint = this.findNearestPoint(x, y);
    if (!nearestPoint) return;

    if (!this.isDragging) {
      this.isDragging = true;
      this.points = [nearestPoint];
    }
  }

  onMouseMove(x, y) {
    this.previewPoint = this.findNearestPoint(x, y);
    
    if (this.isDragging && this.previewPoint) {
      
      const lastPoint = this.points[this.points.length - 1];
      if (this.previewPoint !== lastPoint) {
        this.points.push(this.previewPoint);
      }
    }
  }

  onMouseUp() {
    if (this.isDragging && this.points.length >= 2) {
      this.commitCurve();
    }
    this.isDragging = false;
    this.points = [];
  }

  commitCurve() {
    if (this.points.length < 2) return;

    
    const segments = this.createSmoothCurve(this.points);
    
    for (const segment of segments) {
      this.renderer.addCurve(
        segment.x1, segment.y1,
        segment.cp1x, segment.cp1y,
        segment.cp2x, segment.cp2y,
        segment.x2, segment.y2,
        this.fx.curve
      );
    }
  }

  createSmoothCurve(points) {
    if (points.length < 2) return [];

    
    const segments = [];
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[0];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i < points.length - 2 ? points[i + 2] : p2;

      
      const tension = 0.25;
      
      
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      
      
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      segments.push({
        x1: p1.x,
        y1: p1.y,
        cp1x, cp1y,
        cp2x, cp2y,
        x2: p2.x,
        y2: p2.y
      });
    }

    return segments;
  }

  draw(ctx) {
    ctx.save();
    
    
    if (this.previewPoint && !this.isDragging) {
      ctx.beginPath();
      ctx.fillStyle = this.fx.hover.color;
      ctx.globalAlpha = this.fx.hover.opacity;
      ctx.arc(
        this.previewPoint.x,
        this.previewPoint.y,
        this.fx.hover.radius,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    
    if (this.points.length >= 2) {
      ctx.strokeStyle = this.fx.preview.color;
      ctx.lineWidth = this.fx.preview.width;
      ctx.globalAlpha = this.fx.preview.opacity;

      const segments = this.createSmoothCurve(
        this.previewPoint ? 
          [...this.points, this.previewPoint] : 
          this.points
      );

      for (const segment of segments) {
        ctx.beginPath();
        ctx.moveTo(segment.x1, segment.y1);
        ctx.bezierCurveTo(
          segment.cp1x, segment.cp1y,
          segment.cp2x, segment.cp2y,
          segment.x2, segment.y2
        );
        ctx.stroke();
      }

      
      this.points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.stroke();
      });
    }
    
    ctx.restore();
  }

  cancel() {
    this.isDragging = false;
    this.points = [];
    this.previewPoint = null;
  }
} 