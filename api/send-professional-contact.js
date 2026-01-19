// Importa la librería nodemailer. La instalación se hace con "npm install nodemailer"
const nodemailer = require('nodemailer');

// Esta es la función principal que Vercel ejecutará.
export default async function handler(req, res) {
  // Solo permitimos que esta función sea llamada con el método POST.
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Extraemos los datos del cuerpo de la petición. El frontend los envía como JSON.
    const { name, email, company, position, opportunity, budget, message } = req.body;

    // --- VALIDACIÓN DEL LADO DEL SERVIDOR ---
    // Es crucial validar los datos aquí, aunque ya se haga en el frontend.
    if (!name || !email || !company || !position || !opportunity || !message) {
      return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }
    
    // --- CONFIGURACIÓN DE NODEMAILER ---
    // Aquí es donde configuras cómo se enviará el email.
    // NUNCA escribas tu contraseña directamente aquí. Usa Environment Variables.
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,     // Servidor SMTP de tu proveedor de email
      port: process.env.EMAIL_PORT,     // Puerto (usualmente 465 para SSL/TLS)
      secure: process.env.EMAIL_PORT == 465, // `true` si el puerto es 465, `false` para otros como 587
      auth: {
        user: process.env.EMAIL_USER,   // Tu dirección de email
        pass: process.env.EMAIL_PASS,   // La contraseña de tu email o una contraseña de aplicación
      },
    });

    // --- CONSTRUCCIÓN DEL EMAIL ---
    const mailOptions = {
      from: `"${name}" <${email}>`, // El remitente será la persona que llenó el formulario
      to: process.env.EMAIL_TO,          // La dirección de email donde quieres recibir los mensajes
      subject: `Nueva oportunidad laboral de ${company}`,
      // El cuerpo del email puede ser texto plano (text) o HTML (html).
      html: `
        <h1>Nueva Oportunidad Profesional</h1>
        <p><strong>Empresa:</strong> ${company}</p>
        <p><strong>Contacto:</strong> ${name} (${position})</p>
        <p><strong>Email:</strong> ${email}</p>
        <hr>
        <p><strong>Tipo de Oportunidad:</strong> ${opportunity}</p>
        <p><strong>Rango Salarial/Presupuesto:</strong> ${budget || 'No especificado'}</p>
        <hr>
        <h2>Descripción:</h2>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    // --- ENVÍO DEL EMAIL ---
    await transporter.sendMail(mailOptions);

    // Si todo va bien, enviamos una respuesta de éxito al frontend.
    res.status(200).json({ message: 'Mensaje enviado con éxito.' });

  } catch (error) {
    // Si algo falla, capturamos el error y lo mostramos en los logs de Vercel.
    console.error('Error al enviar el email:', error);
    // Enviamos una respuesta de error al frontend.
    res.status(500).json({ message: 'Hubo un error al enviar el mensaje.' });
  }
}
