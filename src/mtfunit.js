/**
 * 获取指定的 querystring 中指定 name 的 value
 * @param {String} name 查询名
 * @param {String} querystring 查询到的值
 * @return {String|undefined} 查询到返回String，没有返回undefined
 */
function query (name, querystring) {
  if (name && name.match(/(?:http[s]?:|^)\/{2}.*?(?:\.)/)) name = encodeURIComponent(name) // 仅编码Url
  const r = (querystring + '').match(new RegExp('(?:^|&)\\s*?' + name + '\\s*=\\s*(.*?)\\s*(?:&|$)')) 
  return r === null ? undefined : decodeURIComponent(r[1])
}

/**
 * 序列化对象，把对象转成URL查询字符串
 * @param {Object} data 对象
 * @return {String} 返回查询字符串
 */
function serialize (data) {
  let queryString = []
  Object.keys(data || {}).forEach(key => typeof key === 'string' && queryString.push(encodeURIComponent(key) + '=' + encodeURIComponent(typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key])))
  return queryString.join('&')
}

/**
 * 根据选择器查找 DOM
 * @param {String} selector 选择器名称，用法同CSS选择器
 * @return {DOM|Null|Array} 群组选择器（含,）返回Array。其他选择器，找到返回第一个DOM，没有返回Null
 */
function $ (selector) {
  if (!selector) return null
  let selectorStr = (selector + '').replace(/,$/, '') , i = -1
  try {
    const nComma = selectorStr.split(',').length, r = document.querySelectorAll(selectorStr), res = []
    if (nComma > 1) {
      while (++i < nComma && r[i]) res[i] = r[i]
      return res
    }
    return r[0] || null
  } catch (e) {
    return null
  }
}

/**
 * 删除 DOM 节点
 * @param {DOM|ArrayLike} node 要删除的节点或节点列表
 * @return {DOM|ArrayLike} 返回值被删除的节点或节点列表，与传参 node 相同
 */

function removeNode (node) {
  return (node && node.length ? Array.from(node) : [node]).map(node => node?.parentNode?.removeChild(node)), node
}

/**
 * 在 target 节点之后插入 node 节点
 * @param {DOM|ArrayLike} node 要插入的节点或节点列表
 * @param {DOM|Null} target 插入目标节点的后方，若目标节点不存在，则插入父节点的末尾
 * @return {DOM|ArrayLike} 返回被插入的节点或节点列表，与传参 node 相同
 */
function insertAfter (node, target) {
  if (!node || node.length === 0) return null
  let fragment = document.createDocumentFragment()
  if (node && node.length) for (let i = 0; i < node.length; i++) fragment.appendChild(node[i])
  else fragment = node
  return (target?.parentNode || document.body).insertBefore(fragment, target?.nextSibling || null), node
}

/**
 * 添加类名
 * @param {DOM|ArrayLike} node 要添加类名的节点或节点列表
 * @param {String|Array} className 要添加的类名
 * @return {DOM|ArrayLike} 返回添加类名的节点或节点列表，与传参 node 相同
 */
function addClass (node, className) {
  return (node && node.length ? Array.from(node) : [node]).map(node => node?.classList.add(className)), node
}


/**
 * 移除类名
 * @param {DOM|Array<Dom>} node 要移除类名的节点或节点列表
 * @param {String|Array} className 要移除的类名
 * @return {DOM|ArrayLike} 返回移除类名的节点或节点列表，与传参 node 相同
 */
function removeClass (node, className) {
  return (node && node.length ? Array.from(node) : [node]).map(node => node?.classList.remove(className)), node
}

/**
 * 获取绝对路径
 * @param {String} url // 相对路径
 * @return {String} // 返回路径的值与浏览器处理相对路径相同
 */
function getAbsoluteUrl (url) {
  if (!url) return location.href
  url += ''
  const { origin, pathname } = location
  const stack = pathname.replace(/^\/|\/$/g, '').split('/')
  for (let i = 0, w = ''; i <= url.length; i++) {
    const s = url[i]
    if (s === '/' || s === void 0) {
      if (w.substring(0, 2) === '..') {
        stack.pop()
      } else if (w !== '.') {
        i === 0 ? stack.length = 0 : stack.push(w)
      }
      w = ''
    } else w += s
  } 
  return origin + '/' + stack.join('/')
}

