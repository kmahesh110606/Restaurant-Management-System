import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import StatusBadge from '../../client/src/components/StatusBadge';

describe('StatusBadge production component', () => {
  it.each(['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled', 'paid', 'unpaid', 'partial'])('renders %s', (status) => {
    const html = renderToStaticMarkup(createElement(StatusBadge, { status }));
    expect(html).toContain(`badge-${status}`);
    expect(html).toContain(status[0].toUpperCase() + status.slice(1));
    expect(html).toContain('<svg');
  });
  it('supports hiding the icon', () => {
    expect(renderToStaticMarkup(createElement(StatusBadge, { status: 'ready', showIcon: false }))).not.toContain('<svg');
  });
  it('escapes unknown statuses and uses a safe fallback', () => {
    const html = renderToStaticMarkup(createElement(StatusBadge, { status: '<script>oops</script>' }));
    expect(html).toContain('badge-pending');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });
});
