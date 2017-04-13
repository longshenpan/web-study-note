---
title: interview
category: html、css、js和性能问题
---

## 面试相关问题

###1、闭包

**为什么使用闭包：**

>使用闭包主要是为了设计私有变量和方法。闭包的优点是可以避免全局变量的污染，缺点是闭包会常驻内存，会增大内存使用量，使用不当容易造成内存泄漏。

闭包特性:

- 函数嵌套函数
- 函数内部可以引用外部的参数和变量
- 参数和变量不会被垃圾回收机制回收

**闭包使用场景**


###2、事件委托

**定义**

:   事件委托就是利用事件冒泡，只指定一个事件处理程序，就可以管理某一类型的所有事件。非事件委托为产生如下性能问题：

    + 每个函数都是一个对象，都会占用内存；内存中的对象越多，性能越差；
    + 必须事先指定所有事件处理程序而导致的DOM访问次数，会延迟整个页面的交互就绪时间。

:   使用事件委托的优点：

    + document对象很快就可以访问，而且可以在页面生命周期的任何时间点上为它添加  事件处理程序(无需等待DOMContentLoaded或load事件)                     。换句话说，只要可单击的元素呈现在页面上，就可以立即具备适当的功能。
    + 在页面中设置事件处理程序所需的时间更少。只添加一个事件处理程序所需的Dom引    用更少，所花的时间也更少。
    + 整个页面占用的内存空间更少，能够提升整体性能。


###3、js跨域请求的方式

**jsonp跨域**

+ 通过修改document.domain来跨子域
+ 使用window.name来跨域
+ 跨资源共享CORS需要服务器设置header: Access-Control-Allow-Origin， 允许网页从不同的域访问其资源
+ HTML5中的window.postMessage方法跨域传送数据
+ jsonp 和 跨资源共享的区别：
    1. jsonp只支持get请求，cors可以支持所有的http请求；
    2. 使用CORS，开发者可以使用普通的XMLHttpRequest发起请求和获取数据，比起jsonp有更好的错误处理；
    3. Jsonp主要被老的浏览器支持，他们往往不支持CORS。而绝大多数现代浏览器都已经支持CORS。

###4、防抖和节流
以下场景往往由于事件频繁被触发，因而频繁执行DOM操作、资源加载等重行为，导致UI停顿甚至浏览器崩溃:

1. window对象的resize、scroll事件
2. 拖拽时的mousemove事件
3. 射击游戏中的mousedown、keydown事件
4. 文字输入、自动完成的keyup事件

实际上对于window的resize事件，实际需求大多为停止改变大小n毫秒后执行后续处理；而其他事件大多的需求是以一定的频率执行后续处理。针对这两种需求就出现了debounce和throttle两种解决办法。函数节流和函数防抖都是优化高频率执行js代码的一种手段函数节流是指在一定的时间内，只执行一次js代码函数防抖是指频繁触发的情况下，只有足够的空闲时间，才执行代码一次。debounce和throttle均是通过减少实际逻辑处理过程的执行来提高事件处理函数运行性能的手段，并没有实质上减少事件的触发次数节流函数:
```js
    /**
    * 空闲控制 返回函数连续调用时，空闲时间必须大于或等于 idle，action 才会执行
    * @param idle   {number}    空闲时间，单位毫秒
    * @param action {function}  请求关联函数，实际应用需要调用的函数
    * @return {function}    返回客户调用函数
    */
    debounce(idle,action)
    var debounce = function(idle, action){
        var last;
        return function(){
            var ctx = this, args = arguments;
            clearTimeout(last);
            last = setTimeout(function(){
                action.apply(ctx, args);
            }, idle);
        };
    }
    /**
    * 频率控制 返回函数连续调用时，action 执行频率限定为 次 / delay
    * @param delay  {number}    延迟时间，单位毫秒
    * @param action {function}  请求关联函数，实际应用需要调用的函数
    * @return {function}    返回客户调用函数
    */
    throttle(delay, action);
    var throttle = function(delay, action){
      var last = 0;
      return function(){
        var curr = +new Date()
        if (curr - last > delay){
          action.apply(this, arguments);
          last = curr;
        }
      };
    }
```
###5、类继承和原型继承

**类继承：**

:   类式继承是在函数对象内调用父类的构造函数，使得自身获得父类的方法和属性,call和apply方法为类式继承提供了支持。通过改变this的作用环境，使得子类本身具有父类的各种属性。
```js
var father = function() {
  this.age = 52;
  this.say = function() {
    alert('hello i am '+ this.name ' and i am '+this.age + 'years old');
  }
}
var child = function() {
  this.name = 'bill';
  father.call(this);
}
var man = new child();
man.say();
```

