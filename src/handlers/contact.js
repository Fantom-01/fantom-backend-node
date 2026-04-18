const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendContactEmail = async (req, res) => {
	const { name, email, subject, message } = req.body;

	if (!name || !email || !subject || !message) {
		return res.status(400).json({ error: "All fields are required" });
	}

	try {
		await resend.emails.send({
			from: "Portfolio Contact <onboarding@resend.dev>",
			to: process.env.ADMIN_EMAIL,
			subject: `[Portfolio] ${subject}`,
			html: `
        <h2>New message from your portfolio</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
		});

		return res.json({ message: "Message sent successfully" });
	} catch (err) {
		console.error("Contact email error:", err);
		return res.status(500).json({ error: "Failed to send message" });
	}
};

module.exports = { sendContactEmail };
