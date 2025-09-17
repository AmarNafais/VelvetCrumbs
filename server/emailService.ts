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
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 15px; vertical-align: top;">
        <img src="${item.product.image}" alt="${item.product.name}" 
             style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
      </td>
      <td style="padding: 15px; vertical-align: top;">
        <div style="font-weight: 600; margin-bottom: 4px;">${item.product.name}</div>
        <div style="color: #666; font-size: 14px;">Quantity: ${item.quantity}</div>
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
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%); color: white; padding: 30px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; margin-bottom: 10px;">Velvet Crumbs</div>
                <div style="font-size: 18px; opacity: 0.9;">New Order Received</div>
                <div style="margin-top: 20px; background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; display: inline-block;">
                    <div style="font-size: 24px; font-weight: bold;">✓</div>
                    <div style="font-size: 14px; margin-top: 5px;">Order Successfully Placed</div>
                </div>
            </div>

            <!-- Order Details -->
            <div style="padding: 30px;">
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                        <div>
                            <div style="font-weight: 600; color: #333; margin-bottom: 5px;">Order ID:</div>
                            <div style="font-family: monospace; color: #666;">#${order.id.substring(0, 8).toUpperCase()}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 600; color: #333; margin-bottom: 5px;">Order Date:</div>
                            <div style="color: #666;">${formatDate(order.createdAt)}</div>
                        </div>
                    </div>
                </div>

                <!-- Customer Information -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #333; border-bottom: 2px solid #e11d48; padding-bottom: 10px;">Customer Information</h3>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
                        <div style="margin-bottom: 10px;"><strong>Name:</strong> ${order.customerName}</div>
                        <div style="margin-bottom: 10px;"><strong>Email:</strong> ${order.customerEmail}</div>
                        <div style="margin-bottom: 10px;"><strong>Phone:</strong> ${order.customerPhone}</div>
                        <div><strong>Address:</strong> ${order.customerAddress}</div>
                    </div>
                </div>

                <!-- Order Items -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #333; border-bottom: 2px solid #e11d48; padding-bottom: 10px;">Order Items</h3>
                    <table style="width: 100%; border-collapse: collapse; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        ${itemsHTML}
                        <tr style="background-color: #f8f9fa;">
                            <td colspan="2" style="padding: 20px; font-weight: 600; font-size: 16px;">Total:</td>
                            <td style="padding: 20px; text-align: right; font-weight: bold; font-size: 18px; color: #e11d48;">
                                ${formatPrice(order.total)}
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Action Button -->
                <div style="text-align: center; margin: 30px 0;">
                    <div style="background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%); color: white; padding: 15px 30px; border-radius: 8px; display: inline-block; font-weight: 600; text-decoration: none;">
                        View Order in Admin Panel
                    </div>
                </div>

                <!-- Footer Note -->
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; color: #666; font-size: 14px;">
                    <p style="margin: 0;">Please contact the customer within 24 hours to confirm order details and delivery arrangements.</p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #333; color: white; padding: 20px; text-align: center;">
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

// Send order notification email
export const sendOrderNotification = async (order: OrderWithItems): Promise<boolean> => {
  console.log('Starting email notification process for order:', order.id);
  console.log('Gmail credentials check - User:', process.env.GMAIL_USER ? 'Set' : 'Not set');
  console.log('Gmail credentials check - Password:', process.env.GMAIL_APP_PASSWORD ? 'Set' : 'Not set');
  
  try {
    const mailOptions = {
      from: {
        name: 'Velvet Crumbs',
        address: process.env.GMAIL_USER!,
      },
      to: 'admin@velvetcrumbs.lk',
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
    console.log('Order notification email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send order notification email:', error);
    return false;
  }
};

// Test email configuration
export const testEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('Email configuration is working correctly');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};