**原型继承：**

:   原型继承在开发中经常用到。它有别于类继承是因为继承不在对象本身，而在对象的原型上（prototype）。每一个对象都有原型，在浏览器中它体现在一个隐藏的__proto__属性上。在一些现代浏览器中你可以更改它们。

###6、谈谈你对Ajax的理解？（概念、特点、作用）

AJAX全称为"Asynchronous JavaScript And XML"(异步JavaScript和XML)是一种创建交互式网页应用的开发技术、改善用户体验，实现无刷新效果。

###7、css相关问题

####7.1、BFC

BFC 定义:
:   BFC(Block formatting context)直译为"块级格式化上下文"。它是一个独立的渲染区域，只有Block-level box参与， 它规定了内部的Block-level Box如何布局，并且与这个区域外部毫不相干。

**BFC布局规则：**

:   内部的Box会在垂直方向，一个接一个地放置。Box垂直方向的距离由margin决定。属于同一个BFC的两个相邻Box的margin会发生重叠每个元素的margin box的左边， 与包含块border box的左边相接触(对于从左往右的格式化，否则相反)。即使存在浮动也是如此。BFC的区域不会与float box重叠。BFC就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素。反之也如此。计算BFC的高度时，浮动元素也参与计算

**触发BFC的属性：**

1. 根元素
2. float属性不为none
3. position为absolute或fixed
4. display为inline-block, table-cell, table-caption, flex, inline-flex
5. overflow不为visible

####7.2、flex布局

**属性解释：**

+ flex-grow 是扩展比率
+ flex-shrink 是收缩比率
+ flex-basis 伸缩基准值

看以下例子:

```html
<div class="flex-parent">
    <div class="flex-son"></div>
    <div class="flex-son"></div>
    <div class="flex-son"></div>
</div>
<style type="text/css">
    .flex-parent {
        width: 800px;
    }
</style>
```

1) 第一种情况

flex-parent 是父级，而且他的宽度是固定为800px，不会改变；开始设置子级flex属性：

```cs
<style type="text/css">
    .flex-son:nth-child(1){
        flex: 3 1 200px;
    }
    .flex-son:nth-child(2){
        flex: 2 2 300px;
    }
    .flex-son:nth-child(3){
        flex: 1 3 500px;
    }
</style>
```

flex-basis总和加起来为1000px; 那么 1000px > 800px (父级的宽度)；子元素势必要压缩；溢出了200px；

```
son1 = (flex-shrink) * flex-basis；
son2 = (flex-shrink) * flex-basis；
....
sonN = (flex-shrink) * flex-basis；
```

如果flex-basis的总和加起来大于父级宽度，子级被压缩，最后的选择是flex-shrink来进行压缩计算

```
加权值 = son1 + son2 + …. + sonN；

那么压缩后的计算公式就是

压缩后宽度 w = (子元素flex-basis值 * (flex-shrink)/加权值) * 溢出值

所以最后的加权值是
1*200 + 2*300 + 3*500 = 2300px

son1的扩展量：(200 * 1/ 2300) * 200，即约等于17px；
son2的扩展量：(300 * 2/ 2300) * 200，即约等于52px；
son3的扩展量：(500 * 3/ 2300) * 200，即约等于130px；

最后son1、son2、son3，的实际宽度为：
200 – 16  = 184px；
300 – 52  = 248px；
500 – 130 = 370px；
```

2) 第二种情况

上面的例子已经说明，继续看第二个例子，同样上面的例子，我们改下父级宽度为1200px;
flex-basis的总和为 1000px，小于父级宽度，将有200px的剩余宽度；既然有剩余，我们就不要加权计算，剩余的宽度将根据flex-grow，值得总和进行百分比，那么200px就会根据份数比来分配剩余的空间；

```
剩余后宽度 w = (子元素flex-grow值 /所有子元素flex-grow的总和) * 剩余值

总分数为 total = 1 + 2 + 3；

son1的扩展量：(3/total) * 200，即约等于100px；
son2的扩展量：(2/total) * 200，即约等于67px；
son3的扩展量：(1/total) * 200，即约等于33px；

最后son1、son2、son3，的实际宽度为：
200 + 100 = 300px；
300 + 67 = 367px；
500 + 33 = 533px；
```

**总结**

所以以上两种情况下，第二种flex-basis和flex-shrink是不列入计算公式的；第一种flex-grow是不列入计算公式的。ok，上面的两种情况总结完毕，但是很多时候我们的父级是不固定的，那么怎么办，其实很简单了，对照上面的公式，前提是已经设置了flex-basis值得元素，如果宽度的随机值小于flex-basis的时候就按第一种计算，反之第二种；明白了吧。

