# 总结
## 完成情况
（1） 真实环境测试  
```
npm test
```
环境：`puppeteer` 即 Chrome Headless  
服务器：`http-server`  并行：`concurrently`  
测试：DOM选择，删除，类名增删，滚动的防抖和节流

（2） jsdom模拟测试
```
npm run coverage
```
测试：滚动触发改为`Jest`模拟计时器触发  
**双环境原因**  
`Jest`的`coverge`不支持`puppeteer`中`evaluate`的脚本 [官方说明](https://jestjs.io/docs/en/puppeteer)  
所以，测试代码覆盖率时转为`jsdom`环境  
DOM测试代码写两套，根据`process.args`传参区分环境  

（3） 测试代码覆盖率 100%  
 详见 [测试报告](http://w.page.imweb.io/adam/coverage/lcov-report)  

![测试代码覆盖率](https://i.loli.net/2021/01/29/iKHm8scw6xugMnB.png)

（4） Npm  

发布包到npmjs：[mtfunit](https://www.npmjs.com/package/mtfunit)

（5） 文档  
自动生成：[文档](http://w.page.imweb.io/adam/)
```
npm run doc
```
- `jsdoc`配置`clean-jsdoc-theme`模版将`README.md`作首页生成文档 

（6） ES6 → ES5  

```
npm run build
```

- `babel`配置`@babel/preset-env`转ES6语法 → ES5语法
- `webpack`配置`environment`强制打包输出使用ES5语法
- `@babel/plugin-transform-runtime`按需引入`@babel/runtime-corejs3`。Polyfill用到的ES6接口


（7） 模块化  
- `webpack`配置`output`指定按兼容`commonjs`、`AMD`、`CMD`的`UMD`规则打包  
  - 配置`globalObject`，`self`改成`this`，除`浏览器`外，兼容`node`环境
- `@babel/plugin-transform-modules-umd`指定Babel按`UMD`规则转换，让引入的Polyfill同样兼容`UMD`模块化  


（8） 规范  
- `StandardJS - JavaScript Standard Style`在`VSCode`中提示和自动修复
- 配置`.editorconfig`，代码格式符合`standardjs`规范

（9） Git Hook  
- `husky`增加`pre-commit`钩子脚本
  - `commit`前，进行覆盖率测试
- `pinst`配置`package.json`的`scripts`，避免使用`npm i mtfunit`的用户受到影响（演示，本例无必要）

（10） 持续集成    
- 配置`.gitlab-ci.yml`部署文档和测试报告到GitLab Page

## 总结
### 测试库
- `test/data.js` 将 测试用例 → JS对象
  - 可配置，高复用，易读（用例和结果），易修改
  - 多数时，只关心 测试数据
  - 如何用 测试数据，可以整理成 模版
    - 封装异步处理，不关心`done`
    - 像同步一样使用
  - 描述根据 测试数据 自动生成  

用例：  

![用例](https://i.loli.net/2021/01/30/lW5c3hLSaoJqkO8.png)
结果：

![结果](https://i.loli.net/2021/01/30/UxYmajZiCfkW4Gd.png)

### JavaScript库
- 短路、逗号运算符、`?.`缩短行数，降低了代码可读性
- 交替用ES5循环和`while`，交替用`Set`和数组
  - 优先可读性、优先性能、优先行数少写法，都可尝试
- 赋值、指针代替数组的`push` > `unshift` > `splice`
- 用哈希表简化多重条件判断
- 获取绝对路径时，用栈代替正则
- 总是隐式转换入参，尽可能地避免意外地类型、空报错
- 函数始终有返回值，方便连续调用
  - 未来加原型和继承，挂上方法，返回this，可链式调用
  - 未来可将DOM库作为Web专用独立出来

### 体会
本项目实现的JavaScript库相对简单，代码编写时间不长      
我在`puppeteer`和`jsdom`双环境的DOM测试，以及支持PolyFill的`UMD`模块块上配置上，花费了更长时间  
原因是跳着阅读文档，急于从`stackoverflow`找到答案，结果转了一圈又回到文档，发现答案就在文档里  

> 面向搜索编程，能节省时间，也能浪费时间。没有好好看文档，就准备好浪费时间  

测试一直被我忽视，但是在完成本项目的过程中，特别是组织测试用例时，我体会到了
1. 做算法题，玩游戏时，自己设计关卡，然后通关的**成就感**
2. 在设计中，不断考虑**边界**条件，代码**更健壮**
3. 测试覆盖率，可以**优化代码**或**完善用例**
4. **更放心地修改**代码，**更自信地提交**代码
5. 人可能心情不好或出错。先测试再提交，减少**人为影响**
6. 什么都想**工程化**，虽然我在怎么实现工程化花费了更长时间