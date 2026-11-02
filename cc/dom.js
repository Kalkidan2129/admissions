// Tiny element builder. Text always goes in as text nodes, never as HTML,
// so story text from the plan can never inject markup.
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs ?? {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key.startsWith('on')) el.addEventListener(key.slice(2), value);
    else el.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : String(child));
  }
  return el;
}

// A status dot. Grey ("unknown") unless something has actually been checked.
export function dot(status, label) {
  return h('span', { class: `dot dot-${status}`, role: 'img', 'aria-label': label, title: label });
}

// A table from a header list and rows of cells; an empty state when there are no rows.
export function table(headers, rows, emptyText) {
  if (rows.length === 0) return h('p', { class: 'empty' }, emptyText);
  return h('div', { class: 'table-wrap' },
    h('table', {},
      h('thead', {}, h('tr', {}, headers.map((t) => h('th', { scope: 'col' }, t)))),
      h('tbody', {}, rows.map((cells) => h('tr', {}, cells.map((c) => h('td', {}, c)))))));
}
