lazy-assets
===

An opinionated and simple build-system approach.

Features:
---

- JavaScript minification and optimization
- CSS minification and optimization
- Bower integration
- **Zero configuration**

Requirements
---

```bash
npm install -g lazy-assets
```

Development server
---

On development mode, `asset` definitions are evaluated and dynamically
converted to a valid HTML tag. They are compiled on-demand. No "watch"
required.

```bash
lazy-assets examples/simple
```

Production
---

When compiling for production, all your javascripts and stylesheets are
compressed into a single file.

```bash
lazy-assets {input_dir} {output_dir}
```

How to use
---

Wrap all your assets with `<assets>` tag, and define each dependency with
`<asset>` tag.

To start the development server, run the following: (by default it binds on
[localhost:3000](http://localhost:3000).)

```bash
lazy-assets examples/simple
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
lazy-assets examples/simple examples/simple-output
```

Result:

```html
<script type="text/javascript" src="javascripts-533afd8c542fd.js"></script>
<link href="stylesheets-533afd8c.css" rel="stylesheet" media="all" type="text/css" />
```


License
---

MIT
