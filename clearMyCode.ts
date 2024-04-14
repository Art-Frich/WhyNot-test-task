// Функция парсер чисел: сокращение до миллионов, миллиардов, итд + разложение на 3-ки
// Примечание: убрал на мой взгляд бесполезную логику среза цифр после запятой

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


const parseNum = (x = 0, fullValue = true): string | void => {
  try {
    let res = x.toString();
    let nums = res.split('.');
    const len = nums[0].length;

    const expandNum = () => {
      let nums = x.toString().split(".");
      nums[0] = nums[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      res = nums.join(".");
    }

    const reduceNum = () => {
      for (let { minValue, maxValue, abb } of Object.values(values)) {
        const num = Math.abs(Number(nums[0]));
        let newRes = '';
        if (num >= minValue && num < maxValue) {
          let resNum = (num / minValue).toFixed(2);
          newRes = ''.concat(nums[0][0] === '-' ? '-' : '', resNum, abb);
          break;
        }
        if (!newRes) { // если число не входит в values
          expandNum();
        } else {
          res = newRes;
        }
      }
    }

    if (fullValue) {
      expandNum();
    } else {
      if (len > 12) { // обработка краевого случая
        res = '999B+';
      } else {
        reduceNum();
      }
    }

    return res;
  } catch (e) {
    console.log(`[newFunc] error with: ${e}`);
  }
}