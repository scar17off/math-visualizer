class Mouse {
  constructor(canvas, camera) {
    this.canvas = canvas;
    this.camera = camera;
    this.renderer = camera.renderer;
    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;
    
    
    this.ctrlKey = false;
    this.shiftKey = false;

    this.initEvents();
  }

  initEvents() {
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    
    
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  handleKeyDown(event) {
    if (event.key === 'Control') this.ctrlKey = true;
    if (event.key === 'Shift') this.shiftKey = true;
  }

  handleKeyUp(event) {
    if (event.key === 'Control') this.ctrlKey = false;
    if (event.key === 'Shift') this.shiftKey = false;
  }

  getCanvasPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / this.camera.zoom - this.camera.x / this.camera.zoom;
    const y = (event.clientY - rect.top) / this.camera.zoom - this.camera.y / this.camera.zoom;
    return [x, y];
  }

  handleWheel(event) {
    event.preventDefault();
    const { offsetX, offsetY, deltaY } = event;
    this.camera.zoomAt(offsetX, offsetY, -deltaY);
  }

  handleMouseDown(event) {
    const [x, y] = this.getCanvasPoint(event);
    
    if (event.button === 1) {
      this.isDragging = true;
      this.lastX = event.clientX;
      this.lastY = event.clientY;
    } else if (event.button === 0) {
      if (this.renderer.currentTool) {
        this.renderer.currentTool.onMouseDown(x, y, {
          ctrl: this.ctrlKey,
          shift: this.shiftKey
        });
      }
    } else if (event.button === 2) {
      if (this.renderer.currentTool && this.renderer.currentTool.cancel) {
        this.renderer.currentTool.cancel();
      }
    }
  }

  handleMouseMove(event) {
    const [x, y] = this.getCanvasPoint(event);

    if (this.isDragging) {
      const dx = event.clientX - this.lastX;
      const dy = event.clientY - this.lastY;
      this.camera.move(dx, dy);
      this.lastX = event.clientX;
      this.lastY = event.clientY;
    } else if (this.renderer.currentTool) {
      this.renderer.currentTool.startX = x;
      this.renderer.currentTool.startY = y;
      this.renderer.currentTool.onMouseMove(x, y, {
        ctrl: this.ctrlKey,
        shift: this.shiftKey
      });
    }
  }

  handleMouseUp(event) {
    const [x, y] = this.getCanvasPoint(event);

    if (event.button === 1) {
      this.isDragging = false;
    } else if (event.button === 0) {
      if (this.renderer.currentTool) {
        this.renderer.currentTool.onMouseUp(x, y, {
          ctrl: this.ctrlKey,
          shift: this.shiftKey
        });
      }
    }
  }
}

export default Mouse; 