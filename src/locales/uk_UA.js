export const uk_UA = {
  properties: {
    title: 'Властивості',
    noSelection: 'Нічого не вибрано',
    info: 'Інфо',
    length: 'Довжина',
    angle: 'Кут',
    position: 'Позиція',
    perimeter: 'Периметр',
    area: 'Площа',
    selectPoints: "Виберіть 3+ з'єднані точки",
    selectPointsHint: "Виберіть щонайменше 3 точки, з'єднані лініями",
    showAngle: 'Показати кут',
    angleFormula: 'θ = arctan(Δy/Δx)',
    addLabel: 'Додати мітку',
    enterLabel: 'Введіть мітку точки:',
  },
  figures: {
    point: 'Точка',
    line: 'Лінія',
    triangle: 'Трикутник',
    rectangle: 'Прямокутник',
    polygon: 'Багатокутник',
    figure: 'Фігура',
    square: 'Квадрат',
    trapezoid: 'Трапеція'
  },
  formulas: {
    variants: {
      cartesian: 'Декартова',
      parametric: 'Параметрична',
      polar: 'Полярна',
      arctangent: 'Арктангенс',
      cosine: 'Косинус',
      sine: 'Синус',
      determinant: 'Детермінант',
      triangulation: 'Тріангуляція',
      greensTheorem: 'Теорема Гріна',
      sumOfSides: 'Сума сторін',
      lineIntegral: 'Лінійний інтеграл'
    },
    using: {
      parametric: 'Використовуючи параметричну форму:',
      polar: 'Використовуючи полярну форму:',
      triangulation: 'Використовуючи тріангуляцію:',
      greensTheorem: 'Використовуючи теорему Гріна:',
      lineIntegral: 'Використовуючи лінійний інтеграл:'
    }
  },
  menu: {
    file: 'Файл',
    edit: 'Редагувати',
    view: 'Вигляд'
  },
  pageControl: {
    pages: 'сторінок'
  },
  calculations: {
    perimeter: {
      sumOfSides: 'P = сума(сторін)',
      calculation: 'P = s1 + s2 + s3',
      result: '= {value}{unit}'
    },
    area: {
      determinant: 'A = ½|∑(xᵢyᵢ₊₁ - xᵢ₊₁yᵢ)|',
      calculation: 'A = ½|det(вершин)|',
      result: '= {value}{unit}²',
      square: 'A = a²',
      rectangle: 'A = w × h',
      trapezoid: 'A = ½(a + b)h'
    }
  },
  settings: {
    display: {
      title: 'Відображення',
      visibility: 'Видимість',
      showDots: 'Показувати точки',
      showGrid: 'Показувати сітку',
      showAngleMeasurements: 'Показувати градуси кутів'
    },
    colors: {
      angle: 'Колір кута'
    }
  }
}; 