export class DrawableItem {
  constructor(timestamp) {
    this.timestamp = timestamp || Date.now();
  }

  draw(ctx, style) {
    
  }

  isNearPoint(x, y, threshold) {
    
    return false;
  }
}

export class Point extends DrawableItem {
  constructor(x, y, timestamp) {
    super(timestamp);
    this.x = x;
    this.y = y;
    this.label = '';
    this.showAngle = false;
  }

  findConnectedLines() {
    const lines = this.renderer?.drawingHistory?.lines || [];
    return lines.filter(line => 
      !this.renderer.drawingHistory.erasedAt.has(line.timestamp) &&
      ((Math.abs(line.x1 - this.x) < 1 && Math.abs(line.y1 - this.y) < 1) ||
       (Math.abs(line.x2 - this.x) < 1 && Math.abs(line.y2 - this.y) < 1))
    );
  }

  getLineEndpoint(line) {
    if (Math.abs(line.x1 - this.x) < 1 && Math.abs(line.y1 - this.y) < 1) {
      return { x: line.x2, y: line.y2 };
    }
    return { x: line.x1, y: line.y1 };
  }

  draw(ctx, style = {}) {
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, style.radius || 4, 0, Math.PI * 2);
    ctx.fillStyle = style.color || '#000000';
    ctx.fill();

    
    if (this.label) {
      ctx.save();
      ctx.font = '16px Arial';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(this.label, this.x + 8, this.y - 8);
      ctx.restore();
    }

    
    if (this.showAngle) {
      const connectedLines = this.findConnectedLines();
      if (connectedLines.length >= 2) {
        ctx.save();
        ctx.strokeStyle = this.renderer.config.colors.angle;
        ctx.lineWidth = 1;

        
        const angles = connectedLines.map(line => {
          const endpoint = this.getLineEndpoint(line);
          const dx = endpoint.x - this.x;
          const dy = endpoint.y - this.y;
          return {
            angle: Math.atan2(dy, dx),
            endpoint
          };
        });

        
        angles.sort((a, b) => {
          let diff = a.angle - b.angle;
          
          if (diff > Math.PI) diff -= 2 * Math.PI;
          if (diff < -Math.PI) diff += 2 * Math.PI;
          return diff;
        });

        
        const radius = 20;
        for (let i = 0; i < angles.length; i++) {
          const startAngle = angles[i].angle;
          const endAngle = angles[(i + 1) % angles.length].angle;

          
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(
            this.x + Math.cos(startAngle) * radius,
            this.y + Math.sin(startAngle) * radius
          );
          ctx.stroke();

          
          ctx.beginPath();
          let angleDiff = endAngle - startAngle;
          
          if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
          if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
          
          
          if (Math.abs(angleDiff) > Math.PI) {
            
            if (angleDiff > 0) {
              ctx.arc(this.x, this.y, radius, endAngle, startAngle, true);
            } else {
              ctx.arc(this.x, this.y, radius, startAngle, endAngle);
            }
          } else {
            if (angleDiff > 0) {
              ctx.arc(this.x, this.y, radius, startAngle, endAngle);
            } else {
              ctx.arc(this.x, this.y, radius, startAngle, endAngle, true);
            }
          }
          ctx.stroke();

          
          if (this.renderer.config.display.showAngleMeasurements) {
            
            let angleInDegrees = Math.round(Math.abs(angleDiff) * 180 / Math.PI);
            if (angleInDegrees > 180) {
              angleInDegrees = 360 - angleInDegrees;
            }
            
            
            const midAngle = startAngle + angleDiff / 2;
            const textRadius = radius * 0.7;
            const textX = this.x + Math.cos(midAngle) * textRadius;
            const textY = this.y + Math.sin(midAngle) * textRadius;

            ctx.save();
            ctx.font = '4px Arial';
            ctx.fillStyle = this.renderer.config.colors.angle;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${angleInDegrees}°`, textX, textY);
            ctx.restore();
          }
        }

        ctx.restore();
      }
    }
  }

  isNearPoint(x, y, threshold) {
    const dx = this.x - x;
    const dy = this.y - y;
    return (dx * dx + dy * dy) <= threshold * threshold;
  }
}

export class Line extends DrawableItem {
  constructor(x1, y1, x2, y2, timestamp) {
    super(timestamp);
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  draw(ctx, style) {
    ctx.beginPath();
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width || 2;
    
    if (style.style === 'dashed') {
      ctx.setLineDash([5, 5]);
    } else {
      ctx.setLineDash([]);
    }
    
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
    ctx.stroke();
    ctx.setLineDash([]); 
  }

  isNearPoint(x, y, threshold) {
    const lineLength = Math.sqrt(
      (this.x2 - this.x1) * (this.x2 - this.x1) + 
      (this.y2 - this.y1) * (this.y2 - this.y1)
    );
    
    if (lineLength === 0) return false;

    const t = Math.max(0, Math.min(1, (
      (x - this.x1) * (this.x2 - this.x1) + 
      (y - this.y1) * (this.y2 - this.y1)
    ) / (lineLength * lineLength)));

    const projX = this.x1 + t * (this.x2 - this.x1);
    const projY = this.y1 + t * (this.y2 - this.y1);
    
    const dx = x - projX;
    const dy = y - projY;
    
    return (dx * dx + dy * dy) <= threshold * threshold;
  }
}

export class Stroke extends DrawableItem {
  constructor(points, timestamp) {
    super(timestamp);
    this.points = points;
  }

  draw(ctx, style) {
    if (this.points.length < 2) return;
    
    ctx.beginPath();
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width || 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.moveTo(this.points[0][0], this.points[0][1]);
    this.points.slice(1).forEach(point => {
      ctx.lineTo(point[0], point[1]);
    });
    ctx.stroke();
  }

  isNearPoint(x, y, threshold) {
    
    for (let i = 1; i < this.points.length; i++) {
      const p1 = this.points[i - 1];
      const p2 = this.points[i];
      
      
      const segment = new Line(p1[0], p1[1], p2[0], p2[1]);
      if (segment.isNearPoint(x, y, threshold)) {
        return true;
      }
    }
    return false;
  }
} 