const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create reusable transporter
let transporter = null;

// Initialize email transporter
const initTransporter = () => {
  if (transporter) {
    return transporter;
  }

  // Check if email is configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.warn('Email configuration not found. Email service will not work.');
    return null;
  }
  console.log(process.env.SMTP_HOST, process.env.SMTP_USER, process.env.SMTP_PASS);

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

// Send verification email
const sendVerificationEmail = async (email, fullName, verificationToken) => {
  const emailTransporter = initTransporter();
  
  if (!emailTransporter) {
    const errorMsg = 'Email service not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env file.';
    logger.warn(errorMsg);
    throw new Error(errorMsg);
  }

  try {

    // Create verification URL
    const baseUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173';
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

    // Email content
    const mailOptions = {
      from: `"Hexa Crochet" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verifikasi Email Anda - Hexa Crochet',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verifikasi Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h1 style="color: #4a5568; text-align: center; margin-bottom: 30px;">Verifikasi Email Anda</h1>
            
            <p>Halo <strong>${fullName}</strong>,</p>
            
            <p>Terima kasih telah mendaftar di <strong>Hexa Crochet</strong>!</p>
            
            <p>Untuk menyelesaikan pendaftaran Anda, silakan verifikasi alamat email Anda dengan mengklik tombol di bawah ini:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #4a5568; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Verifikasi Email
              </a>
            </div>
            
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              Atau salin dan tempel link berikut ke browser Anda:<br>
              <a href="${verificationUrl}" style="color: #4a5568; word-break: break-all;">${verificationUrl}</a>
            </p>
            
            <p style="font-size: 12px; color: #666; margin-top: 20px;">
              <strong>Catatan:</strong> Link verifikasi ini akan kedaluwarsa dalam 24 jam. Jika Anda tidak meminta verifikasi email ini, silakan abaikan email ini.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              © ${new Date().getFullYear()} Hexa Crochet. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Halo ${fullName},
        
        Terima kasih telah mendaftar di Hexa Crochet!
        
        Untuk menyelesaikan pendaftaran Anda, silakan verifikasi alamat email Anda dengan mengklik link berikut:
        
        ${verificationUrl}
        
        Catatan: Link verifikasi ini akan kedaluwarsa dalam 24 jam. Jika Anda tidak meminta verifikasi email ini, silakan abaikan email ini.
        
        © ${new Date().getFullYear()} Hexa Crochet. All rights reserved.
      `,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${email}: ${info.messageId}`);
    
    return info;
  } catch (error) {
    logger.error('Error sending verification email:', error);
    throw error;
  }
};

// Format currency
const formatCurrency = (amount, currencyCode = 'IDR') => {
  const amountNum = parseFloat(amount);
  if (currencyCode === 'IDR') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amountNum);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amountNum);
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (orderData, userEmail, userName) => {
  const emailTransporter = initTransporter();
  
  if (!emailTransporter) {
    logger.warn('Email transporter not initialized. Cannot send order confirmation email.');
    return null;
  }

  try {
    const baseUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173';
    const orderUrl = `${baseUrl}/orders/${orderData.id}`;
    const totalAmount = parseFloat(orderData.total_amount) + parseFloat(orderData.shipping_cost);

    // Format order items
    const itemsHtml = orderData.order_items?.map(item => {
      const itemTotal = parseFloat(item.price) * item.quantity;
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
            <strong>${item.product_variant?.product?.name || 'Product'}</strong>
            ${item.product_variant?.variant_name ? `<br><small style="color: #666;">${item.product_variant.variant_name}</small>` : ''}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatCurrency(item.price, orderData.currency_code)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatCurrency(itemTotal, orderData.currency_code)}</td>
        </tr>
      `;
    }).join('') || '';

    const mailOptions = {
      from: `"Hexa Crochet" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `Konfirmasi Pesanan #${orderData.id.slice(-8).toUpperCase()} - Hexa Crochet`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Konfirmasi Pesanan</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h1 style="color: #4a5568; text-align: center; margin-bottom: 30px;">Terima Kasih Atas Pesanan Anda!</h1>
            
            <p>Halo <strong>${userName}</strong>,</p>
            
            <p>Pesanan Anda telah berhasil dibuat. Berikut detail pesanan Anda:</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #4a5568; margin-top: 0;">Detail Pesanan</h2>
              <p><strong>Nomor Pesanan:</strong> #${orderData.id.slice(-8).toUpperCase()}</p>
              <p><strong>Tanggal Pesanan:</strong> ${new Date(orderData.created_at).toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p><strong>Status:</strong> <span style="color: #e53e3e; font-weight: bold;">${orderData.status === 'belum_bayar' ? 'Menunggu Pembayaran' : orderData.status}</span></p>
            </div>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #4a5568; margin-top: 0;">Item Pesanan</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f7fafc;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e2e8f0;">Produk</th>
                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e2e8f0;">Qty</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e2e8f0;">Harga</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e2e8f0;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #4a5568; margin-top: 0;">Ringkasan Pembayaran</h2>
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0;">Subtotal Produk</td>
                  <td style="padding: 8px 0; text-align: right;">${formatCurrency(orderData.total_amount, orderData.currency_code)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">Biaya Pengiriman</td>
                  <td style="padding: 8px 0; text-align: right;">${formatCurrency(orderData.shipping_cost, orderData.currency_code)}</td>
                </tr>
                <tr style="border-top: 2px solid #4a5568; font-weight: bold; font-size: 1.1em;">
                  <td style="padding: 12px 0;">Total Pembayaran</td>
                  <td style="padding: 12px 0; text-align: right; color: #4a5568;">${formatCurrency(totalAmount, orderData.currency_code)}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #4a5568; margin-top: 0;">Alamat Pengiriman</h2>
              <p>
                <strong>${orderData.address?.recipient_name || 'N/A'}</strong><br>
                ${orderData.address?.phone_number || ''}<br>
                ${orderData.address?.address_line || ''}<br>
                ${orderData.address?.city || ''}, ${orderData.address?.province || ''} ${orderData.address?.postal_code || ''}
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${orderUrl}" 
                 style="background-color: #4a5568; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Lihat Detail Pesanan
              </a>
            </div>
            
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              <strong>Catatan:</strong> Silakan lakukan pembayaran sesuai dengan metode yang Anda pilih. Pesanan akan diproses setelah pembayaran dikonfirmasi.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              © ${new Date().getFullYear()} Hexa Crochet. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Terima Kasih Atas Pesanan Anda!
        
        Halo ${userName},
        
        Pesanan Anda telah berhasil dibuat.
        
        Nomor Pesanan: #${orderData.id.slice(-8).toUpperCase()}
        Tanggal: ${new Date(orderData.created_at).toLocaleDateString('id-ID')}
        Status: ${orderData.status === 'belum_bayar' ? 'Menunggu Pembayaran' : orderData.status}
        
        Total Pembayaran: ${formatCurrency(totalAmount, orderData.currency_code)}
        
        Lihat detail pesanan: ${orderUrl}
        
        © ${new Date().getFullYear()} Hexa Crochet. All rights reserved.
      `,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    logger.info(`Order confirmation email sent to ${userEmail}: ${info.messageId}`);
    
    return info;
  } catch (error) {
    logger.error('Error sending order confirmation email:', error);
    throw error;
  }
};

// Send payment invoice email
const sendPaymentInvoiceEmail = async (orderData, paymentData, userEmail, userName) => {
  const emailTransporter = initTransporter();
  
  if (!emailTransporter) {
    logger.warn('Email transporter not initialized. Cannot send payment invoice email.');
    return null;
  }

  try {
    const baseUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173';
    const orderUrl = `${baseUrl}/orders/${orderData.id}`;
    const totalAmount = parseFloat(paymentData.amount);

    // Format order items
    const itemsHtml = orderData.order_items?.map(item => {
      const itemTotal = parseFloat(item.price) * item.quantity;
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
            <strong>${item.product_variant?.product?.name || 'Product'}</strong>
            ${item.product_variant?.variant_name ? `<br><small style="color: #666;">${item.product_variant.variant_name}</small>` : ''}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatCurrency(item.price, orderData.currency_code)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatCurrency(itemTotal, orderData.currency_code)}</td>
        </tr>
      `;
    }).join('') || '';

    const paymentMethodNames = {
      'midtrans': 'Midtrans Payment Gateway',
      'paypal': 'PayPal',
      'COD': 'Cash on Delivery',
      'transfer': 'Bank Transfer',
      'e_wallet': 'E-Wallet'
    };

    const mailOptions = {
      from: `"Hexa Crochet" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `Invoice Pembayaran #${orderData.id.slice(-8).toUpperCase()} - Hexa Crochet`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice Pembayaran</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h1 style="color: #4a5568; text-align: center; margin-bottom: 30px;">Invoice Pembayaran</h1>
            
            <p>Halo <strong>${userName}</strong>,</p>
            
            <p>Pembayaran untuk pesanan Anda telah berhasil diterima. Berikut invoice pembayaran Anda:</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #4a5568; margin-top: 0;">Detail Pembayaran</h2>
              <p><strong>Nomor Pesanan:</strong> #${orderData.id.slice(-8).toUpperCase()}</p>
              <p><strong>Tanggal Pembayaran:</strong> ${paymentData.payment_date ? new Date(paymentData.payment_date).toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'N/A'}</p>
              <p><strong>Metode Pembayaran:</strong> ${paymentMethodNames[paymentData.payment_method] || paymentData.payment_method}</p>
              ${paymentData.payment_reference ? `<p><strong>Referensi Pembayaran:</strong> ${paymentData.payment_reference}</p>` : ''}
              <p><strong>Status:</strong> <span style="color: #38a169; font-weight: bold;">${paymentData.payment_status === 'paid' ? 'Lunas' : paymentData.payment_status}</span></p>
            </div>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #4a5568; margin-top: 0;">Item Pesanan</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f7fafc;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e2e8f0;">Produk</th>
                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e2e8f0;">Qty</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e2e8f0;">Harga</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e2e8f0;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #4a5568; margin-top: 0;">Ringkasan Pembayaran</h2>
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0;">Subtotal Produk</td>
                  <td style="padding: 8px 0; text-align: right;">${formatCurrency(orderData.total_amount, orderData.currency_code)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">Biaya Pengiriman</td>
                  <td style="padding: 8px 0; text-align: right;">${formatCurrency(orderData.shipping_cost, orderData.currency_code)}</td>
                </tr>
                <tr style="border-top: 2px solid #38a169; font-weight: bold; font-size: 1.1em;">
                  <td style="padding: 12px 0;">Total Pembayaran</td>
                  <td style="padding: 12px 0; text-align: right; color: #38a169;">${formatCurrency(totalAmount, paymentData.currency_code || orderData.currency_code)}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${orderUrl}" 
                 style="background-color: #38a169; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Lihat Detail Pesanan
              </a>
            </div>
            
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              <strong>Terima kasih</strong> atas pembayaran Anda. Pesanan Anda akan segera diproses.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              © ${new Date().getFullYear()} Hexa Crochet. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Invoice Pembayaran
        
        Halo ${userName},
        
        Pembayaran untuk pesanan Anda telah berhasil diterima.
        
        Nomor Pesanan: #${orderData.id.slice(-8).toUpperCase()}
        Tanggal Pembayaran: ${paymentData.payment_date ? new Date(paymentData.payment_date).toLocaleDateString('id-ID') : 'N/A'}
        Metode: ${paymentMethodNames[paymentData.payment_method] || paymentData.payment_method}
        Total: ${formatCurrency(totalAmount, paymentData.currency_code || orderData.currency_code)}
        
        Lihat detail: ${orderUrl}
        
        © ${new Date().getFullYear()} Hexa Crochet. All rights reserved.
      `,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    logger.info(`Payment invoice email sent to ${userEmail}: ${info.messageId}`);
    
    return info;
  } catch (error) {
    logger.error('Error sending payment invoice email:', error);
    throw error;
  }
};

// Send order status update email
const sendOrderStatusUpdateEmail = async (orderData, oldStatus, newStatus, userEmail, userName) => {
  const emailTransporter = initTransporter();
  
  if (!emailTransporter) {
    logger.warn('Email transporter not initialized. Cannot send order status update email.');
    return null;
  }

  try {
    const baseUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173';
    const orderUrl = `${baseUrl}/orders/${orderData.id}`;

    const statusMessages = {
      'belum_bayar': 'Menunggu Pembayaran',
      'dikemas': 'Sedang Dikemas',
      'dikirim': 'Sedang Dikirim',
      'diterima': 'Pesanan Diterima',
      'dibatalkan': 'Pesanan Dibatalkan'
    };

    const statusColors = {
      'belum_bayar': '#e53e3e',
      'dikemas': '#3182ce',
      'dikirim': '#d69e2e',
      'diterima': '#38a169',
      'dibatalkan': '#718096'
    };

    const mailOptions = {
      from: `"Hexa Crochet" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `Update Status Pesanan #${orderData.id.slice(-8).toUpperCase()} - Hexa Crochet`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Update Status Pesanan</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h1 style="color: #4a5568; text-align: center; margin-bottom: 30px;">Update Status Pesanan</h1>
            
            <p>Halo <strong>${userName}</strong>,</p>
            
            <p>Status pesanan Anda telah diperbarui:</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 14px;">Status Sebelumnya</p>
              <p style="margin: 10px 0; font-size: 18px; color: #718096;">${statusMessages[oldStatus] || oldStatus}</p>
              <p style="margin: 20px 0; font-size: 24px;">→</p>
              <p style="margin: 0; color: #666; font-size: 14px;">Status Baru</p>
              <p style="margin: 10px 0; font-size: 24px; font-weight: bold; color: ${statusColors[newStatus] || '#4a5568'};">
                ${statusMessages[newStatus] || newStatus}
              </p>
            </div>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #4a5568; margin-top: 0;">Detail Pesanan</h2>
              <p><strong>Nomor Pesanan:</strong> #${orderData.id.slice(-8).toUpperCase()}</p>
              <p><strong>Tanggal Pesanan:</strong> ${new Date(orderData.created_at).toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              ${orderData.shipping?.tracking_number ? `<p><strong>Nomor Resi:</strong> ${orderData.shipping.tracking_number}</p>` : ''}
              ${orderData.shipping?.courier ? `<p><strong>Kurir:</strong> ${orderData.shipping.courier}</p>` : ''}
            </div>

            ${newStatus === 'dikirim' && orderData.shipping?.tracking_number ? `
            <div style="background-color: #e6fffa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #38a169;">
              <h3 style="color: #38a169; margin-top: 0;">📦 Pesanan Sedang Dikirim</h3>
              <p>Pesanan Anda sedang dalam perjalanan. Anda dapat melacak pengiriman menggunakan nomor resi di atas.</p>
            </div>
            ` : ''}

            ${newStatus === 'diterima' ? `
            <div style="background-color: #f0fff4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #38a169;">
              <h3 style="color: #38a169; margin-top: 0;">✅ Pesanan Diterima</h3>
              <p>Terima kasih! Pesanan Anda telah diterima. Kami harap Anda puas dengan produk kami.</p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
              <a href="${orderUrl}" 
                 style="background-color: #4a5568; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Lihat Detail Pesanan
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              © ${new Date().getFullYear()} Hexa Crochet. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Update Status Pesanan
        
        Halo ${userName},
        
        Status pesanan Anda telah diperbarui:
        
        Nomor Pesanan: #${orderData.id.slice(-8).toUpperCase()}
        Status: ${statusMessages[oldStatus] || oldStatus} → ${statusMessages[newStatus] || newStatus}
        ${orderData.shipping?.tracking_number ? `Nomor Resi: ${orderData.shipping.tracking_number}` : ''}
        
        Lihat detail: ${orderUrl}
        
        © ${new Date().getFullYear()} Hexa Crochet. All rights reserved.
      `,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    logger.info(`Order status update email sent to ${userEmail}: ${info.messageId}`);
    
    return info;
  } catch (error) {
    logger.error('Error sending order status update email:', error);
    throw error;
  }
};

// Send shipping update email
const sendShippingUpdateEmail = async (orderData, shippingData, userEmail, userName) => {
  const emailTransporter = initTransporter();
  
  if (!emailTransporter) {
    logger.warn('Email transporter not initialized. Cannot send shipping update email.');
    return null;
  }

  try {
    const baseUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173';
    const orderUrl = `${baseUrl}/orders/${orderData.id}`;
    const trackingUrl = `${baseUrl}/shipping/track/${shippingData.tracking_number || orderData.id}`;

    const statusMessages = {
      'pending': 'Menunggu Pengiriman',
      'shipped': 'Telah Dikirim',
      'in_transit': 'Dalam Perjalanan',
      'delivered': 'Telah Diterima'
    };

    const mailOptions = {
      from: `"Hexa Crochet" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `Update Pengiriman Pesanan #${orderData.id.slice(-8).toUpperCase()} - Hexa Crochet`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Update Pengiriman</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h1 style="color: #4a5568; text-align: center; margin-bottom: 30px;">Update Pengiriman</h1>
            
            <p>Halo <strong>${userName}</strong>,</p>
            
            <p>Ada update terkait pengiriman pesanan Anda:</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #4a5568; margin-top: 0;">Informasi Pengiriman</h2>
              <p><strong>Nomor Pesanan:</strong> #${orderData.id.slice(-8).toUpperCase()}</p>
              <p><strong>Status Pengiriman:</strong> <span style="color: #3182ce; font-weight: bold;">${statusMessages[shippingData.shipping_status] || shippingData.shipping_status}</span></p>
              ${shippingData.courier ? `<p><strong>Kurir:</strong> ${shippingData.courier}</p>` : ''}
              ${shippingData.tracking_number ? `<p><strong>Nomor Resi:</strong> <strong style="color: #3182ce;">${shippingData.tracking_number}</strong></p>` : ''}
              ${shippingData.estimated_delivery ? `<p><strong>Estimasi Pengiriman:</strong> ${new Date(shippingData.estimated_delivery).toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>` : ''}
            </div>

            ${shippingData.tracking_number ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${trackingUrl}" 
                 style="background-color: #3182ce; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Lacak Pengiriman
              </a>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
              <a href="${orderUrl}" 
                 style="background-color: #4a5568; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Lihat Detail Pesanan
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              © ${new Date().getFullYear()} Hexa Crochet. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Update Pengiriman
        
        Halo ${userName},
        
        Ada update terkait pengiriman pesanan Anda.
        
        Nomor Pesanan: #${orderData.id.slice(-8).toUpperCase()}
        Status: ${statusMessages[shippingData.shipping_status] || shippingData.shipping_status}
        ${shippingData.courier ? `Kurir: ${shippingData.courier}` : ''}
        ${shippingData.tracking_number ? `Nomor Resi: ${shippingData.tracking_number}` : ''}
        
        Lihat detail: ${orderUrl}
        
        © ${new Date().getFullYear()} Hexa Crochet. All rights reserved.
      `,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    logger.info(`Shipping update email sent to ${userEmail}: ${info.messageId}`);
    
    return info;
  } catch (error) {
    logger.error('Error sending shipping update email:', error);
    throw error;
  }
};

// Verify email transporter connection
const verifyConnection = async () => {
  try {
    const emailTransporter = initTransporter();
    if (!emailTransporter) {
      return false;
    }
    await emailTransporter.verify();
    logger.info('Email transporter connection verified');
    return true;
  } catch (error) {
    logger.error('Email transporter connection failed:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendOrderConfirmationEmail,
  sendPaymentInvoiceEmail,
  sendOrderStatusUpdateEmail,
  sendShippingUpdateEmail,
  verifyConnection,
  initTransporter,
};

