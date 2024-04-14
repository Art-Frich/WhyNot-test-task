// Ошибка, но не undefined: .length слова надо смотреть до ".", а не вместе с ней:
// 51 231 411.31313131 <<< 999B+, хотя функция заменит именно так.
// более того, знак '-' тоже попадает в строку и добавляет +1 к length.

// У вас странная логика заложена к количеству знаков после запятой.
// Если вся суть в том, чтобы цифр было максимально возможно значение, но не более 4-х...
// тогда понял, но лучше было оставить комментарий.

// Без контекста применения функции оптимизация может быть менее эффективной

// Из-за некорректной логики 1.2233242344 превращается в 1.2.2
// Также нет никакого округления и поэтому 12 345 678 превращается в 12.34M, а должно бы 12.35

// Ошибки исправлены в новой функции.
const numberWithSpaces = (x: number, fullValue?: boolean): string | void => {
  try {
    if (fullValue) {
      let parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " "); //отличная регулярка
      return parts.join(".");
    } else {
      const secondNumber = x.toString()[2] === '0' ? '' : x.toString()[2]
      const needDot = secondNumber ? '.' : ''
      const thirdNumber = x.toString()[3] === '0' ? '' : x.toString()[3]
      const needDot3 = thirdNumber ? '.' : ''
      if (x.toString().length > 12) {
        return '999B+'
      } else if (x.toString().length === 12) {
        return x.toString()[0] + x.toString()[1] + x.toString()[2] + needDot3 + thirdNumber + 'B'
      } else if (x.toString().length === 11) {
        if (thirdNumber) {
          return x.toString()[0] + x.toString()[1] + '.' + x.toString()[2] + x.toString()[3] + 'B'
        } else {
          return x.toString()[0] + x.toString()[1] + needDot + secondNumber + 'B'
        }
      } else if (x.toString().length === 10) {
        return x.toString()[0] + '.' + x.toString()[1] + secondNumber + 'B'
      } else if (x.toString().length === 9) {
        return x.toString()[0] + x.toString()[1] + x.toString()[2] + needDot3 + thirdNumber + 'M'
      } else if (x.toString().length === 8) {
        if (thirdNumber) {
          return x.toString()[0] + x.toString()[1] + '.' + x.toString()[2] + x.toString()[3] + 'M'
        } else {
          return x.toString()[0] + x.toString()[1] + needDot + secondNumber + 'M'
        }
      } else if (x.toString().length === 7) {
        return x.toString()[0] + '.' + x.toString()[1] + secondNumber + 'M'
      } else {
        let parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.join(".");
      }
    }
  } catch (e) {
    console.log(`[numberWithSpaces] error with ${e}`);
  }
};

const newFunc = (x = 0, fullValue = true): string | void => {
  try {
    let nums = x.toString().split('.');
    let res = '';
    const len = nums[0].length;

    if (fullValue || len < 7) {
      // оставил бы исходное регулярное выражение, но можно заменить более очевидными операциями
      nums[0] = nums[0]
        .split('')
        .reverse()
        .reduce((acc, l, i) => {
          const space = i % 3 === 0 ? ' ' : ''; //нет проверки на i === 0, т.к. 0-ой элемент всегда будет попадать в acc вместо начального значения
          return l + space + acc;
        });
      // или
      // nums[0] = nums[0].split('').reverse().reduce((acc, l, i) => i % 3 ? `${l}${acc}` : `${l} ${acc}`);
      // или
      // nums[0] = nums[0].split('').reverse().map((l, i) => l + (i !== 0 && i % 3 === 0 ? ' ' : '')).reverse().join('');

      res = nums.join('.');
    } else {
      const MAX_LEN = 4;

      // лучше вынести во внешнюю переменную, чтобы не мешать с логикой обработки
      const values = {
        'billions': {
          minValue: 10 ** 9,
          maxValue: 10 ** 12,
          abb: 'B',
        },
        'millions': {
          minValue: 10 ** 6,
          maxValue: 10 ** 9,
          abb: 'M'
        },
      }

      if (len > 12) { // обработка краевого случая
        res = '999B+';
      } else {
        for (let { minValue, maxValue, abb } of Object.values(values)) {
          const num = Math.abs(Number(nums[0]));
          if (num >= minValue && num < maxValue) {
            let resNum = (num / minValue).toFixed(2);
            const resNums = resNum.split('.');
            if (resNums[1]) { // логика для среза лишних знаков с конца | лучше убрать
              const lenAfterDote = Math.min(2, MAX_LEN - resNums[0].length)
              resNums[1] = resNums[1].replace(/0{1,}$/g, '').slice(0, lenAfterDote); // логика для 1.0 -> 1
              resNum = resNums[1] ? resNums.join('.') : resNums[0];
            }
            res = ''.concat(nums[0][0] === '-' ? '-' : '', resNum, abb);
            break;
          }
        }
      }
    }

    return res;
  } catch (e) {
    console.log(`[newFunc] error with: ${e}`);
  }
}


(() => {
  const tests = [
    123, 10001, 153056, 5132.51321, -1, -5561321313, 99999, 12345678, 912321561321, 912301561321, 51231411.31313131, 0, 1.2233242344, 1000000000, 1111111111111, -1232.222,
  ]

  tests.forEach((number, index) => {
    const old = numberWithSpaces(number, false);
    const old1 = numberWithSpaces(number, true);
    const newN = newFunc(number, false)?.replace(/\xa0/g, ' ')?.replace(/\u202f/g, ' ');
    const newN1 = newFunc(number, true)?.replace(/\xa0/g, ' ')?.replace(/\u202f/g, ' ');
    const status = (old == newN && old1 == newN1);
    console.log(`#${index + 1}`, status ? "OK" : "FAILED", !status ? `${old} == ${newN} | ${old1} == ${newN1}` : '');
  });
})();