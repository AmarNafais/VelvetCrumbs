import nodemailer from 'nodemailer';
import { Order, OrderItem, Product } from '@shared/schema';

interface OrderWithItems extends Order {
  items: (OrderItem & { product: Product })[];
}

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Generate HTML email template
const generateOrderEmailHTML = (order: OrderWithItems): string => {
  const formatPrice = (price: string | number) => {
    return `LKR ${parseFloat(price.toString()).toLocaleString()}`;
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const itemsHTML = order.items.map(item => `
    <tr style="border-bottom: 1px solid hsl(45, 15%, 88%);">
      <td style="padding: 15px; vertical-align: top;">
        <img src="${item.product.image}" alt="${item.product.name}" 
             style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
      </td>
      <td style="padding: 15px; vertical-align: top;">
        <div style="font-weight: 600; margin-bottom: 4px;">${item.product.name}</div>
        <div style="color: hsl(15, 10%, 45%); font-size: 14px;">Quantity: ${item.quantity}</div>
      </td>
      <td style="padding: 15px; text-align: right; vertical-align: top; font-weight: 600;">
        ${formatPrice(item.lineTotal)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order - Velvet Crumbs</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: hsl(44, 40%, 98%);">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, hsl(33, 85%, 55%) 0%, hsl(25, 75%, 45%) 100%); color: white; padding: 30px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; margin-bottom: 10px;">Velvet Crumbs</div>
                <div style="font-size: 18px; opacity: 0.9;">New Order Received</div>
                <div style="margin-top: 20px; background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; display: inline-block;">
                    <div style="font-size: 24px; font-weight: bold;">✓</div>
                    <div style="font-size: 14px; margin-top: 5px;">Order Successfully Placed</div>
                </div>
            </div>

            <!-- Order Details -->
            <div style="padding: 30px;">
                <div style="background-color: hsl(45, 20%, 92%); padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 1px solid hsl(45, 15%, 88%);">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 50%; padding: 10px 15px; vertical-align: top;">
                                <div style="font-weight: 600; color: hsl(15, 15%, 15%); margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Order ID</div>
                                <div style="font-family: 'Courier New', monospace; color: hsl(15, 10%, 45%); font-size: 16px; font-weight: 500;">#${order.id.substring(0, 8).toUpperCase()}</div>
                            </td>
                            <td style="width: 50%; padding: 10px 15px; vertical-align: top; text-align: right;">
                                <div style="font-weight: 600; color: hsl(15, 15%, 15%); margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Order Date</div>
                                <div style="color: hsl(15, 10%, 45%); font-size: 16px; font-weight: 500;">${formatDate(order.createdAt)}</div>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Customer Information -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: hsl(15, 15%, 15%); border-bottom: 2px solid hsl(33, 85%, 55%); padding-bottom: 10px; margin-bottom: 20px; font-size: 18px; font-weight: 600;">Customer Information</h3>
                    <div style="background-color: hsl(45, 20%, 92%); padding: 25px; border-radius: 12px; border: 1px solid hsl(45, 15%, 88%);">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 50%; padding: 12px 15px; vertical-align: top;">
                                    <div style="font-weight: 600; color: hsl(15, 15%, 15%); margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Name</div>
                                    <div style="color: hsl(15, 10%, 45%); font-size: 16px; font-weight: 500;">${order.customerName}</div>
                                </td>
                                <td style="width: 50%; padding: 12px 15px; vertical-align: top;">
                                    <div style="font-weight: 600; color: hsl(15, 15%, 15%); margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Email</div>
                                    <div style="color: hsl(15, 10%, 45%); font-size: 16px; font-weight: 500;">${order.customerEmail}</div>
                                </td>
                            </tr>
                            <tr>
                                <td style="width: 50%; padding: 12px 15px; vertical-align: top;">
                                    <div style="font-weight: 600; color: hsl(15, 15%, 15%); margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Phone</div>
                                    <div style="color: hsl(15, 10%, 45%); font-size: 16px; font-weight: 500;">${order.customerPhone}</div>
                                </td>
                                <td style="width: 50%; padding: 12px 15px; vertical-align: top;">
                                    <div style="font-weight: 600; color: hsl(15, 15%, 15%); margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Address</div>
                                    <div style="color: hsl(15, 10%, 45%); font-size: 16px; font-weight: 500;">${order.customerAddress}</div>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>

                <!-- Order Items -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: hsl(15, 15%, 15%); border-bottom: 2px solid hsl(33, 85%, 55%); padding-bottom: 10px;">Order Items</h3>
                    <table style="width: 100%; border-collapse: collapse; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        ${itemsHTML}
                        <tr style="background-color: hsl(45, 20%, 92%);">
                            <td colspan="2" style="padding: 20px; font-weight: 600; font-size: 16px;">Total:</td>
                            <td style="padding: 20px; text-align: right; font-weight: bold; font-size: 18px; color: hsl(33, 85%, 55%);">
                                ${formatPrice(order.total)}
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Action Button -->
                <div style="text-align: center; margin: 30px 0;">
                    <div style="background: linear-gradient(135deg, hsl(33, 85%, 55%) 0%, hsl(25, 75%, 45%) 100%); color: white; padding: 15px 30px; border-radius: 8px; display: inline-block; font-weight: 600; text-decoration: none;">
                        View Order in Admin Panel
                    </div>
                </div>

                <!-- Footer Note -->
                <div style="background-color: hsl(45, 20%, 92%); padding: 20px; border-radius: 10px; text-align: center; color: hsl(15, 10%, 45%); font-size: 14px;">
                    <p style="margin: 0;">Please contact the customer within 24 hours to confirm order details and delivery arrangements.</p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: hsl(15, 15%, 15%); color: white; padding: 20px; text-align: center;">
                <div style="font-size: 14px; opacity: 0.8;">
                    Velvet Crumbs - Premium Sri Lankan Bakery
                </div>
                <div style="font-size: 12px; opacity: 0.6; margin-top: 5px;">
                    This email was automatically generated from your bakery order system.
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Generate customer order confirmation email HTML
const generateCustomerOrderConfirmationHTML = (order: OrderWithItems): string => {
  const formatPrice = (price: string | number) => {
    return `LKR ${parseFloat(price.toString()).toLocaleString()}`;
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const itemsHTML = order.items.map(item => `
    <tr style="border-bottom: 1px solid hsl(45, 15%, 88%);">
      <td style="padding: 15px; vertical-align: top;">
        <img src="${item.product.image}" alt="${item.product.name}" 
             style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
      </td>
      <td style="padding: 15px; vertical-align: top;">
        <div style="font-weight: 600; margin-bottom: 4px;">${item.product.name}</div>
        <div style="color: hsl(15, 10%, 45%); font-size: 14px;">Quantity: ${item.quantity}</div>
      </td>
      <td style="padding: 15px; text-align: right; vertical-align: top; font-weight: 600;">
        ${formatPrice(item.lineTotal)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Velvet Crumbs</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: hsl(44, 40%, 98%);">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, hsl(33, 85%, 55%) 0%, hsl(25, 75%, 45%) 100%); color: white; padding: 30px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; margin-bottom: 10px;">Velvet Crumbs</div>
                <div style="font-size: 18px; opacity: 0.9;">Order Confirmation</div>
                <div style="margin-top: 20px; background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; display: inline-block;">
                    <div style="font-size: 24px; font-weight: bold;">✓</div>
                    <div style="font-size: 14px; margin-top: 5px;">Thank you for your order!</div>
                </div>
            </div>

            <!-- Order Details -->
            <div style="padding: 30px;">
                <div style="background-color: hsl(45, 20%, 92%); padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 1px solid hsl(45, 15%, 88%);">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 50%; padding: 10px 15px; vertical-align: top;">
                                <div style="font-weight: 600; color: hsl(15, 15%, 15%); margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Order ID</div>
                                <div style="font-family: 'Courier New', monospace; color: hsl(15, 10%, 45%); font-size: 16px; font-weight: 500;">#${order.id.substring(0, 8).toUpperCase()}</div>
                            </td>
                            <td style="width: 50%; padding: 10px 15px; vertical-align: top; text-align: right;">
                                <div style="font-weight: 600; color: hsl(15, 15%, 15%); margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Order Date</div>
                                <div style="color: hsl(15, 10%, 45%); font-size: 16px; font-weight: 500;">${formatDate(order.createdAt)}</div>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Order Items -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: hsl(15, 15%, 15%); border-bottom: 2px solid hsl(33, 85%, 55%); padding-bottom: 10px;">Your Order</h3>
                    <table style="width: 100%; border-collapse: collapse; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        ${itemsHTML}
                        <tr style="background-color: hsl(45, 20%, 92%);">
                            <td colspan="2" style="padding: 20px; font-weight: 600; font-size: 16px;">Total:</td>
                            <td style="padding: 20px; text-align: right; font-weight: bold; font-size: 18px; color: hsl(33, 85%, 55%);">
                                ${formatPrice(order.total)}
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Delivery Information -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: hsl(15, 15%, 15%); border-bottom: 2px solid hsl(33, 85%, 55%); padding-bottom: 10px; margin-bottom: 20px; font-size: 18px; font-weight: 600;">Delivery Information</h3>
                    <div style="background-color: hsl(45, 20%, 92%); padding: 25px; border-radius: 12px; border: 1px solid hsl(45, 15%, 88%);">
                        <div style="margin-bottom: 15px;">
                            <div style="font-weight: 600; color: hsl(15, 15%, 15%); margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Delivery Address</div>
                            <div style="color: hsl(15, 10%, 45%); font-size: 16px; font-weight: 500;">${order.customerAddress}</div>
                        </div>
                        <div>
                            <div style="font-weight: 600; color: hsl(15, 15%, 15%); margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Contact Phone</div>
                            <div style="color: hsl(15, 10%, 45%); font-size: 16px; font-weight: 500;">${order.customerPhone}</div>
                        </div>
                    </div>
                </div>

                <!-- Next Steps -->
                <div style="background-color: hsl(45, 20%, 92%); padding: 20px; border-radius: 10px; text-align: center; color: hsl(15, 10%, 45%); font-size: 14px; margin-bottom: 20px;">
                    <p style="margin: 0 0 10px 0; font-weight: 600; color: hsl(15, 15%, 15%); font-size: 16px;">What happens next?</p>
                    <p style="margin: 0;">We'll contact you within 24 hours to confirm your order details and arrange delivery. You'll receive email updates as your order progresses!</p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: hsl(15, 15%, 15%); color: white; padding: 20px; text-align: center;">
                <div style="font-size: 14px; opacity: 0.8;">
                    Velvet Crumbs - Premium Sri Lankan Bakery
                </div>
                <div style="font-size: 12px; opacity: 0.6; margin-top: 5px;">
                    Thank you for choosing Velvet Crumbs!
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Generate order status update email HTML
const generateStatusUpdateEmailHTML = (order: OrderWithItems, newStatus: string): string => {
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'placed': return { title: 'Order Placed', message: 'Your order has been successfully placed and is being reviewed.', icon: '📝' };
      case 'in_progress': return { title: 'In Progress', message: 'Great news! Your order is now being prepared in our kitchen.', icon: '👨‍🍳' };
      case 'delivered': return { title: 'Out for Delivery', message: 'Your delicious treats are on their way to you!', icon: '🚚' };
      case 'completed': return { title: 'Order Completed', message: 'Your order has been successfully delivered. Enjoy your treats!', icon: '✅' };
      case 'canceled': return { title: 'Order Canceled', message: 'Your order has been canceled. If you have any questions, please contact us.', icon: '❌' };
      default: return { title: 'Order Updated', message: 'Your order status has been updated.', icon: '📋' };
    }
  };

  const statusInfo = getStatusMessage(newStatus);

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Update - Velvet Crumbs</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: hsl(44, 40%, 98%);">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, hsl(33, 85%, 55%) 0%, hsl(25, 75%, 45%) 100%); color: white; padding: 30px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; margin-bottom: 10px;">Velvet Crumbs</div>
                <div style="font-size: 18px; opacity: 0.9;">Order Update</div>
                <div style="margin-top: 20px; background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; display: inline-block;">
                    <div style="font-size: 24px; font-weight: bold;">${statusInfo.icon}</div>
                    <div style="font-size: 14px; margin-top: 5px;">${statusInfo.title}</div>
                </div>
            </div>

            <!-- Status Update -->
            <div style="padding: 30px;">
                <div style="background-color: hsl(45, 20%, 92%); padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 1px solid hsl(45, 15%, 88%); text-align: center;">
                    <div style="font-size: 18px; font-weight: 600; color: hsl(15, 15%, 15%); margin-bottom: 10px;">${statusInfo.title}</div>
                    <div style="color: hsl(15, 10%, 45%); font-size: 16px; line-height: 1.5;">${statusInfo.message}</div>
                </div>

                <!-- Order Information -->
                <div style="background-color: hsl(45, 20%, 92%); padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 1px solid hsl(45, 15%, 88%);">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 50%; padding: 10px 15px; vertical-align: top;">
                                <div style="font-weight: 600; color: hsl(15, 15%, 15%); margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Order ID</div>
                                <div style="font-family: 'Courier New', monospace; color: hsl(15, 10%, 45%); font-size: 16px; font-weight: 500;">#${order.id.substring(0, 8).toUpperCase()}</div>
                            </td>
                            <td style="width: 50%; padding: 10px 15px; vertical-align: top; text-align: right;">
                                <div style="font-weight: 600; color: hsl(15, 15%, 15%); margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Updated</div>
                                <div style="color: hsl(15, 10%, 45%); font-size: 16px; font-weight: 500;">${formatDate(new Date())}</div>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Contact Info -->
                <div style="background-color: hsl(45, 20%, 92%); padding: 20px; border-radius: 10px; text-align: center; color: hsl(15, 10%, 45%); font-size: 14px;">
                    <p style="margin: 0;">If you have any questions about your order, please contact us and we'll be happy to help!</p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: hsl(15, 15%, 15%); color: white; padding: 20px; text-align: center;">
                <div style="font-size: 14px; opacity: 0.8;">
                    Velvet Crumbs - Premium Sri Lankan Bakery
                </div>
                <div style="font-size: 12px; opacity: 0.6; margin-top: 5px;">
                    Thank you for choosing Velvet Crumbs!
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Send order confirmation email to customer
export const sendCustomerOrderConfirmation = async (order: OrderWithItems): Promise<boolean> => {
  console.log('Sending order confirmation to customer:', order.customerEmail);
  
  try {
    const mailOptions = {
      from: {
        name: 'Velvet Crumbs',
        address: process.env.GMAIL_USER!,
      },
      to: order.customerEmail,
      subject: `Order Confirmation - #${order.id.substring(0, 8).toUpperCase()}`,
      html: generateCustomerOrderConfirmationHTML(order),
      text: `
Order Confirmation - Velvet Crumbs

Dear ${order.customerName},

Thank you for your order! Here are your order details:

Order ID: #${order.id.substring(0, 8).toUpperCase()}
Order Date: ${order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}

Items:
${order.items.map(item => `- ${item.quantity}x ${item.product.name} - LKR ${item.lineTotal}`).join('\n')}

Total: LKR ${order.total}
Delivery Address: ${order.customerAddress}

We'll contact you within 24 hours to confirm details and arrange delivery.

Thank you for choosing Velvet Crumbs!
      `.trim()
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Customer order confirmation sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send customer order confirmation:', error);
    return false;
  }
};

// Send order notification email to admin
export const sendAdminOrderNotification = async (order: OrderWithItems): Promise<boolean> => {
  console.log('Starting admin email notification process for order:', order.id);
  console.log('Gmail credentials check - User:', process.env.GMAIL_USER ? 'Set' : 'Not set');
  console.log('Gmail credentials check - Password:', process.env.GMAIL_APP_PASSWORD ? 'Set' : 'Not set');
  
  try {
    const mailOptions = {
      from: {
        name: 'Velvet Crumbs',
        address: process.env.GMAIL_USER!,
      },
      to: process.env.ADMIN_EMAIL || 'admin@velvetcrumbs.lk',
      subject: `New Order Received - #${order.id.substring(0, 8).toUpperCase()}`,
      html: generateOrderEmailHTML(order),
      text: `
New Order Received - Velvet Crumbs

Order ID: #${order.id.substring(0, 8).toUpperCase()}
Customer: ${order.customerName}
Email: ${order.customerEmail}
Phone: ${order.customerPhone}
Address: ${order.customerAddress}

Items:
${order.items.map(item => `- ${item.quantity}x ${item.product.name} - LKR ${item.lineTotal}`).join('\n')}

Total: LKR ${order.total}
Order Date: ${order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
      `.trim()
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Admin order notification email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send admin order notification email:', error);
    return false;
  }
};

// Send order status update email to customer
export const sendOrderStatusUpdate = async (order: OrderWithItems, newStatus: string): Promise<boolean> => {
  console.log('Sending status update email to customer:', order.customerEmail, 'Status:', newStatus);
  
  try {
    const statusTitles: { [key: string]: string } = {
      'placed': 'Order Placed',
      'in_progress': 'Order In Progress',
      'delivered': 'Order Out for Delivery',
      'completed': 'Order Completed',
      'canceled': 'Order Canceled'
    };

    const mailOptions = {
      from: {
        name: 'Velvet Crumbs',
        address: process.env.GMAIL_USER!,
      },
      to: order.customerEmail,
      subject: `Order Update: ${statusTitles[newStatus] || 'Status Updated'} - #${order.id.substring(0, 8).toUpperCase()}`,
      html: generateStatusUpdateEmailHTML(order, newStatus),
      text: `
Order Status Update - Velvet Crumbs

Dear ${order.customerName},

Your order #${order.id.substring(0, 8).toUpperCase()} status has been updated to: ${statusTitles[newStatus] || newStatus}

If you have any questions about your order, please contact us.

Thank you for choosing Velvet Crumbs!
      `.trim()
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Order status update email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send order status update email:', error);
    return false;
  }
};

// Send pre-order inquiry notification to admin
export const sendPreOrderInquiry = async (inquiryData: {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  guestCount: string;
  message: string;
}): Promise<boolean> => {
  console.log('Sending pre-order inquiry notification to admin:', inquiryData.email);
  
  try {
    const formatDate = (dateString: string) => {
      if (!dateString) return 'Not specified';
      try {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch {
        return dateString;
      }
    };

    const inquiryHTML = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Pre-Order Inquiry - Velvet Crumbs</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: hsl(44, 40%, 98%);">
          <div style="max-width: 600px; margin: 0 auto; background-color: white;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, hsl(33, 85%, 55%) 0%, hsl(25, 75%, 45%) 100%); color: white; padding: 30px; text-align: center;">
                  <div style="font-size: 32px; font-weight: bold; margin-bottom: 10px;">Velvet Crumbs</div>
                  <div style="font-size: 18px; opacity: 0.9;">New Pre-Order Inquiry</div>
                  <div style="margin-top: 20px; background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; display: inline-block;">
                      <div style="font-size: 24px; font-weight: bold;">📋</div>
                      <div style="font-size: 14px; margin-top: 5px;">Customer Inquiry Received</div>
                  </div>
              </div>

              <!-- Inquiry Details -->
              <div style="padding: 30px;">
                  <div style="background-color: hsl(45, 20%, 92%); padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 1px solid hsl(45, 15%, 88%);">
                      <h3 style="color: hsl(15, 15%, 15%); margin-top: 0; margin-bottom: 20px; font-size: 18px; font-weight: 600;">Customer Information</h3>
                      <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                              <td style="padding: 10px 15px; vertical-align: top; width: 30%;">
                                  <div style="font-weight: 600; color: hsl(15, 15%, 15%); margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Name</div>
                                  <div style="color: hsl(15, 10%, 45%); font-size: 16px; font-weight: 500;">${inquiryData.name}</div>
                              </td>
                              <td style="padding: 10px 15px; vertical-align: top; width: 35%;">
                                  <div style="font-weight: 600; color: hsl(15, 15%, 15%); margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Email</div>
                                  <div style="color: hsl(15, 10%, 45%); font-size: 16px; font-weight: 500;">${inquiryData.email}</div>
                              </td>
                              <td style="padding: 10px 15px; vertical-align: top; width: 35%;">
                                  <div style="font-weight: 600; color: hsl(15, 15%, 15%); margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Phone</div>
                                  <div style="color: hsl(15, 10%, 45%); font-size: 16px; font-weight: 500;">${inquiryData.phone || 'Not provided'}</div>
                              </td>
                          </tr>
                      </table>
                  </div>

                  <!-- Event Details -->
                  <div style="background-color: hsl(45, 20%, 92%); padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 1px solid hsl(45, 15%, 88%);">
                      <h3 style="color: hsl(15, 15%, 15%); margin-top: 0; margin-bottom: 20px; font-size: 18px; font-weight: 600;">Event Details</h3>
                      <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                              <td style="padding: 10px 15px; vertical-align: top; width: 33%;">
                                  <div style="font-weight: 600; color: hsl(15, 15%, 15%); margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Event Type</div>
                                  <div style="color: hsl(15, 10%, 45%); font-size: 16px; font-weight: 500;">${inquiryData.eventType || 'Not specified'}</div>
                              </td>
                              <td style="padding: 10px 15px; vertical-align: top; width: 33%;">
                                  <div style="font-weight: 600; color: hsl(15, 15%, 15%); margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Event Date</div>
                                  <div style="color: hsl(15, 10%, 45%); font-size: 16px; font-weight: 500;">${formatDate(inquiryData.eventDate)}</div>
                              </td>
                              <td style="padding: 10px 15px; vertical-align: top; width: 33%;">
                                  <div style="font-weight: 600; color: hsl(15, 15%, 15%); margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Guests</div>
                                  <div style="color: hsl(15, 10%, 45%); font-size: 16px; font-weight: 500;">${inquiryData.guestCount || 'Not specified'}</div>
                              </td>
                          </tr>
                      </table>
                  </div>

                  <!-- Message -->
                  ${inquiryData.message ? `
                  <div style="background-color: hsl(45, 20%, 92%); padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 1px solid hsl(45, 15%, 88%);">
                      <h3 style="color: hsl(15, 15%, 15%); margin-top: 0; margin-bottom: 15px; font-size: 18px; font-weight: 600;">Customer Message</h3>
                      <div style="color: hsl(15, 10%, 45%); font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${inquiryData.message}</div>
                  </div>
                  ` : ''}

                  <!-- Next Steps -->
                  <div style="background-color: hsl(45, 20%, 92%); padding: 20px; border-radius: 10px; text-align: center; color: hsl(15, 10%, 45%); font-size: 14px;">
                      <p style="margin: 0 0 10px 0; font-weight: 600; color: hsl(15, 15%, 15%); font-size: 16px;">Action Required</p>
                      <p style="margin: 0;">Please respond to this customer inquiry within 24 hours to discuss their pre-order requirements.</p>
                  </div>
              </div>

              <!-- Footer -->
              <div style="background-color: hsl(15, 15%, 15%); color: white; padding: 20px; text-align: center;">
                  <div style="font-size: 14px; opacity: 0.8;">
                      Velvet Crumbs - Admin Notification System
                  </div>
                  <div style="font-size: 12px; opacity: 0.6; margin-top: 5px;">
                      Received: ${new Date().toLocaleString()}
                  </div>
              </div>
          </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: {
        name: 'Velvet Crumbs - Customer Inquiry',
        address: process.env.GMAIL_USER!,
      },
      to: process.env.ADMIN_EMAIL || 'admin@velvetcrumbs.lk',
      subject: `New Pre-Order Inquiry from ${inquiryData.name}`,
      html: inquiryHTML,
      text: `
New Pre-Order Inquiry - Velvet Crumbs

Customer Information:
Name: ${inquiryData.name}
Email: ${inquiryData.email}
Phone: ${inquiryData.phone || 'Not provided'}

Event Details:
Type: ${inquiryData.eventType || 'Not specified'}
Date: ${formatDate(inquiryData.eventDate)}
Guest Count: ${inquiryData.guestCount || 'Not specified'}

Message:
${inquiryData.message || 'No additional message provided'}

Please respond to this customer inquiry within 24 hours.

Received: ${new Date().toLocaleString()}
      `.trim()
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Pre-order inquiry notification sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send pre-order inquiry notification:', error);
    return false;
  }
};

// Combined function to send all order notifications (backward compatibility)
export const sendOrderNotification = async (order: OrderWithItems): Promise<boolean> => {
  try {
    // Send emails to both customer and admin
    const [customerResult, adminResult] = await Promise.allSettled([
      sendCustomerOrderConfirmation(order),
      sendAdminOrderNotification(order)
    ]);

    console.log('Customer email result:', customerResult);
    console.log('Admin email result:', adminResult);

    // Return true if at least one email was sent successfully
    return (
      (customerResult.status === 'fulfilled' && customerResult.value) ||
      (adminResult.status === 'fulfilled' && adminResult.value)
    );
  } catch (error) {
    console.error('Failed to send order notifications:', error);
    return false;
  }
};

// Test email configuration
export const testEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('Gmail SMTP configuration is working correctly');
    return true;
  } catch (error) {
    console.error('Gmail SMTP configuration error:', error);
    return false;
  }
};