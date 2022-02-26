# @amanda-mitchell/remark-footer

There is a current proposal for a CommonMark extension for a footer element here:
https://talk.commonmark.org/t/syntax-for-footer/2070

This package implements that proposal as a remark-parse plugin.

## Installation

```
yarn add @amanda-mitchell/remark-footer
```

## Use

Construct a unified parser and pass `footers` to it as a plugin:

```js
const vfile = require('to-vfile');
const report = require('vfile-reporter');
const unified = require('unified');
const parse = require('remark-parse');
const { footers } = require('@amanda-mitchell/remark-footer');
const remark2rehype = require('remark-rehype');
const stringify = require('rehype-stringify');

const document = `^^ a footer`;

unified()
  .use(parse)
  .use(footers)
  .use(remark2rehype)
  .use(stringify)
  .process(vfile.readSync('example.md'), function (err, file) {
    console.error(report(err || file));
    console.log(String(file));
  });
```

When run, this script will print

```html
<footer><p>A footer</p></footer>
```

## Implementation notes

Many `remark-parse` plugins also provide behavior to serialize an mdast syntax tree back to markdown.
This plugin does not support this, but again, I'd be happy to accept a PR that adds the feature!