但是在实际中，我们有些子元素不想进行比例分配，永远是固定的，那么flex就必须设置为none；否则设置的宽度（width）将无效；

```
flex: 1,    则其计算值为 flex: 1 1 0%；
flex: auto, 则其计算值为 flex: 1 1 auto；
flex: none, 则其计算值为 flex: 0 0 auto；
```
根据上面的公式

+ flex：1的时候第一种方式其实是无效的，因为加权值是0，所以只能是第二种方式计算；
+ flex：none的时候，两种都失效，自己元素不参与父级剩余还是溢出的分配，flex：none的应用场景还是很多的；

####7.3、垂直居中

**高度已知时垂直居中**

+ 使用绝对定位，而且父元素使用相对定位并且宽高已知，设置left，top，margin-left，margin-top属性

```cs
    .one{
        position:absolute;
        width:200px;
        height:200px;
        top:50%;
        left:50%;
        margin-top:-100px;
        margin-left:-100px;
        background:red;
    }
```

>>这种方法基本浏览器都能够兼容，不足之处就是需要固定宽高。

+ 使用固定定位

```cs
    .two{
        position:fixed;
        width:180px;
        height:180px;
        top:50%;
        left:50%;
        margin-top:-90px;
        margin-left:-90px;
        background:orange;
    }
```

>>大家都知道的position:fixed,IE是不支持这个属性的，且需要固定宽高，并且元素的位置相对于浏览器窗口是固定位置，即使窗口是滚动的它也不会移动

+ 利用position:fixed属性，margin:auto这个必须不要忘记了

```cs
    .three{
        position:fixed;
        width:160px;
        height:160px;
        top:0;
        right:0;
        bottom:0;
        left:0;
        margin:auto;
        background:pink;
    }
```

+ 利用position:absolute属性，设置top/bottom/right/left，设置的是全屏效果

```cs
    .four{
        position:absolute;
        width:140px;
        height:140px;
        top:0;
        right:0;
        bottom:0;
        left:0;
        margin:auto;
        background:black;
    }
```

+ 利用display:table-cell属性使内容垂直居

```cs
    .five{
        display:table-cell;
        vertical-align:middle;
        text-align:center;
        width:120px;
        height:120px;
        background:purple;
    }
```

+ 使用css3的display:-webkit-box属性，再设置-webkit-box-pack:center/-webkit-box-align:center，高度未知时垂直居中

```cs
    .seven{
        width:90px;
        height:90px;
        display:-webkit-box;
        -webkit-box-pack:center;
        -webkit-box-align:center;
        background:yellow;
        color:black;
    }
```

+ 使用css3的新属性transform:translate(x,y)属性

```cs
    .eight{
        position:absolute;
        width:80px;
        height:80px;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);
        -webkit-transform:translate(-50%,-50%);
        -moz-transform:translate(-50%,-50%);
        -ms-transform:translate(-50%,-50%);
        background:green;
    }
```

>>这个方法可以不需要设定固定的宽高，在移动端用的会比较多，在移动端css3兼容的比较好

####7.4、无样式闪烁（FOUC）

>FOUS(无样式内容闪烁)（Flash Of Unstyled Content）-文档样式闪烁， 而引用css文件的@import就是造成这个问题的罪魁祸首。IE会先加载整个HTML文档的DOM，然后再去导入外部CSS文件，因此，在页面DOM加载完成到css导入完成中间会有一段时间，页面上的内容是没有样式的，这段时间的长短跟网速，电脑速度都有关系，解决办法出奇的简单，只要在之间加一个script元素就可以了。

原因大致为：
:   1，使用import方法导入样式表。
2，将样式表放在页面底部
3，有几个样式表，放在html结构的不同位置。

其实原理很清楚：当样式表晚于结构性html加载，当加载到此样式表时，页面将停止之前的渲染。此样式表被下载和解析后，将重新渲染页面，也就出现了短暂的花屏现象。

### 8、html相关问题

####8.1、兼容性相关问题

####8.2、前端性能优化

+ 减少dom操作
+ 部署前，图片压缩，代码压缩
+ 优化js代码结构，减少冗余代码
+ 减少http请求，合理的设置http缓存，（合并js代码， css样式）
+ 使用内容分发系统cdn加速
+ 静态资源缓存
+ 图片延迟加载

####8.3、框架相关的问题

**angular**

1）ng-show/ng-hide 与 ng-if区别？

>ng-show和ng-hide是通过display来进行显示和隐藏元素的。但是ng-if是通过控制dom元素的增删除来实现元素的显示和隐藏。如果我们是根据不同的条件来进行dom节点的加载的话，那么ng-if的性能好过ng-show。

2）解释什么是rootScope以及和scope的区别？

