---
layout: page.11ty.cjs
title: <basketball-boxscore> ⌲ Home
---

# &lt;basketball-boxscore>

`<basketball-boxscore>` is an awesome element. It's a great introduction to building web components with LitElement, with nice documentation site as well.

## As easy as HTML

<section class="columns">
  <div>

`<basketball-boxscore>` is just an HTML element. You can it anywhere you can use HTML!

```html
<basketball-boxscore></basketball-boxscore>
```

  </div>
  <div>

<basketball-boxscore></basketball-boxscore>

  </div>
</section>

## Configure with attributes

<section class="columns">
  <div>

`<basketball-boxscore>` can be configured with attributed in plain HTML.

```html
<basketball-boxscore name="HTML"></basketball-boxscore>
```

  </div>
  <div>

<basketball-boxscore name="HTML"></basketball-boxscore>

  </div>
</section>

## Declarative rendering

<section class="columns">
  <div>

`<basketball-boxscore>` can be used with declarative rendering libraries like Angular, React, Vue, and lit-html

```js
import {html, render} from 'lit-html';

const name = 'lit-html';

render(
  html`
    <h2>This is a &lt;basketball-boxscore&gt;</h2>
    <basketball-boxscore .name=${name}></basketball-boxscore>
  `,
  document.body
);
```

  </div>
  <div>

<h2>This is a &lt;basketball-boxscore&gt;</h2>
<basketball-boxscore name="lit-html"></basketball-boxscore>

  </div>
</section>
