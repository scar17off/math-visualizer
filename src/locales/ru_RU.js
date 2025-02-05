export const ru_RU = {
  properties: {
    title: 'Свойства',
    noSelection: 'Ничего не выбрано',
    info: 'Инфо',
    length: 'Длина',
    angle: 'Угол',
    position: 'Позиция',
    perimeter: 'Периметр',
    area: 'Площадь',
    selectPoints: 'Выберите 3+ соединенные точки',
    selectPointsHint: 'Выберите как минимум 3 точки, соединенные линиями',
    showAngle: 'Показать угол',
    angle: 'Угол',
    angleFormula: 'θ = arctan(Δy/Δx)',
    addLabel: 'Добавить метку',
    enterLabel: 'Введите метку точки:',
  },
  figures: {
    point: 'Точка',
    line: 'Линия',
    triangle: 'Треугольник',
    rectangle: 'Прямоугольник',
    polygon: 'Многоугольник',
    figure: 'Фигура',
    square: 'Квадрат',
    trapezoid: 'Трапеция'
  },
  formulas: {
    variants: {
      cartesian: 'Декартова',
      parametric: 'Параметрическая',
      polar: 'Полярная',
      arctangent: 'Арктангенс',
      cosine: 'Косинус',
      sine: 'Синус',
      determinant: 'Детерминант',
      triangulation: 'Триангуляция',
      greensTheorem: 'Теорема Грина',
      sumOfSides: 'Сумма сторон',
      lineIntegral: 'Линейный интеграл'
    },
    using: {
      parametric: 'Используя параметрическую форму:',
      polar: 'Используя полярную форму:',
      triangulation: 'Используя триангуляцию:',
      greensTheorem: 'Используя теорему Грина:',
      lineIntegral: 'Используя линейный интеграл:'
    }
  },
  menu: {
    file: 'Файл',
    edit: 'Править',
    view: 'Вид'
  },
  pageControl: {
    pages: 'страниц'
  },
  calculations: {
    perimeter: {
      sumOfSides: 'P = сумма(сторон)',
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
      title: 'Отображение',
      visibility: 'Видимость',
      showDots: 'Показывать точки',
      showGrid: 'Показывать се��ку',
      showAngleMeasurements: 'Показывать градусы углов'
    },
    colors: {
      angle: 'Цвет угла'
    }
  }
}; 