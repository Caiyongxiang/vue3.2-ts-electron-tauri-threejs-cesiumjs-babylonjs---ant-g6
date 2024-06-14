"use strict";
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-essential",
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
    parser: "@typescript-eslint/parser",
    sourceType: "module",
    ecmaFeatures: {
      legacyDecorators: true, // 去掉装饰器报错的配置
    },
  },
  plugins: ["@typescript-eslint", "vue"],
  rules: {
    "vue/multi-word-component-names": "off",
    // "prettier/prettier": "error",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-catch-shadow": 2, //禁止catch子句参数与外部作用域变量同名
    "no-class-assign": 2, //禁止给类赋值
    "no-cond-assign": 2, //禁止在条件表达式中使用赋值语句
    "no-const-assign": 2, //禁止修改const声明的变量
    "no-dupe-keys": 2, //在创建对象字面量时不允许键重复 {a:1,a:1}
    "no-dupe-args": 2, //函数参数不能重复
    "no-duplicate-case": 2, //switch中的case标签不能重复
    "no-else-return": 2, //如果if语句里面有return,后面不能跟else语句
    "no-empty": 2, //块语句中的内容不能为空
    "no-empty-character-class": 2, //正则表达式中的[]内容不能为空
    "no-empty-label": 0, //禁止使用空label
    "no-fallthrough": 1, //禁止switch穿透
    "no-floating-decimal": 2, //禁止省略浮点数中的0 .5 3.
    "no-func-assign": 2, //禁止重复的函数声明
    "no-inner-declarations": [2, "functions"], //禁止在块语句中使用声明（变量或函数）
    "no-invalid-regexp": 2, //禁止无效的正则表达式
    "no-invalid-this": 2, //禁止无效的this，只能用在构造器，类，对象字面量
    "no-lone-blocks": 2, //禁止不必要的嵌套块
    "no-lonely-if": 2, //禁止else语句内只有if语句
    "no-loop-func": 1, //禁止在循环中使用函数（如果没有引用外部变量不形成闭包就可以）
    "no-mixed-requires": [0, false], //声明时不能混用声明类型
    "no-negated-in-lhs": 2, //in 操作符的左边不能有!
    "no-nested-ternary": 0, //禁止使用嵌套的三目运算
    "no-new": 1, //禁止在使用new构造一个实例后不赋值
    "no-new-func": 1, //禁止使用new Function
    "no-new-object": 2, //禁止使用new Object()
    "no-new-require": 2, //禁止使用new require
    "no-new-wrappers": 2, //禁止使用new创建包装实例，new String new Boolean new Number
    "no-redeclare": 2, //禁止重复声明变量
    "no-restricted-modules": 0, //如果禁用了指定模块，使用就会报错
    "no-return-assign": 1, //return 语句中不能有赋值表达式
    "no-self-compare": 2, //不能比较自身
    "no-shadow": 2, //外部作用域中的变量不能与它所包含的作用域中的变量或参数同名
    "no-shadow-restricted-names": 2, //严格模式中规定的限制标识符不能作为声明时的变量名使用
    "no-undef": 1, //不能有未定义的变量
    "no-undef-init": 2, //变量初始化时不能直接给它赋值为undefined
    "no-unexpected-multiline": 2, //避免多行表达式
    "no-underscore-dangle": 1, //标识符不能以_开头或结尾
    "no-unneeded-ternary": 2, //禁止不必要的嵌套 var isYes = answer === 1 ? true : false;
    "no-unreachable": 2, //不能有无法执行的代码
    "no-unused-expressions": 2, //禁止无用的表达式
    "no-unused-vars": [2, { vars: "all", args: "after-used" }], //不能有声明后未被使用的变量或参数
    "no-use-before-define": 2, //未定义前不能使用
    "no-useless-call": 2, //禁止不必要的call和apply
    "no-void": 2, //禁用void操作符
    "no-var": 2, //禁用var，用let和const代替
    "no-warning-comments": [
      1,
      { terms: ["todo", "fixme", "xxx"], location: "start" },
    ], //不能有警告备注
    "no-with": 2, //禁用with
    "callback-return": 1, //避免多次调用回调什么的
    complexity: [0, 11], //循环复杂度
    "consistent-return": 0, //return 后面是否允许省略
    "constructor-super": 0, //非派生类不能调用super，派生类必须调用super
    "default-case": 2, //switch语句最后必须有default
    "func-names": 0, //函数表达式必须有名字
    "func-style": [0, "declaration"], //函数风格，规定只能使用函数声明/函数表达式
    "guard-for-in": 0, //for in循环要用if语句过滤
    "handle-callback-err": 0, //nodejs 处理错误
    "init-declarations": 0, //声明时必须赋初值
    "lines-around-comment": 0, //行前/行后备注
    "max-depth": [0, 4], //嵌套块深度
    "max-nested-callbacks": [0, 2], //回调嵌套深度
    "max-statements": [0, 10], //函数内最多有几个声明
    "object-shorthand": 0, //强制对象字面量缩写语法
    "one-var": 1, //连续声明
    "prefer-const": 0, //首选const
    "prefer-spread": 0, //首选展开运算
    "prefer-reflect": 0, //首选Reflect的方法
    "id-match": 0, //命名检测
    "require-yield": 0, //生成器函数必须有yield
    strict: 2, //使用严格模式
    "use-isnan": 2, //禁止比较时使用NaN，只能用isNaN()
    "valid-typeof": 2, //必须使用合法的typeof的值
    yoda: [2, "never"], //禁止尤达条件
  },
};
