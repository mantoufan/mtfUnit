const { query, serialize, $, removeNode, insertAfter, addClass, removeClass, getAbsoluteUrl, debounce, throttle, removeItemByIndex, removeItemByValue, htmlEncode, javaScriptEncode } = require('../dist/mtfunit.js')
console.log(query('d', 'd= 1'))
console.log(getAbsoluteUrl('/a/b/c'))