lazy asset manager
===

proof of concept using `assets` tag as a layer on top of `bower` and asset
precompilation.

```bash
php -S localhost:8000 -t app router/router.php
```

How to use
---

Currently there is just a 'development' mode, where `asset` definitions are
evaluated and dynamically converted to a valid HTML tag, with on-demand
compilation.

**Source**

    <assets>
      <asset href="bootstrap" source="bower" />
      <asset href="jquery" source="bower" />
    </assets>

**Result**

    <link href="dependencies/bootstrap/dist/css/bootstrap.css" rel="stylesheet" media="all" type="text/css" />
    <script type="text/javascript" src="dependencies/bootstrap/dist/js/bootstrap.js"></script>
    <script type="text/javascript" src="dependencies/jquery/dist/jquery.js"></script>

On 'production' mode (not implemented yet) each asset category shall be
pre-compiled and compressed into a single file:

    <link href="dist/app.min.css" rel="stylesheet" media="all" type="text/css" />
    <script type="text/javascript" src="dist/app.min.js"></script>

Dependencies
---

- PHP 5.4

```bash
npm install -g bower less coffee-script browserify brfs
```

License
---

MIT
