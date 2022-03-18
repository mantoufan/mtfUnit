# mtfUnit
![coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![compatibility](https://img.shields.io/badge/compatibility-IE10+%20%7C%20Firefox%20%7C%20Chrome%20%7C%20Safari%20%7C%20Node-%23989898)
![module-support](https://img.shields.io/badge/module-ES6%20%7C%20CommonJS%20%7C%20AMD%20%7C%20CMD%20%7C%20Global-%23989898)  
Mtfunit is a tiny JavaScript library that includes useful functions to operate strings and DOM
 
# Guide
## Node
### Setup
```
npm i mtfunit -D
```
### Usage
```
import { query } from 'mtfunit'
query('a', 'a = 1') // 1
```
use `require` will be fine too 
## Browser
### Setup
```
<script src="https://cdn.jsdelivr.net/npm/mtfunit@1.0.1/dist/mtfunit.min.js"></script>
```
### Usage
```
<script>
mtfUnit.query('a', 'a = 1') // 1
</script>
```
use `requirejs` will be fine too 
# Document
Read [Document](https://mantoufan.github.io/mtfUnit/) for more functions and details  
Read [Test Report](https://mantoufan.github.io/mtfUnit/coverage/lcov-report/) for coverage 

# ToDo
DOM module will be independent in the future
- mtfUnit
- mtfUnitDom