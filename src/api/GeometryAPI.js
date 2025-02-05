const PIXELS_PER_CM = 50; 


const cmToPixels = (cm) => cm * PIXELS_PER_CM;


const pixelsToCm = (pixels) => pixels / PIXELS_PER_CM;

class GeometryAPI {
  constructor(renderer) {
    this.renderer = renderer;
  }

  createPoint(x, y, label = '') {
    
    const pixelX = cmToPixels(x);
    const pixelY = cmToPixels(y);
    
    const point = this.renderer.addPoint(pixelX, pixelY);
    if (label) point.label = label;
    
    
    point.getCmCoordinates = () => ({
      x: pixelsToCm(point.x),
      y: pixelsToCm(point.y)
    });
    
    return point;
  }

  connectPoints(point1, point2) {
    if (!point1 || !point2) {
      console.error('Both points must be provided');
      return null;
    }

    const line = this.renderer.addLine(point1.x, point1.y, point2.x, point2.y);
    
    
    line.getLengthCm = () => {
      const dx = line.x2 - line.x1;
      const dy = line.y2 - line.y1;
      const lengthPixels = Math.sqrt(dx * dx + dy * dy);
      return pixelsToCm(lengthPixels);
    };
    
    return line;
  }

  setPointLabel(point, label) {
    if (!point) {
      console.error('Point must be provided');
      return;
    }
    point.label = label;
  }

  toggleAngle(point) {
    if (!point) {
      console.error('Point must be provided');
      return;
    }
    point.showAngle = !point.showAngle;
  }

  getAllPoints() {
    const points = this.renderer.getPoints();
    
    points.forEach(point => {
      point.getCmCoordinates = () => ({
        x: pixelsToCm(point.x),
        y: pixelsToCm(point.y)
      });
    });
    return points;
  }

  clear() {
    this.renderer.drawingHistory.points = [];
    this.renderer.drawingHistory.lines = [];
    this.renderer.drawingHistory.strokes = [];
    this.renderer.drawingHistory.labels = [];
    this.renderer.drawingHistory.erasedAt.clear();
  }

  
  getDistance(point1, point2) {
    if (!point1 || !point2) {
      console.error('Both points must be provided');
      return null;
    }
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return pixelsToCm(Math.sqrt(dx * dx + dy * dy));
  }

  getAngle(point1, point2) {
    if (!point1 || !point2) {
      console.error('Both points must be provided');
      return null;
    }
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  }

  createLabel(position, text) {
    
    let pixelX, pixelY;
    
    if (position.x !== undefined && position.y !== undefined) {
      
      pixelX = cmToPixels(position.x);
      pixelY = cmToPixels(position.y);
    } else if (position.getCmCoordinates) {
      
      const coords = position.getCmCoordinates();
      pixelX = cmToPixels(coords.x);
      pixelY = cmToPixels(coords.y);
    } else {
      console.error('Invalid position provided');
      return null;
    }
    
    const label = {
      x: pixelX,
      y: pixelY,
      text: text,
      timestamp: Date.now()
    };
    
    this.renderer.drawingHistory.labels = this.renderer.drawingHistory.labels || [];
    this.renderer.drawingHistory.labels.push(label);
    
    return label;
  }

  
  removeLabel(label) {
    if (!label) return;
    this.renderer.drawingHistory.erasedAt.add(label.timestamp);
  }

  
  getLabels() {
    return (this.renderer.drawingHistory.labels || [])
      .filter(label => !this.renderer.drawingHistory.erasedAt.has(label.timestamp))
      .map(label => ({
        ...label,
        getCmCoordinates: () => ({
          x: pixelsToCm(label.x),
          y: pixelsToCm(label.y)
        })
      }));
  }
}


export const createGeometryAPI = (renderer) => {
  const api = new GeometryAPI(renderer);
  
  console.log('Geometry API available! All measurements are in centimeters.');
  console.log('Try these commands:');
  console.log('const p1 = geometryAPI.createPoint(2, 2, "A")  
  console.log('const p2 = geometryAPI.createPoint(4, 2, "B")  
  console.log('const line = geometryAPI.connectPoints(p1, p2)');
  console.log('line.getLengthCm()  
  console.log('p1.getCmCoordinates()  
  console.log('geometryAPI.getDistance(p1, p2)  
  console.log('geometryAPI.getAngle(p1, p2)  
  console.log('geometryAPI.toggleAngle(p1)');
  console.log('geometryAPI.getAllPoints()');
  console.log('geometryAPI.clear()');
  console.log('const label = geometryAPI.createLabel(2, 2, "Hello")  
  console.log('geometryAPI.getLabels()  
  console.log('geometryAPI.removeLabel(label)  

  return api;
}; 