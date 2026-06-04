/**
 * Branded HTML email templates for Zyvora.
 * Tyrian Purple (#4F0341) on white, kept inline-styled for email-client safety.
 */

const BRAND = '#4F0341';
const ACCENT = '#A53F8C';

const shell = (title, bodyHtml) => `
  <div style="margin:0;padding:0;background:#f5f0f3;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0f3;padding:32px 0;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(79,3,65,0.08);">
          <tr>
            <td style="background:${BRAND};padding:28px 32px;text-align:center;">
              <span style="color:#fff;font-size:26px;font-weight:700;letter-spacing:4px;">ZYVORA</span>
              <div style="color:#e7c9df;font-size:11px;letter-spacing:3px;margin-top:4px;text-transform:uppercase;">Luxury • Elegance • Premium</div>
            </td>
          </tr>
          <tr><td style="padding:36px 40px;color:#2b2b2b;font-size:15px;line-height:1.6;">
            <h1 style="margin:0 0 18px;color:${BRAND};font-size:22px;">${title}</h1>
            ${bodyHtml}
          </td></tr>
          <tr>
            <td style="background:#faf6f9;padding:22px 32px;text-align:center;color:#8a8a8a;font-size:12px;border-top:1px solid #efe6ed;">
              © ${new Date().getFullYear()} Zyvora. All rights reserved.<br/>
              This is an automated message — please do not reply.
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </div>
`;

const button = (label, url) => `
  <a href="${url}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;padding:13px 30px;border-radius:8px;font-weight:600;letter-spacing:.5px;">${label}</a>
`;

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export const welcomeEmail = (name) =>
  shell(
    `Welcome to Zyvora, ${name} ✨`,
    `<p>Thank you for joining <strong>Zyvora</strong> — where luxury meets elegance.</p>
     <p>Your account has been created successfully. Explore our curated collection of premium products crafted for those with refined taste.</p>
     <p style="margin-top:26px;">${button('Start Shopping', process.env.CLIENT_URL || '#')}</p>`
  );

export const resetPasswordEmail = (name, resetUrl) =>
  shell(
    'Reset Your Password',
    `<p>Hi ${name},</p>
     <p>We received a request to reset your Zyvora password. Click the button below to choose a new one. This link expires in <strong>30 minutes</strong>.</p>
     <p style="margin:26px 0;">${button('Reset Password', resetUrl)}</p>
     <p style="color:#8a8a8a;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>`
  );

const itemsTable = (items) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;border-collapse:collapse;">
    ${items
      .map(
        (it) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #efe6ed;">
          ${
            it.image
              ? `<img src="${it.image}" width="48" height="48" style="border-radius:8px;vertical-align:middle;object-fit:cover;margin-right:12px;"/>`
              : ''
          }
          <span style="vertical-align:middle;color:#2b2b2b;">${it.name} × ${it.quantity}</span>
        </td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid #efe6ed;color:#2b2b2b;">${money(
          it.price * it.quantity
        )}</td>
      </tr>`
      )
      .join('')}
  </table>
`;

export const orderConfirmationEmail = (order, customerName) =>
  shell(
    'Order Confirmed 🎉',
    `<p>Hi ${customerName},</p>
     <p>Thank you for your order! We're preparing it with care. Here are the details:</p>
     <p><strong>Order ID:</strong> ${order.orderId}</p>
     ${itemsTable(order.items)}
     <table role="presentation" width="100%" style="margin-top:8px;">
       <tr><td style="color:#8a8a8a;">Subtotal</td><td align="right">${money(order.itemsPrice)}</td></tr>
       <tr><td style="color:#8a8a8a;">Tax</td><td align="right">${money(order.taxPrice)}</td></tr>
       <tr><td style="color:#8a8a8a;">Shipping</td><td align="right">${money(order.shippingPrice)}</td></tr>
       <tr><td style="color:${BRAND};font-weight:700;padding-top:8px;">Total</td><td align="right" style="color:${BRAND};font-weight:700;padding-top:8px;">${money(
      order.totalPrice
    )}</td></tr>
     </table>
     <p style="margin-top:24px;">${button(
       'Track Your Order',
       `${process.env.CLIENT_URL}/orders/${order.orderId}`
     )}</p>`
  );

export const adminNewOrderEmail = (order, customerName) =>
  shell(
    'New Order Received 🛍️',
    `<p>A new order has been placed on Zyvora.</p>
     <p><strong>Order ID:</strong> ${order.orderId}<br/>
        <strong>Customer:</strong> ${customerName}<br/>
        <strong>Total:</strong> ${money(order.totalPrice)} (${order.paymentMethod})</p>
     ${itemsTable(order.items)}
     <p style="margin-top:20px;">${button(
       'View in Admin Panel',
       `${process.env.CLIENT_URL}/admin/orders`
     )}</p>`
  );

const statusCopy = {
  Shipping: {
    title: 'Your Order Is On The Way 🚚',
    body: 'Great news — your order has shipped and is on its way to you.',
  },
  Delivered: {
    title: 'Your Order Has Been Delivered ✅',
    body: 'Your order has been delivered. We hope you love it! Consider leaving a review.',
  },
  Cancelled: {
    title: 'Your Order Was Cancelled',
    body: 'Your order has been cancelled. If this was unexpected, please contact our support team.',
  },
  Confirmed: {
    title: 'Your Order Is Confirmed',
    body: 'We have confirmed your order and will begin processing it shortly.',
  },
  Processing: {
    title: 'Your Order Is Being Processed',
    body: 'We are carefully preparing your order for shipment.',
  },
};

export const orderStatusEmail = (order, customerName, status) => {
  const copy = statusCopy[status] || {
    title: `Order Update: ${status}`,
    body: `Your order status has been updated to ${status}.`,
  };
  return shell(
    copy.title,
    `<p>Hi ${customerName},</p>
     <p>${copy.body}</p>
     <p><strong>Order ID:</strong> ${order.orderId}<br/>
        <strong>Status:</strong> ${status}</p>
     <p style="margin-top:24px;">${button(
       'Track Your Order',
       `${process.env.CLIENT_URL}/orders/${order.orderId}`
     )}</p>`
  );
};
