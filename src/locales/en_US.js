export const en_US = {
  properties: {
    title: 'Properties',
    noSelection: 'No selection',
    info: 'Info',
    length: 'Length',
    angle: 'Angle',
    position: 'Position',
    perimeter: 'Perimeter',
    area: 'Area',
    selectPoints: 'Select 3+ connected points',
    selectPointsHint: 'Select at least 3 points connected by lines',
    showAngle: 'Show Angle',
    angleFormula: 'θ = arctan(Δy/Δx)',
    addLabel: 'Add Label',
    enterLabel: 'Enter point label:',
  },
  figures: {
    point: 'Point',
    line: 'Line',
    triangle: 'Triangle',
    rectangle: 'Rectangle',
    polygon: 'Polygon',
    figure: 'Figure',
    square: 'Square',
    trapezoid: 'Trapezoid'
  },
  formulas: {
    variants: {
      cartesian: 'Cartesian',
      parametric: 'Parametric',
      polar: 'Polar',
      arctangent: 'Arctangent',
      cosine: 'Cosine',
      sine: 'Sine',
      determinant: 'Determinant',
      triangulation: 'Triangulation',
      greensTheorem: "Green's Theorem",
      sumOfSides: 'Sum of Sides',
      lineIntegral: 'Line Integral'
    },
    using: {
      parametric: 'Using parametric form:',
      polar: 'Using polar form:',
      triangulation: 'Using triangulation:',
      greensTheorem: "Using Green's theorem:",
      lineIntegral: 'Using line integral:'
    }
  },
  menu: {
    file: 'File',
    edit: 'Edit',
    view: 'View'
  },
  pageControl: {
    pages: 'pages'
  },
  calculations: {
    perimeter: {
      sumOfSides: 'P = sum(sides)',
      calculation: 'P = s1 + s2 + s3',
      result: '= {value}{unit}'
    },
    area: {
      determinant: 'A = ½|∑(xᵢyᵢ₊₁ - xᵢ₊₁yᵢ)|',
      calculation: 'A = ½|det(vertices)|',
      result: '= {value}{unit}²',
      square: 'A = a²',
      rectangle: 'A = w × h',
      trapezoid: 'A = ½(a + b)h'
    }
  },
  settings: {
    display: {
      title: 'Display',
      visibility: 'Visibility',
      showDots: 'Show Dots',
      showGrid: 'Show Grid',
      showAngleMeasurements: 'Show Angle Measurements',
      darkMode: 'Dark Mode'
    },
    colors: {
      angle: 'Angle Color'
    }
  }
}; 