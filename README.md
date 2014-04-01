lazy-assets
===

An opinionated and simple build-system approach.

Requirements
---

- PHP 5.4
- Node

You need to install the following npm modules globally:

```bash
npm install -g bower less stylus coffee-script browserify brfs minify uglify-js
```

Development server
---

On "development" mode, `asset` definitions are evaluated and dynamically
converted to a valid HTML tag. They are compiled on-demand. No "watch"
required.

```bash
php -S localhost:8000 -t {input_dir} router/index.php
```

Production
---

Provide `input_dir` which your application's code and optionally `output_dir`
(default is `'public'`). It will take a little time to compile every asset
you defined.

On "production" mode each asset category is compiled and compressed into a
single file.

```bash
php router/index.php {input_dir} [{output_dir}]
```

How to use
---

Wrap all your assets with `<assets>` tag, and define each dependency with
`<asset>` tag.

First you need to start the development server:

```bash
php -S localhost:8000 -t app router/index.php
```

Then define your dependencies:

```html
<assets>
  <asset href="jquery" source="bower" />
  <asset href="bootstrap" source="bower" />
  <asset href="ractive" source="bower" />
  <asset href="parsleyjs" source="bower" main="dist/parsley.min.js" />
  <asset href="datejs" source="bower" main="build/date.js,build/date-pt-BR.js" />
  <asset href="app.js" compile="browserify" />
  <asset href="test.less" />
  <asset href="test.coffee" />
  <asset href="js/*.js" />
</assets>
```

When `http://localhost:8000` is requested, the output of the HTML file will be
the following:

```html
<link href="dependencies/bootstrap/dist/css/bootstrap.css?533a476e18588" rel="stylesheet" media="all" type="text/css" />
<link href="test.less?533a476e18810" rel="stylesheet" media="all" type="text/css" />
<script type="text/javascript" src="dependencies/jquery/dist/jquery.js?533a476e184a3"></script>
<script type="text/javascript" src="dependencies/bootstrap/dist/js/bootstrap.js?533a476e1859a"></script>
<script type="text/javascript" src="dependencies/ractive/build/Ractive.js?533a476e186be"></script>
<script type="text/javascript" src="dependencies/parsleyjs/dist/parsley.min.js?533a476e18748"></script>
<script type="text/javascript" src="dependencies/datejs/build/date.js?533a476e187ba"></script>
<script type="text/javascript" src="dependencies/datejs/build/date-pt-BR.js?533a476e187d6"></script>
<script type="text/javascript" src="app.js?compile=browserify&533a476e187fa"></script>
<script type="text/javascript" src="test.coffee?533a476e18822"></script>
<script type="text/javascript" src="js/*.js?533a476e1883e"></script>
```

Now let's compile it for production:

```bash
php router/index.php app
```

Result:

```html
<link href="index.css" rel="stylesheet" media="all" type="text/css" />
<script type="text/javascript" src="index.js"></script>
```

License
---

MIT
