const stringify = o => JSON.stringify(o, (_, v) => ['undefined', 'bigint', 'function', 'symbol'].includes(typeof v) ? String(v) : v).slice(1, -1)
require('./data').forEach(({name, datas, f = () => {}, bf = () => {}}) => {
  describe(name, () => {
    beforeAll(bf)
    datas.forEach(data => {
      test('Tested:' + stringify(data.slice(0, -1)) + ' Excepted:' + stringify(data.slice(-1)), f.bind(this, data))
    })
  })
});
