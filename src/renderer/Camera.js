class Camera {
  constructor(renderer) {
    this.renderer = renderer;
    this.x = 0;
    this.y = 0;
    this.zoom = 1;
  }

  applyTransform(ctx) {
    ctx.setTransform(this.zoom, 0, 0, this.zoom, this.x, this.y);
  }

  zoomAt(x, y, deltaZoom) {
    const zoomFactor = Math.exp(deltaZoom * 0.001);
    this.x -= (x - this.x) * (zoomFactor - 1);
    this.y -= (y - this.y) * (zoomFactor - 1);
    this.zoom *= zoomFactor;
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  worldToScreen(worldX, worldY) {
    return {
      x: worldX * this.zoom + this.x,
      y: worldY * this.zoom + this.y
    };
  }

  screenToWorld(screenX, screenY) {
    return {
      x: (screenX - this.x) / this.zoom,
      y: (screenY - this.y) / this.zoom
    };
  }
}

export default Camera; 