/**
 * 防抖
 * @param {Function} callback 回调函数
 * @param {Number} time 延迟时间
 * @return {Function} 防抖的函数
 */
function debounce (callback, time) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      callback.apply(this, args)
    }, time + '' | 0 || 1000 / 60)
  }
}

/**
 * 节流
 * @param {Function} callback 回调函数
 * @param {Number} time 时间间隔
 * @return {Function} 节流的函数
 */
function throttle (callback, time) {
  let timer = null
  return function (...args) {
    if (timer) return
    timer = setTimeout(() => {
      timer = null
      callback.apply(this, args)
    }, time + '' | 0 || 1000 / 60)
  }
}

/**
 * 根据索引移出数组的某一项
 * @param {Number} index 要删除的索引。正负和边界处理与Array.prototype.splice的第一参数相同
 * @param {Array} arr 要操作的数组
 * @return {Array} 返回操作后的数组
 */
function removeItemByIndex (index, arr) {
  if (!arr || !arr.length || typeof index === 'bigint') return arr
  const n = arr.length
  index |= 0
  if (index >= n) return arr
  if (index < 0) index = index <= -n ? 0 : index % n + n 
  const r = Array(n - 1)
  for (let i = 0, j = 0; i < n; i++)
    if (i !== index) r[j++] = arr[i]
  return r
}

/**
 * 根据值移出数组的某一项
 * @param {Number} index 要删除的值。严格相等匹配与Array.prototype.indexOf相同
 * @param {Array} arr 要操作的数组
 * @return {Array} 返回操作后的数组
 */
function removeItemByValue (value, arr) {
  if (!arr || !arr.length) return arr
  const n = arr.length, r = []
  for (let i = 0, j = 0; i < n; i++)
    if (arr[i] !== value) r[j++] = arr[i]
  return r
}

/**
 * JSON.stringify：保留对象中undefined、BigInt值和Function、Symbol结构
 * @param {Object} obj JS对象
 * @return {String} 返回序列化后的字符串
 */
function stringifyJSON (obj) {
  const s = new Set(['undefined', 'bigint', 'function', 'symbol'])
  return JSON.stringify(obj, (_, v) => s.has(typeof v) ? String(v) : v)
}

/**
 * 富文本 → 纯文本
 * @param {String} html 富文本字符串
 * @return {String} 返回纯文本字符串
 * ALL HTML TAG List Source：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element
 */
function delHtmlTag (html) {
  const TAG = 'html|base|head|link|meta|style|title|body|address|article|aside|footer|header|h1|h2|h3|h4|h5|h6|hgroup|main|nav|section|blockquote|dd|dir|div|dl|dt|figcaption|figure|hr|li|main|ol|p|pre|ul|a|abbr|b|bdi|bdo|br|cite|code|data|dfn|em|i|kbd|mark|q|rb|rp|rt|rtc|ruby|s|samp|small|span|strong|sub|sup|time|tt|u|var|wbr|area|audio|img|map|track|video|applet|embed|iframe|noembed|object|param|picture|source|canvas|noscript|script|del|ins|caption|col|colgroup|table|tbody|td|tfoot|th|thead|tr|button|datalist|fieldset|form|input|label|legend|meter|optgroup|option|output|progress|select|textarea|details|dialog|menu|menuitem|summary|content|element|shadow|slot|template|acronym|applet|basefont|bgsound|big|blink|center|command|content|dir|element|font|frame|frameset|image|isindex|keygen|listing|marquee|menuitem|multicol|nextid|nobr|noembed|noframes|plaintext|shadow|spacer|strike|tt|xmp'
  return ((html || '') + '').replace(new RegExp('<\\/?(' + TAG + ')([\\s\\S]*?)>((?!<)>)*', 'ig'), '')
}

/**
 * 转义：HTML → HTMLEntites
 * @param {String} html 富文本字符串
 * @return {String} 返回转义后的字符串，转换非ASCII编码字符
 */