>rootScope是所有scope的父亲，angular解析ng-app指令然后在内存中创建$rootScope对象。angular会继续解析，找到{{}}插值运算符表达式，解析成变量，接着解析ng-controller指令，ng-controller指向的函数变成一个$scope对象的实例。

3）表达式{{yourModel}}是如何工作的？

4）Angular中的digest周期是什么？

>每个digest周期中， angular总会对比scope上model的值，一般digest周期是自动触发的，我们也可以使用$apply进行手动触发。

5）如何取消timeout，以及停止一个watch()?

>停止$timeout可以使用cancel：

```eg.
    var customTimout = $timeout(function(){}, 1000);
    $timeout.cancel(customTimout);
```

停掉一个$watch:

```
    eg.
        //$watch() 会返回一个停止注册的函数
        var deregisterWatchFn = $rootScope.$watch('someGloballyAvailableProperty', function(newVal){
            if(newVal){
                //停止watch注册的函数
                deregisterWatchFn();
            }
        })
```

6）Angular Directive中restrict中分别可以怎样设置？scope中@，=，&有什么区别？

>restrict中分别可以设置：

+ A 匹配属性
+ E 匹配标签
+ C 匹配class
+ M 匹配注释

你可以设置多个值进行多个匹配在scope中， @，=， &进行值绑定时分别表示@ 获取一个设置的字符串，它可以自己设置也可是以使用{{yourModel}}进行绑定的
= 双向绑定，绑定scope上的一些属性& 用于执行父级scope上的一些表达式，常见我们设置一些需要执行的函数< 进行单向绑定

7）至少列出三种实现不同模块之间的通信方法

1. Service
2. events，指定绑定的事件
3. 使用$rootScope
4. controller之间直接使用parent， $childHead等
5. directive指定属性进行数据绑定

8）有哪些措施可以改善Angular性能

####8.4、cookie和storage

+ cookie限制因素
:   跨域问题
    设置HttpOnly
    存储容量小
+ session
:   session数据放在服务器上,cookie不是很安全，别人可以分析存放在本地的COOKIE并进行COOKIE欺骗,如果主要考虑到安全应当使用session,session会在一定时间内保存在服务器上。当访问增多，会比较占用你服务器的性能，如果主要考虑到减轻服务器性能方面，应当使用COOKIE单个cookie在客户端的限制是3K，就是说一个站点在客户端存放的COOKIE不能3K将登陆信息等重要信息存放为SESSION;其他信息如果需要保留，可以放在COOKIE中

####8.5、url请求到页面加载完成时经历的过程

1. 输入地址
2. 浏览器查找url域名的IP地址
3. 域名解析：首先检查浏览器缓存， 如果没有查找系统缓存（host配置文件）， 然后路由器缓存， 然后最近的域名解析服务器
4. 浏览器向web服务器发送一个http请求
5. 服务器的永久重定向响应
6. 浏览器跟踪重定向响应
7. 服务器处理请求
8. 服务器返回一个HTTP响应
9. 浏览器显示HTML
10. 浏览器发送请求获取嵌入在HTML中的资源（图片， 音频， 视频、 CSS、js等）
11. 浏览器发送异步请求

####8.6、优雅降级和渐进增强

优雅降级：

:   web站点的某些功能和样式，在所有新式的浏览器中都能正常工作，并且用户使用老式浏览器，则代码会检查它们是否正常工作。由于IE独特的盒模型布局问题，针对不同的版本的IE的hack实践过优雅降级了，为那些无法支持功能的浏览器增加候选方案，使之在旧式浏览器上以某种形式降级体验却不至于完全失效

渐进增强：

:   从被所有浏览器支持的基本功能开始， 逐步的添加那些只有新式浏览器才支持的功能，向页面增加无害于浏览器的额外样式和功能。当浏览器支持时，他们会自动的呈现出来并发挥作用

####8.7、浏览器标准模式和怪异模式之间的区别

W3C标准推出以后，浏览器都开始采纳标准，但存在一个问题就是如何 保证旧的网页还能继续浏览，在标准出来以前，很多页面都是根据旧的渲染方法来编写的，如果用的标准来渲染，将导致页面显示异常。为了保持浏览器渲染的兼容性，是以前的页面能够正常浏览，浏览器都保留了旧的渲染方法（如IE）。这样浏览器就产生了Quircks mode和Standars mode,两种渲染方法共存在一个浏览器上。IE盒子模型和标准的W3C盒子模型：ie的width包括：padding/border。标准的width不包括：padding/border

在js中如何判断当前浏览器正在以何中方式解析？

>document对象有个属性compatMode,它有两个值：BackCompat对应quirks mode，CSS1Compat对应strict mode


