import { Point } from '../items/DrawableItem';

class Effect {
  constructor(fx = {}) {
    this.fx = {
      color: fx.color || '#000000',
      width: fx.width || 2,
      opacity: fx.opacity || 1,
      blur: fx.blur || 0.8,
      radius: fx.radius || 4,
      style: fx.style || 'solid'
    };
  }

  apply(ctx) {
    ctx.save();
    this.setupContext(ctx);
    this.render(ctx);
    ctx.restore();
  }

  setupContext(ctx) {
    ctx.globalAlpha = this.fx.opacity;
    ctx.strokeStyle = this.fx.color;
    ctx.fillStyle = this.fx.color;
    ctx.lineWidth = this.fx.width;
  }

  render(ctx) {
    
  }
}

export class StrokeEffect extends Effect {
  constructor(points, fx = {}) {
    super(fx);
    this.points = points;
  }

  apply(ctx) {
    if (!this.points.length) return;

    
    const layers = 3;
    for (let i = 0; i < layers; i++) {
      ctx.beginPath();
      ctx.strokeStyle = this.fx.color;
      ctx.lineWidth = this.fx.width + (i * this.fx.blur);
      ctx.globalAlpha = this.fx.opacity / (i + 1);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      
      ctx.moveTo(this.points[0][0], this.points[0][1]);

      
      for (let j = 1; j < this.points.length; j++) {
        ctx.lineTo(this.points[j][0], this.points[j][1]);
      }

      ctx.stroke();
    }
    
    
    ctx.globalAlpha = 1;
  }
}

export class PointEffect extends Effect {
  constructor(x, y, fx = {}) {
    super(fx);
    this.x = x;
    this.y = y;
    this.fx = {
      ...this.fx,
      radius: fx.radius || 4,
      showAngle: fx.showAngle || false,
      label: fx.label,
      renderer: fx.renderer
    };
  }

  apply(ctx) {
    ctx.save();
    ctx.globalAlpha = this.fx.opacity;
    
    
    const point = new Point(this.x, this.y);
    point.showAngle = this.fx.showAngle;
    point.label = this.fx.label;
    point.renderer = this.fx.renderer;
    
    
    const layers = 3;
    for (let i = 0; i < layers; i++) {
      point.draw(ctx, {
        ...this.fx,
        radius: this.fx.radius + (i * this.fx.blur)
      });
      ctx.globalAlpha = this.fx.opacity / (i + 1);
    }
    
    
    ctx.globalAlpha = 1;
    if (point.label || point.showAngle) {
      point.draw(ctx, this.fx);
    }
    
    ctx.restore();
  }
}

export class LineEffect extends Effect {
  constructor(x1, y1, x2, y2, fx = {}) {
    super(fx);
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  apply(ctx) {
    
    const layers = 3;
    for (let i = 0; i < layers; i++) {
      ctx.beginPath();
      ctx.strokeStyle = this.fx.color;
      ctx.lineWidth = this.fx.width + (i * this.fx.blur);
      ctx.globalAlpha = this.fx.opacity / (i + 1);
      ctx.lineCap = 'round';
      
      ctx.moveTo(this.x1, this.y1);
      ctx.lineTo(this.x2, this.y2);
      ctx.stroke();
    }
    
    
    ctx.globalAlpha = 1;
  }
}

export class EraserEffect extends Effect {
  constructor(x, y, fx = {}) {
    super(fx);
    this.x = x;
    this.y = y;
  }

  apply(ctx) {
    const radius = this.fx.radius || 20;
    
    
    ctx.beginPath();
    ctx.fillStyle = this.fx.color;
    ctx.globalAlpha = 0.1; 
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    
    ctx.beginPath();
    ctx.strokeStyle = this.fx.color;
    ctx.globalAlpha = this.fx.opacity;
    ctx.lineWidth = this.fx.width;
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
} 