function htmlEncode (html) {
  const h = { "10": "<br/>", "32": "&nbsp;", "34": "&quot;", "38": "&amp;", "39": "&#x27;", "47": "&#x2F;", "60": "&lt;", "62": "&gt;", "162": "&cent;", "192": "&Agrave;", "193": "&Aacute;", "194": "&Acirc;", "195": "&Atilde;", "196": "&Auml;", "197": "&Aring;", "198": "&AElig;", "199": "&Ccedil;", "200": "&Egrave;", "201": "&Eacute;", "202": "&Ecirc;", "203": "&Euml;", "204": "&Igrave;", "205": "&Iacute;", "206": "&Icirc;", "207": "&Iuml;", "208": "&ETH;", "209": "&Ntilde;", "210": "&Ograve;", "211": "&Oacute;", "212": "&Ocirc;", "213": "&Otilde;", "214": "&Ouml;", "216": "&Oslash;", "217": "&Ugrave;", "218": "&Uacute;", "219": "&Ucirc;", "220": "&Uuml;", "221": "&Yacute;", "222": "&THORN;", "223": "&szlig;", "224": "&agrave;", "225": "&aacute;", "226": "&acirc;", "227": "&atilde;", "228": "&auml;", "229": "&aring;", "230": "&aelig;", "231": "&ccedil;", "232": "&egrave;", "233": "&eacute;", "234": "&ecirc;", "235": "&euml;", "236": "&igrave;", "237": "&iacute;", "238": "&icirc;", "239": "&iuml;", "240": "&eth;", "241": "&ntilde;", "242": "&ograve;", "243": "&oacute;", "244": "&ocirc;", "245": "&otilde;", "246": "&ouml;", "248": "&oslash;", "249": "&ugrave;", "250": "&uacute;", "251": "&ucirc;", "252": "&uuml;", "253": "&yacute;", "254": "&thorn;", "255": "&yuml;" }
  html = (html || '') + ''
  let r = '', t, i = -1
  while (++i < html.length) 
    r += h[t = html.charCodeAt(i)] || (t > 127 ? `&#x${t.toString(16).padStart(4, 0)};` : html[i])
  return r
}

/**
 * 转义：JavaScript代码 → 字符串
 * @param {String} js JavaScript代码
 * @return {String} 返回转义后的字符串，转换非ASCII编码字符
 */
function javaScriptEncode (js) {
  const h = { 8: '\\b', 9: '\\t', 10: '\\n', 12: '\\f', 13: '\\r', 34: '\\"', 38: '\\&', 39: '\\\'', 47: '\\x2f', 60: '\\x3c', 62: '\\x3e', 92: '\\\\' }
  const isW = t => t > 47 && t < 58 || t > 64 && t < 91 || t > 96 && t < 123 // 大小写字母 + 数字（不含_）
  js = (js || '') + ''
  let r = '', t, i = -1
  while (++i < js.length)
    r += h[t = js.charCodeAt(i)] || (t > 127 ? `\\u${t.toString(16).padStart(4, 0)}` : isW(t) ? js[i] : `\\x${t.toString(16)}`)
  return r
}

/**
 * @param {String} referer 来源
 * @param {Boolean} nullable 允许为空：默认允许
 * @param {Array}} whiteList 白名单：域名 + 端口 白名单（不含http和https）
 */
function isRefererValid  (referer, { nullable = true, whiteList = [] }) {
  const punycode = require('./punycode')
  return nullable && !referer 
      || RegExp('^http[s]?://(' + whiteList.map(v => {
           let [ host, port ] = v.split(':')
           if (port === void 0) port = '(443|80)'
           else if (port === '*') port = '\\d+' 
           host = punycode.ToASCII(host).replace(/\*+(?!$)/g, '\\w+').replace(/\*+$/, '')
           return host + ':' + port
         }).join('|') + ')(\\?|/|$)').test(
           referer.replace(/(?<=^http(s)?:\/\/[^:]*?)(\/|\?|$)/, (_, ssl, end) => ':' + (ssl ? 443 : 80) + end)
         )
}

module.exports = { query, serialize, $, removeNode, insertAfter, addClass, removeClass, getAbsoluteUrl, debounce, throttle, removeItemByIndex, removeItemByValue, stringifyJSON, delHtmlTag, htmlEncode, javaScriptEncode, isRefererValid }