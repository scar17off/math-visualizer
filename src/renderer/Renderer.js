import Camera from './Camera';
import Mouse from './Mouse';
import {
  SelectTool, PenTool, EraserTool, LineTool, PointTool,
  LabelTool, CurveTool, TOOL_TYPES
} from '../tools/Tools';
import { StrokeEffect, PointEffect, LineEffect, EraserEffect } from '../tools/Effects';
import Config from '../config/Config';
import { Point, Line, Stroke } from '../items/DrawableItem';

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.updateConfig(Config.load());
    this.camera = new Camera(this);
    this.mouse = new Mouse(canvas, this.camera);


    this.drawingHistory = {
      points: [],
      lines: [],
      strokes: [],
      labels: [],
      erasedAt: new Set()
    };


    this.tools = {
      [TOOL_TYPES.SELECT]: new SelectTool(this),
      [TOOL_TYPES.PEN]: new PenTool(this),
      [TOOL_TYPES.ERASER]: new EraserTool(this),
      [TOOL_TYPES.LINE]: new LineTool(this),
      [TOOL_TYPES.POINT]: new PointTool(this),
      [TOOL_TYPES.LABEL]: new LabelTool(this),
      [TOOL_TYPES.CURVE]: new CurveTool(this)
    };
    this.currentTool = null;


    this.resizeCanvas();
    this.animate();

    this.pageCount = 2;
    this.showAngles = false;
  }

  updateConfig(config) {
    if (!config) return;


    this.config = config;

    this.GRID_SIZE = config.notebook?.gridSize ?? this.GRID_SIZE;
    this.PAGE_WIDTH = config.notebook?.pageWidth ?? this.PAGE_WIDTH;
    this.PAGE_HEIGHT = config.notebook?.pageHeight ?? this.PAGE_HEIGHT;
    this.CORNER_RADIUS = config.notebook?.cornerRadius ?? this.CORNER_RADIUS;

    this.LINE_COLOR = config.colors?.gridLines ?? this.LINE_COLOR;
    this.MARGIN_COLOR = config.colors?.marginLine ?? this.MARGIN_COLOR;
    this.BORDER_COLOR = config.colors?.border ?? this.BORDER_COLOR;

    this.GRID_LINE_BLUR = config.lines?.gridLineBlur ?? this.GRID_LINE_BLUR;
    this.GRID_LINE_WIDTH = config.lines?.gridLineWidth ?? this.GRID_LINE_WIDTH;
    this.MARGIN_LINE_BLUR = config.lines?.marginLineBlur ?? this.MARGIN_LINE_BLUR;
    this.MARGIN_LINE_WIDTH = config.lines?.marginLineWidth ?? this.MARGIN_LINE_WIDTH;
    this.BORDER_WIDTH = config.lines?.borderWidth ?? this.BORDER_WIDTH;


    if (config.tools && this.tools) {
      Object.entries(this.tools).forEach(([type, tool]) => {
        if (tool.updateConfig && config.tools[type]) {
          tool.updateConfig(config.tools[type]);
        }
      });
    }


    if (this.tools) {
      Object.values(this.tools).forEach(tool => {
        if (tool.updateConfig) {
          tool.updateConfig({
            ...config.tools[tool.type],
            color: config.colors.stroke
          });
        }
      });
    }
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  animate() {

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);


    this.camera.applyTransform(this.ctx);


    this.drawNotebookPage();


    this.drawItems();


    if (this.currentTool) {
      this.currentTool.draw(this.ctx);
    }

    requestAnimationFrame(() => this.animate());
  }

  drawRoundedRect(ctx, x, y, width, height, radius, roundLeft = true, roundRight = true) {
    ctx.beginPath();
    ctx.moveTo(x + (roundLeft ? radius : 0), y);
    ctx.lineTo(x + width - (roundRight ? radius : 0), y);


    if (roundRight) {
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    }

    ctx.lineTo(x + width, y + height - (roundRight ? radius : 0));


    if (roundRight) {
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    }

    ctx.lineTo(x + (roundLeft ? radius : 0), y + height);


    if (roundLeft) {
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    }

    ctx.lineTo(x, y + (roundLeft ? radius : 0));


    if (roundLeft) {
      ctx.quadraticCurveTo(x, y, x + radius, y);
    }

    ctx.closePath();
  }

  drawBlurryLine(ctx, x1, y1, x2, y2, color, width, blur) {

    const layers = 3;
    for (let i = 0; i < layers; i++) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = width + (i * blur);
      ctx.globalAlpha = 1 / (i + 1);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  drawNotebookPage() {
    const {
      ctx, GRID_SIZE, LINE_COLOR, MARGIN_COLOR, BORDER_COLOR, BORDER_WIDTH,
      CORNER_RADIUS, GRID_LINE_BLUR, GRID_LINE_WIDTH, MARGIN_LINE_BLUR, MARGIN_LINE_WIDTH
    } = this;


    for (let page = 0; page < this.pageCount; page++) {
      const offsetX = page * this.PAGE_WIDTH;
      const isLeftPage = page === 0;
      const isRightPage = page === this.pageCount - 1;
      const isMiddlePage = !isLeftPage && !isRightPage;


      ctx.fillStyle = '#FFFFFF';
      if (isMiddlePage) {

        ctx.fillRect(offsetX, 0, this.PAGE_WIDTH, this.PAGE_HEIGHT);
      } else {
        this.drawRoundedRect(
          ctx,
          offsetX,
          0,
          this.PAGE_WIDTH,
          this.PAGE_HEIGHT,
          CORNER_RADIUS,
          isLeftPage,
          isRightPage
        );
      }
      ctx.fill();


      ctx.save();
      if (isMiddlePage) {
        ctx.rect(offsetX, 0, this.PAGE_WIDTH, this.PAGE_HEIGHT);
      } else {
        this.drawRoundedRect(
          ctx,
          offsetX,
          0,
          this.PAGE_WIDTH,
          this.PAGE_HEIGHT,
          CORNER_RADIUS,
          isLeftPage,
          isRightPage
        );
      }
      ctx.clip();


      if (this.config.display?.showGrid !== false) {

        for (let x = GRID_SIZE; x < this.PAGE_WIDTH; x += GRID_SIZE) {
          this.drawBlurryLine(
            ctx,
            offsetX + x, 0,
            offsetX + x, this.PAGE_HEIGHT,
            LINE_COLOR,
            GRID_LINE_WIDTH,
            GRID_LINE_BLUR
          );
        }


        for (let y = GRID_SIZE; y < this.PAGE_HEIGHT; y += GRID_SIZE) {
          this.drawBlurryLine(
            ctx,
            offsetX, y,
            offsetX + this.PAGE_WIDTH, y,
            LINE_COLOR,
            GRID_LINE_WIDTH,
            GRID_LINE_BLUR
          );
        }
      }


      if (isLeftPage || isRightPage) {
        const marginX = isLeftPage ?
          offsetX + GRID_SIZE * 4 :
          offsetX + this.PAGE_WIDTH - (GRID_SIZE * 4);

        this.drawBlurryLine(
          ctx,
          marginX, 0,
          marginX, this.PAGE_HEIGHT,
          MARGIN_COLOR,
          MARGIN_LINE_WIDTH,
          MARGIN_LINE_BLUR
        );
      }


      ctx.restore();


      ctx.strokeStyle = BORDER_COLOR;
      ctx.lineWidth = BORDER_WIDTH;

      if (isMiddlePage) {

        ctx.beginPath();

        ctx.moveTo(offsetX, 0);
        ctx.lineTo(offsetX, this.PAGE_HEIGHT);

        ctx.moveTo(offsetX + this.PAGE_WIDTH, 0);
        ctx.lineTo(offsetX + this.PAGE_WIDTH, this.PAGE_HEIGHT);

        ctx.moveTo(offsetX, 0);
        ctx.lineTo(offsetX + this.PAGE_WIDTH, 0);

        ctx.moveTo(offsetX, this.PAGE_HEIGHT);
        ctx.lineTo(offsetX + this.PAGE_WIDTH, this.PAGE_HEIGHT);
        ctx.stroke();
      } else {

        ctx.beginPath();
        this.drawRoundedRect(
          ctx,
          offsetX,
          0,
          this.PAGE_WIDTH,
          this.PAGE_HEIGHT,
          CORNER_RADIUS,
          isLeftPage,
          isRightPage
        );
        ctx.stroke();
      }


      if (!isRightPage) {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.beginPath();
        ctx.moveTo(offsetX + this.PAGE_WIDTH, 0);
        ctx.lineTo(offsetX + this.PAGE_WIDTH, this.PAGE_HEIGHT);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  setTool(toolType) {
    this.currentTool = this.tools[toolType];
  }

  addPoint(x, y, fx = {}) {
    const point = new Point(x, y);
    point.renderer = this;
    this.drawingHistory.points.push(point);
    return point;
  }

  addLine(x1, y1, x2, y2, fx = {}) {
    const line = new Line(x1, y1, x2, y2);
    this.drawingHistory.lines.push(line);
    return line;
  }

  addStroke(points, fx = {}) {
    const stroke = new Stroke(points);
    const strokeFx = {
      ...fx,
      color: this.config.colors.stroke
    };


    stroke.fx = strokeFx;
    stroke.timestamp = Date.now();

    this.drawingHistory.strokes.push(stroke);
  }

  eraseAt(x, y, radius) {
    const radiusSq = radius * radius;


    this.drawingHistory.points = this.drawingHistory.points.filter(point => {
      const dx = point.x - x;
      const dy = point.y - y;
      return dx * dx + dy * dy > radiusSq;
    });


    this.drawingHistory.lines = this.drawingHistory.lines.filter(line => {

      const dx1 = line.x1 - x;
      const dy1 = line.y1 - y;
      const dx2 = line.x2 - x;
      const dy2 = line.y2 - y;


      if (dx1 * dx1 + dy1 * dy1 <= radiusSq ||
        dx2 * dx2 + dy2 * dy2 <= radiusSq) {
        return false;
      }


      const lineLength = Math.sqrt(
        (line.x2 - line.x1) * (line.x2 - line.x1) +
        (line.y2 - line.y1) * (line.y2 - line.y1)
      );

      if (lineLength === 0) return true;

      const t = Math.max(0, Math.min(1, (
        (x - line.x1) * (line.x2 - line.x1) +
        (y - line.y1) * (line.y2 - line.y1)
      ) / (lineLength * lineLength)));

      const projX = line.x1 + t * (line.x2 - line.x1);
      const projY = line.y1 + t * (line.y2 - line.y1);

      const distSq = (x - projX) * (x - projX) + (y - projY) * (y - projY);
      return distSq > radiusSq;
    });


    this.drawingHistory.strokes = this.drawingHistory.strokes.filter(stroke => {
      if (!stroke.isNearPoint) {
        return !stroke.points.some(point => {
          const dx = point[0] - x;
          const dy = point[1] - y;
          return dx * dx + dy * dy <= radiusSq;
        });
      }
      return !stroke.isNearPoint(x, y, radius);
    });


    if (this.drawingHistory.curves) {
      this.drawingHistory.curves = this.drawingHistory.curves.filter(curve => {

        const points = [
          { x: curve.x1, y: curve.y1 },
          { x: curve.x2, y: curve.y2 },
          { x: curve.cp1x, y: curve.cp1y },
          { x: curve.cp2x, y: curve.cp2y }
        ];


        for (const point of points) {
          const dx = point.x - x;
          const dy = point.y - y;
          if (dx * dx + dy * dy <= radiusSq) {
            return false;
          }
        }



        const steps = 20;
        let prevX = curve.x1;
        let prevY = curve.y1;

        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          const t1 = 1 - t;


          const currX = t1 * t1 * t1 * curve.x1 +
            3 * t1 * t1 * t * curve.cp1x +
            3 * t1 * t * t * curve.cp2x +
            t * t * t * curve.x2;

          const currY = t1 * t1 * t1 * curve.y1 +
            3 * t1 * t1 * t * curve.cp1y +
            3 * t1 * t * t * curve.cp2y +
            t * t * t * curve.y2;


          const dx1 = prevX - x;
          const dy1 = prevY - y;
          const dx2 = currX - x;
          const dy2 = currY - y;


          if (dx1 * dx1 + dy1 * dy1 <= radiusSq ||
            dx2 * dx2 + dy2 * dy2 <= radiusSq) {
            return false;
          }


          const lineLength = Math.sqrt(
            (currX - prevX) * (currX - prevX) +
            (currY - prevY) * (currY - prevY)
          );

          if (lineLength > 0) {
            const t = Math.max(0, Math.min(1, (
              (x - prevX) * (currX - prevX) +
              (y - prevY) * (currY - prevY)
            ) / (lineLength * lineLength)));

            const projX = prevX + t * (currX - prevX);
            const projY = prevY + t * (currY - prevY);

            const distSq = (x - projX) * (x - projX) + (y - projY) * (y - projY);
            if (distSq <= radiusSq) {
              return false;
            }
          }

          prevX = currX;
          prevY = currY;
        }

        return true;
      });
    }


    if (this.drawingHistory.labels) {
      this.drawingHistory.labels = this.drawingHistory.labels.filter(label => {
        const dx = label.x - x;
        const dy = label.y - y;
        return dx * dx + dy * dy > radiusSq;
      });
    }
  }

  getPoints() {
    return this.drawingHistory.points
      .filter(point => !this.drawingHistory.erasedAt.has(point.timestamp));
  }

  drawItems() {

    if (this.config.display?.showDots !== false) {
      this.drawingHistory.points
        .filter(point => !this.drawingHistory.erasedAt.has(point.timestamp))
        .forEach(point => {
          new PointEffect(point.x, point.y, {
            ...point.fx,
            showAngle: point.showAngle,
            label: point.label,
            renderer: this
          }).apply(this.ctx);
        });
    }


    this.drawingHistory.lines
      .filter(line => !this.drawingHistory.erasedAt.has(line.timestamp))
      .forEach(line => {
        new LineEffect(line.x1, line.y1, line.x2, line.y2, line.fx).apply(this.ctx);
      });

    this.drawingHistory.strokes
      .filter(stroke => !this.drawingHistory.erasedAt.has(stroke.timestamp))
      .forEach(stroke => {
        new StrokeEffect(
          stroke.points,
          stroke.fx || { color: this.config.colors.stroke }
        ).apply(this.ctx);
      });


    if (this.showAngles && this.currentTool?.selectedItems?.length >= 2) {
      this.drawAngles(this.currentTool.selectedItems);
    }


    if (this.drawingHistory.labels) {
      this.drawingHistory.labels
        .filter(label => !this.drawingHistory.erasedAt.has(label.timestamp))
        .forEach(label => {
          this.ctx.save();

          this.ctx.font = '14px system-ui, -apple-system, sans-serif';
          this.ctx.fillStyle = this.config.colors.stroke;
          this.ctx.textAlign = 'left';
          this.ctx.textBaseline = 'middle';


          const metrics = this.ctx.measureText(label.text);
          const padding = 4;
          this.ctx.fillStyle = 'white';
          this.ctx.fillRect(
            label.x - padding,
            label.y - metrics.actualBoundingBoxAscent - padding,
            metrics.width + padding * 2,
            (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) + padding * 2
          );


          this.ctx.fillStyle = this.config.colors.stroke;
          this.ctx.fillText(label.text, label.x, label.y);
          this.ctx.restore();
        });
    }


    if (this.drawingHistory.curves) {
      this.drawingHistory.curves
        .filter(curve => !this.drawingHistory.erasedAt.has(curve.timestamp))
        .forEach(curve => {
          this.ctx.beginPath();
          this.ctx.strokeStyle = curve.fx.color;
          this.ctx.lineWidth = curve.fx.width || 2;

          this.ctx.moveTo(curve.x1, curve.y1);
          this.ctx.bezierCurveTo(
            curve.cp1x, curve.cp1y,
            curve.cp2x, curve.cp2y,
            curve.x2, curve.y2
          );
          this.ctx.stroke();
        });
    }
  }


  toggleAngles() {
    if (this.currentTool?.selectedItems) {
      this.currentTool.selectedItems.forEach(item => {
        if (item.type === 'point') {
          item.item.showAngle = !item.item.showAngle;
        }
      });
    }
  }


  drawAngles(selectedItems) {
    const items = selectedItems.filter(item => item.type === 'point');
    if (items.length === 0) return;


    if (items.length === 1) {
      const p = items[0].item;
      const radius = 25;

      this.ctx.beginPath();
      this.ctx.strokeStyle = '#4299e1';
      this.ctx.lineWidth = 2;


      this.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      this.ctx.stroke();
      return;
    }


    for (let i = 0; i < items.length - 1; i++) {
      const p1 = items[i].item;
      const p2 = items[i + 1].item;

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const angle = Math.atan2(dy, dx);
      const radius = 25;

      this.ctx.beginPath();
      this.ctx.strokeStyle = '#4299e1';
      this.ctx.lineWidth = 2;

      this.ctx.arc(p1.x, p1.y, radius, 0, angle, angle < 0);
      this.ctx.stroke();
    }
  }

  addCurve(x1, y1, cp1x, cp1y, cp2x, cp2y, x2, y2, fx = {}) {
    const curve = {
      type: 'curve',
      x1, y1,
      cp1x, cp1y,
      cp2x, cp2y,
      x2, y2,
      fx: {
        ...fx,
        color: this.config.colors.stroke
      },
      timestamp: Date.now()
    };

    this.drawingHistory.curves = this.drawingHistory.curves || [];
    this.drawingHistory.curves.push(curve);
    return curve;
  }
}

export default Renderer; 