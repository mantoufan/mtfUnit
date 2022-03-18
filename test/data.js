const isCoverage = process.argv[2] === '--coverage'
const dirname = 'src'
const fs = require('fs')
const { resolve } = require('path')
const { query, serialize, $, removeNode, insertAfter, addClass, removeClass, getAbsoluteUrl, debounce, throttle, removeItemByIndex, removeItemByValue, stringifyJSON, delHtmlTag, htmlEncode, javaScriptEncode, isRefererValid } = require('../' + dirname + '/mtfunit.js')
const CONF = {
  'url': {
    'root': 'http://127.0.0.1:8080/',
    'test': 'http://127.0.0.1:8080/test/',
    'dom': 'http://127.0.0.1:8080/test/dom/'
   },
   'html': {
     'dom': fs.readFileSync(resolve(__dirname, 'dom/index.html'))
   }
}
module.exports = [
  { 
    name: 'query', // 测试分组名称
    f: data => expect(query(...data.slice(0, -1))).toBe(data[data.length - 1]), // 回调函数：如何使用测试用例
    datas: [ // 测试用例
      ['a', 'a=1', '1'], // [参数1, 参数2 ... 预期结果] => 生成描述：Tested：参数拼接字符串 + Excepted：预期结果
      ['a', 'b=1', undefined],
      ['a', 'b=1&a = 1 ', '1'],
      ['a', 'b= 1 & a = 1 ', '1'],
      ['a b', 'a b = 1 ', '1'],
      ['a b', 'a b = a b ', 'a b'],
      [undefined, 'b=1', undefined],
      [null, undefined, undefined],
      ['http://www.baidu.com','http%3A%2F%2Fwww.baidu.com=http%3A%2F%2Fwww.baidu.com', 'http://www.baidu.com']
    ]
  },
  { 
    name: 'serialize',
    f: data => expect(serialize(...data.slice(0, -1))).toBe(data[data.length - 1]),
    datas: [
      [undefined, ''],
      [null, ''],
      [{}, ''],
      [[], ''],
      [{ a: 1 }, 'a=1'],
      [{ a: 1, b: [1, 2] }, 'a=1&b=%5B1%2C2%5D'],
      [{ a: 1, b: { c : 2 } }, 'a=1&b=%7B%22c%22%3A2%7D'],
      [{ 1: 1, 2: 2}, '1=1&2=2'],
      [{ a: 'http://www.baidu.com' }, 'a=http%3A%2F%2Fwww.baidu.com'],
      [{ a: 'http://www.baidu.com', b: { c: 'http://www.baidu.com' } }, 'a=http%3A%2F%2Fwww.baidu.com&b=%7B%22c%22%3A%22http%3A%2F%2Fwww.baidu.com%22%7D']
    ]
  },
  {
    name: '$',
    async bf () { // 回调函数：调用所有测试用例前执行
      if (isCoverage) return document.body.innerHTML = CONF['html']['dom']
      await page.goto(CONF['url']['dom'])
      await page.addScriptTag({ content: `${$}` })
    },
    async f (data) { // 回调函数：异步执行测试用例
      const cb = data => $(data[0]) 
      const ele = isCoverage ? cb(data) : await page.evaluate(cb, data)
      switch(data[1]) {
        case 'null':
          expect(ele).toBeNull()
          break
        case 'not null':
          expect(ele).not.toBeNull()
          break
        case 'length':
          expect(ele.length).toBe(data[2])
      }
    },
    datas: [
      ['', 'null'],
      [undefined, 'null'],
      [null, 'null'],
      [1, 'null'],
      ['123', 'null'],
      [[], 'null'],
      [{}, 'null'],
      ['#a', 'not null'],
      ['#a', 'not null'],
      ['div', 'not null'],
      ['.c', 'not null'],
      ['.c span', 'not null'],
      ['#a, #b', 'length', 2],
      ['ul li:first-child, ul li:last-child', 'length', 2]
    ]
  },
  {
    name: 'removeNode',
    async bf () {
      if (isCoverage) return document.body.innerHTML = CONF['html']['dom']
      await page.goto(CONF['url']['dom'])
      await page.addScriptTag({ content: `${removeNode} ${$}` });
    },
    async f (data) {
      const cb = data => (removeNode($(data[0])), $(data[0]))
      const ele = isCoverage ? cb(data) : await page.evaluate(cb, data)
      expect(ele ? (ele.length === void 0 ? 1 : ele.length) : 0).toBe(data[1])
    },
    datas: [
      ['', 0],
      [undefined, 0],
      [null, 0],
      [1, 0],
      ['123', 0],
      [[], 0],
      [{}, 0],
      ['#a div', 0],
      ['.c', 1],
      ['.c span', 0],
      ['ul li', 1],
      ['ul li', 0],
      ['#a, #b', 0],
    ]
  },
  {
    name: 'insertAfter',
    async bf () {
      if (isCoverage) return document.body.innerHTML = CONF['html']['dom']
      await page.goto(CONF['url']['dom'])
      await page.addScriptTag({ content: `${insertAfter} ${$}` });
    },
    async f (data) {
      const cb = data => (insertAfter($(data[0]), $(data[1])), ($(data[1])?.nextSibling || ($(data[1]) || document.body).lastChild)[data[2]])
      const attr = isCoverage ? cb(data) : await page.evaluate(cb, data)
      expect(attr).toBe(data[3])
    },
    datas: [
      ['#a', '#b', 'id', 'a'],
      ['#a, #b', '.c', 'id', 'b'],
      ['ul li:first-child, ul li:last-child', '', 'tagName', 'LI'],
      ['ul li:first-child, ul li:last-child', undefined, 'tagName', 'LI'],
      ['li:first-of-type, li:last-of-type', null, 'tagName', 'LI'],
      [null, null, 'tagName', 'LI']
    ]
  },
  {
    name: 'addClass',
    async bf () {
      if (isCoverage) return document.body.innerHTML = CONF['html']['dom']
      await page.goto(CONF['url']['dom'])
      await page.addScriptTag({ content: `${addClass} ${$}` });
    },
    async f (data) {
      const cb = data => {
        addClass($(data[0]), data[1])
        const o = $(data[0])
        if (o) {
          if (o.length) return o.map(v => v.className).join(' ')
          return o.className
        } 
        return 'undefined'
      }
      const className = isCoverage ? cb(data) : await page.evaluate(cb, data)
      expect(className).toMatch(data[2])
    },
    datas: [
      [null, 'a1', 'undefined'],
      [undefined, 'a1', 'undefined'],
      [undefined, null, ''],
      ['#a', 'a1', 'a1'],
      ['#a, #b', 'a2', /a2.*?a2/]
    ]
  },
  {
    name: 'removeClass',
    async bf () {
      if (isCoverage) return document.body.innerHTML = CONF['html']['dom']
      await page.goto(CONF['url']['dom'])
      await page.addScriptTag({ content: `${removeClass} ${$}` });
    },
    async f (data) {
      const cb = data => {
        removeClass($(data[0]), data[1])
        const o = $(data[0])
        if (o) {
          if (o.length) return o.map(v => v.className).join(' ')
          return o.className
        } 
        return ''
      }
      const className = isCoverage ? cb(data) : await page.evaluate(cb, data)
      expect(className).not.toContain(data[1])
    },
    datas: [
      [null, 'a1', 'no error'],
      [undefined, 'a1', 'no error'],
      [undefined, null, 'no error'],
      ['#a', 'a-c', 'not a-c'],
      ['#a, #b', 'b-c', 'not b-c']
    ]
  },
  {
    name: 'getAbsoluteUrl',
    async bf () {
      if (isCoverage) {
        delete window.location
        return window.location = new URL(CONF['url']['dom'])
      }
      await page.goto(CONF['url']['dom'])
      await page.addScriptTag({ content: `${getAbsoluteUrl}` });
    },
    async f (data) {
      const cb = data => getAbsoluteUrl(data[0])
      const absoluteUrl = isCoverage ? cb(data) : await page.evaluate(cb, data)
      expect(absoluteUrl).toBe(data[1])
    },
    datas: [
      ['', CONF['url']['dom']],
      [null, CONF['url']['dom']],
      [undefined, CONF['url']['dom']],
      ['/', CONF['url']['root']],
      ['/jerojiang', CONF['url']['root'] + 'jerojiang'],
      ['./jerojiang', CONF['url']['dom'] + 'jerojiang'],
      ['../jerojiang', CONF['url']['test'] + 'jerojiang'],
      ['../../jerojiang', CONF['url']['root'] + 'jerojiang'],
      ['../../../jerojiang', CONF['url']['root'] + 'jerojiang'],
      ['...././...../jerojiang', CONF['url']['root'] + 'jerojiang'],
      ['...././...../jerojiang/../', CONF['url']['root']],
      ['...././jerojiang/.././jerojiang/..././jerojiang', CONF['url']['test'] + 'jerojiang']
    ]
  },
  {
    name: 'debounce',
    async bf () {
      if (isCoverage) return window.scrollBy = window.scrollTo = jest.fn()
      await page.goto(CONF['url']['dom'])
      await page.addScriptTag({ content: `${debounce}` });
    },
    async f (data) {
      const cb = (data, isCoverage) => {
        let count = 0, scrollCount = 0, timer = null
        const scrollFn = debounce(() => count++, data[0])
        addEventListener('scroll', scrollFn)
        return new Promise((resolve => {
          timer = setInterval(() => {
            if (scrollCount++ === 10) {
              clearInterval(timer)
              removeEventListener('scroll', scrollFn)
              scrollTo(0, 0)
              resolve(count + 1)
            } else isCoverage ? scrollFn() : scrollBy(0, 1)
          }, data[1])
        }))
      }
      const count = isCoverage ? await cb(data, isCoverage) : await page.evaluate(cb, data, isCoverage)
      expect(data[2] === 1 ? count === data[2] : count >= data[2]).toBe(true)
    },
    datas: [
      [30, 1000 / 60, 1], // 防抖时间间隔 > 事件触发时间间隔，实际执行1次
      [60, 30, 1], // 防抖时间间隔 > 事件触发时间间隔，实际执行1次
      [1000 / 60, 30, 9], // 防抖时间间隔 < 事件触发时间间隔，实际执行>=9次
      ['', 30, 9], // 默认防抖时间间隔 1000 / 60 ms
      [undefined, 30, 9], 
      [null, 30, 9], 
      [[], 30, 9], 
      [{}, 30, 9], 
    ]
  },
  {
    name: 'throttle',
    async bf () {
      if (isCoverage) return window.scrollBy = window.scrollTo = jest.fn()
      await page.goto(CONF['url']['dom'])
      await page.addScriptTag({ content: `${throttle}` });
    },
    async f (data) {
      const cb = (data, isCoverage) => {
        let count = 0, scrollCount = 0, timer = null
        const scrollFn = throttle(() => count++, data[0])
        addEventListener('scroll', scrollFn)
        return new Promise((resolve => {
          timer = setInterval(() => {
            if (scrollCount++ === 10) {
              clearInterval(timer)
              resolve(count)
            } else isCoverage ? scrollFn() : scrollBy(0, 1)
          }, data[1])
        }))
      }
      const count = isCoverage ? await cb(data, isCoverage) : await page.evaluate(cb, data, isCoverage)
      expect(count).toBeGreaterThanOrEqual(data[2])
      expect(count).toBeLessThanOrEqual(data[3])
    },
    datas: [
      [30, 1000 / 60, 3, 5, '[3, 5]'], // 节流时间间隔 > 事件触发间隔，触发>=10次，实际执行 166ms / 30ms | 0 <= 5（3 ~ 5）
      [60, 30, 3, 5, '[3, 5]'], // 节流时间间隔 > 事件触发间隔，触发>=10次，实际执行 300ms / 60ms | 0 <= 5（3 ~ 5）
      [1000 / 60, 30, 8, 18, '[8, 18]'], // 节流时间间隔 < 事件触发间隔，触发>=10次，实际执行 300ms / 1000 * 60 | 0 <= 18 (8 - 18)
      ['', 30, 8, 18, '[8, 18]'], // 默认节流时间间隔 1000 / 60 ms
      [undefined, 30, 8, 18, '[8, 18]'], 
      [null, 30, 8, 18, '[8, 18]'], 
      [[], 30, 8, 18, '[8, 18]'], 
      [{}, 30, 8, 18, '[8, 18]']
    ]
  },
  {
    name: 'removeItemByIndex',
    f: data => expect(removeItemByIndex(...data.slice(0, -1))).toStrictEqual(data[data.length - 1]),
    datas: [
      ['', null, null],
      ['1', [], []],
      ['-1', {}, {}],
      ['-1', void 0, void 0],
      [1n, [1, 2, 3], [1, 2, 3]],
      ['', [1, 2, 3], [2, 3]],
      [void 0, [1, 2, 3], [2, 3]],
      [null, [1, 2, 3], [2, 3]],
      [0, [1, 2, 3], [2, 3]],
      ['0', [1, 2, 3], [2, 3]],
      [false, [1, 2, 3], [2, 3]],
      ['1', [1, 2, 3], [1, 3]],
      [true, [1, 2, 3], [1, 3]],
      ['1.5', [1, 2, 3], [1, 3]],
      [[2], [1, 2, 3], [1, 2]],
      [['2'], [1, 2, 3], [1, 2]],
      [-1, [1, 2, 3], [1, 2]],
      ['-2', [1, 2, 3], [1, 3]],
      ['-4', [1, 2, 3], [2, 3]],
      [4, [1, 2, 3], [1, 2, 3]],
      ['5', [1, 2, 3], [1, 2, 3]]
    ]
  },
  {
    name: 'removeItemByValue',
    f: data => expect(removeItemByValue(...data.slice(0, -1))).toStrictEqual(data[data.length - 1]),
    datas: [
      ['', null, null],
      ['1', [], []],
      ['-1', {}, {}],
      ['-1', void 0, void 0],
      [1n, [0, 1, 2], [0, 1, 2]],
      ['', [0, 1, 2], [0, 1, 2]],
      [void 0, [0, 1, 2], [0, 1, 2]],
      [null, [0, 1, 2], [0, 1, 2]],
      ['0', [0, 1, 2], [0, 1, 2]],
      [+0, [0, 1, 2], [1, 2]],
      [-0, [0, 1, 2], [1, 2]],
      [1, [0, 1, 2], [0, 2]],
      [2, [0, 1, 2], [0, 1]],
      [-3, [0, 1, 2], [0, 1, 2]],
      [3, [0, 1, 2], [0, 1, 2]]
    ]
  },
  {
    name: 'stringifyJSON',
    f: data => expect(stringifyJSON(...data.slice(0, -1))).toContain(data[data.length - 1]),
    datas: [
      [{ a: void 0 }, '{"a":"undefined"}'],
      [{ a :1n }, '{"a":"1"}'],
      [{ a: () => { const a = 1 } }, 'const a = 1'],
      [{ a() { const a = 1 } }, 'const a = 1'],
      [{ a: new Function }, 'function anonymous'],
      [{ a: function a() { const a = 1 } }, 'const a = 1'],
      [{ a: Symbol(1) }, '{"a":"Symbol(1)"}']
    ]
  },
  {
    name: 'delHtmlTag',
    f: data => expect(delHtmlTag(...data.slice(0, -1))).toBe(data[data.length - 1]),
    datas: [
      ['', ''],
      [null, ''],
      [void 0, ''],
      [[], ''],
      ['<P>纯文本<a href="http://www.baidu.com"></A></p>', '纯文本'],
      ['<P>非HTML标签不过滤<react><a href="http://www.baidu.com"></A></p>', '非HTML标签不过滤<react>'],
      ['<tt>>>过滤连续多余的></Tt>>', '过滤连续多余的>'],
      ['<img src="http://a.com/1.jpg" <iframe src="" >不正确的标签嵌套</isindex>', '不正确的标签嵌套'],
      ['<ddt src="<script src="属性" >属性里的标签</main>', '属性里的标签'],
      ['<link href="<meta \n\n\nviewport="属性\n\n" >换行\n</command><address>标签</command>', '换行\n标签']
    ]
  },
  {
    name: 'htmlEncode',
    f: data => expect(htmlEncode(...data.slice(0, -1))).toBe(data[data.length - 1]),
    datas: [
      ['', ''],
      [null, ''],
      [void 0, ''],
      [[], ''],
      ['<a>标签</a>', '&lt;a&gt;&#x6807;&#x7b7e;&lt;&#x2F;a&gt;'],
      ['"><script>alert(1)</script>', '&quot;&gt;&lt;script&gt;alert(1)&lt;&#x2F;script&gt;'],
      ['"%3e%3cscript%3ealert(1)%3c/script%3e', '&quot;%3e%3cscript%3ealert(1)%3c&#x2F;script%3e'],
      ['%00"><script>alert(1)</script>', '%00&quot;&gt;&lt;script&gt;alert(1)&lt;&#x2F;script&gt;'],
      ['"><scr<script>ipt>alert(1)</scr</script>ipt>', '&quot;&gt;&lt;scr&lt;script&gt;ipt&gt;alert(1)&lt;&#x2F;scr&lt;&#x2F;script&gt;ipt&gt;'],
      ['<style onreadystatechange=alert(1)>你好</style>', '&lt;style&nbsp;onreadystatechange=alert(1)&gt;&#x4f60;&#x597d;&lt;&#x2F;style&gt;'],
      ['<input type=image src=1 onreadystatechange=alert(1) value="中文Eng123_&*">', '&lt;input&nbsp;type=image&nbsp;src=1&nbsp;onreadystatechange=alert(1)&nbsp;value=&quot;&#x4e2d;&#x6587;Eng123_&amp;*&quot;&gt;'],
      ['<[%00]img src="1%c0%22 onerror="alert%26%23x28%3b1%26%23x29%3b">', '&lt;[%00]img&nbsp;src=&quot;1%c0%22&nbsp;onerror=&quot;alert%26%23x28%3b1%26%23x29%3b&quot;&gt;']
    ]
  },
  {
    name: 'javaScriptEncode',
    f: data => expect(javaScriptEncode(...data.slice(0, -1))).toBe(data[data.length - 1]),
    datas: [
      ['', ''],
      [null, ''],
      [void 0, ''],
      ['; alert(1); var foo=', '\\x3b\\x20alert\\x281\\x29\\x3b\\x20var\\x20foo\\x3d'],
      ['\'); alert(1);//', '\\\'\\x29\\x3b\\x20alert\\x281\\x29\\x3b\\x2f\\x2f'],
      ['1\')%3Balert(\'1', '1\\\'\\x29\\x253Balert\\x28\\\'1'],
      ['1%27)%3balert(%271', '1\\x2527\\x29\\x253balert\\x28\\x25271'],
      ['1\') || alert(\'1', '1\\\'\\x29\\x20\\x7c\\x7c\\x20alert\\x28\\\'1'],
      ['\'};alert(1); function a(){//', '\\\'\\x7d\\x3balert\\x281\\x29\\x3b\\x20function\\x20a\\x28\\x29\\x7b\\x2f\\x2f'],
      ['; alert(\'aA_1\'); var 中文变量=$`', '\\x3b\\x20alert\\x28\\\'aA\\x5f1\\\'\\x29\\x3b\\x20var\\x20\\u4e2d\\u6587\\u53d8\\u91cf\\x3d\\x24\\x60'],
      ['\'); alert(\'中文&$#!()+—%_.?{}\');//', '\\\'\\x29\\x3b\\x20alert\\x28\\\'\\u4e2d\\u6587\\\&\\x24\\x23\\x21\\x28\\x29\\x2b\\u2014\\x25\\x5f\\x2e\\x3f\\x7b\\x7d\\\'\\x29\\x3b\\x2f\\x2f']
    ]
  },
  {
    name: 'isRefererValid',
    f: data => expect(isRefererValid(...data.slice(0, -1))).toBe(data[data.length - 1]),
    datas: [
      ['', {}, true],
      ['', { nullable: false }, false],
      ['http://localhost:3000', {}, false],
      ['http://localhost:3000', { whiteList: ['localhost:3000'] }, true], 
      ['https://localhost:3000', { whiteList: ['localhost:3000'] }, true], // https协议 
      ['http://localhost:3000?a=1&a=2', { whiteList: ['localhost:3000'] }, true], // 含有 查询字符串
      ['https://localhost:3000?a=1&b=2', { whiteList: ['localhost:3000'] }, true],
      ['http://localhost:3000/a', { whiteList: ['localhost:3000'] }, true], // 结尾非 / 
      ['https://localhost:3000/a', { whiteList: ['localhost:3000'] }, true],
      ['http://localhost:3000/a/b/', { whiteList: ['localhost:3000'] }, true], // 结尾是 /
      ['http://localhost', { whiteList: ['localhost:3000'] }, false], // 端口不同
      ['https://localhost', { whiteList: ['localhost:3000'] }, false],
      ['http://localhost:30001', { whiteList: ['localhost:3000'] }, false],
      ['https://localhost:30001', { whiteList: ['localhost:3000'] }, false],
      ['http://localhost', { whiteList: ['localhost:80'] }, true], // 仅允许http链接
      ['https://localhost', { whiteList: ['localhost:80'] }, false],
      ['http://localhost', { whiteList: ['localhost:443'] }, false], // 仅允许https链接
      ['https://localhost', { whiteList: ['localhost:443'] }, true],
      ['http://www.hack.com?http://localhost:3000', { whiteList: ['localhost:3000'] }, false],  // 构造参数
      ['http://www.hack.com?a=http://localhost:3000', { whiteList: ['localhost:3000'] }, false],  
      ['http://a.com/', { whiteList: ['a.co'] }, false], // 域名相似
      ['http://ba.co', { whiteList: ['a.co'] }, false], 
      ['http://a.co.b.com', { whiteList: ['a.co'] }, false],
      ['http://a.com/a.co', { whiteList: ['a.co'] }, false], // 创建文件
      ['http://a.com/a.co/', { whiteList: ['a.co'] }, false], // 创建目录
      ['https://www.wcg.xn--fiqs8s/', { whiteList: ['www.wcg.中国'] }, true], // Punycode域名
      ['https://www.wcg.xn--fiqs8s/', { whiteList: ['www.wcg.xn--fiqs8s'] }, true],
      ['https://www.wcg.xn/', { whiteList: ['www.wcg.xn--fiqs8s'] }, false], 
      ['http://xn--wxtr44c.xn--rhqv96g/', { whiteList: ['百度.世界'] }, true], 
      ['http://xn--wxtr44c.xn--rhqv96g/', { whiteList: ['xn--wxtr44c.xn--rhqv96g'] }, true], 
      ['http://xn--wxtr44c.xn/', { whiteList: ['xn--wxtr44c.xn--rhqv96g'] }, false],
      ['http://a.com:3000', { whiteList: ['*.a.com:3000'] }, false], // 通配符
      ['https://b.a.com:3000', { whiteList: ['*.a.com:3000'] }, true],
      ['https://b.a.com.cn', { whiteList: ['*.a.com'] }, false], // 通配符，不能跨域。不同域
      ['https://c.b.a.com', { whiteList: ['*.a.com'] }, false], // 不同子域
      ['https://c.b.a.com', { whiteList: ['*.***.a.com'] }, true], // 连续*，合并为1个
      ['https://b.a.com', { whiteList: ['*.***.a.com'] }, false], 
      ['https://localhost?b.a.com', { whiteList: ['*.a.com'] }, false],
      ['https://localhost/b.a.com', { whiteList: ['*.a.com'] }, false],
      ['http://a.com', { whiteList: ['a.com:*'] }, true], // http 80端口省略
      ['https://a.com', { whiteList: ['a.com:*'] }, true], // https 443端口省略
      ['https://a.com:3000', { whiteList: ['a.com:*'] }, true],
      ['https://a.co', { whiteList: ['a.co*'] }, true], // 位于末尾的通配符存在安全隐患，不解析，和没有一样
      ['https://a.com', { whiteList: ['a.co*'] }, false],
      ['https://a.co.b.com', { whiteList: ['a.co*'] }, false],
    ]
  }
]