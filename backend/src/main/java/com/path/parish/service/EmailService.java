package com.path.parish.service;

import com.path.parish.model.ContactMessage;
import com.path.parish.repository.ContactMessageRepository;
import com.path.parish.repository.SiteSettingRepository;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final ContactMessageRepository contactMessageRepository;
    private final SiteSettingRepository siteSettingRepository;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.to:pathbanawa1988@gmail.com}")
    private String configuredRecipientEmail;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${app.mail.resend-api-key:}")
    private String resendApiKey;

    public EmailService(ContactMessageRepository contactMessageRepository,
                        SiteSettingRepository siteSettingRepository) {
        this.contactMessageRepository = contactMessageRepository;
        this.siteSettingRepository = siteSettingRepository;
    }

    public String resolveOfficeEmail() {
        if (configuredRecipientEmail != null && !configuredRecipientEmail.isBlank()) {
            return configuredRecipientEmail.trim();
        }
        return siteSettingRepository.findBySettingKey("email")
                .map(s -> s.getSettingValue() != null && !s.getSettingValue().isBlank() ? s.getSettingValue().trim() : "pathbanawa1988@gmail.com")
                .orElse("pathbanawa1988@gmail.com");
    }

    public boolean sendContactInquiry(ContactMessage contactMessage) {
        String recipient = resolveOfficeEmail();
        boolean sent = false;
        String errorMessage = null;

        // Try Resend API if API key is provided
        if (resendApiKey != null && !resendApiKey.isBlank()) {
            try {
                sendViaResend(contactMessage, recipient);
                sent = true;
                log.info("Contact inquiry #{} forwarded to {} via Resend API", contactMessage.getId(), recipient);
            } catch (Exception e) {
                log.error("Failed to forward contact inquiry #{} via Resend: {}", contactMessage.getId(), e.getMessage());
                errorMessage = "Resend: " + e.getMessage();
            }
        }

        // Try JavaMailSender (Gmail SMTP / Standard SMTP) if not sent yet
        if (!sent && mailSender != null && mailPassword != null && !mailPassword.isBlank()) {
            try {
                sendViaSmtp(contactMessage, recipient);
                sent = true;
                log.info("Contact inquiry #{} forwarded to {} via SMTP", contactMessage.getId(), recipient);
            } catch (Exception e) {
                log.error("Failed to forward contact inquiry #{} via SMTP: {}", contactMessage.getId(), e.getMessage());
                errorMessage = errorMessage != null ? errorMessage + " | SMTP: " + e.getMessage() : "SMTP: " + e.getMessage();
            }
        }

        if (!sent && (mailPassword == null || mailPassword.isBlank()) && (resendApiKey == null || resendApiKey.isBlank())) {
            log.warn("Email dispatch skipped for inquiry #{}: Neither SMTP password nor RESEND_API_KEY is configured in environment variables. Message is stored safely in database.",
                    contactMessage.getId());
            errorMessage = "No email credentials configured. Message saved in database.";
        }

        contactMessage.setEmailSent(sent);
        contactMessage.setSendError(errorMessage);
        contactMessageRepository.save(contactMessage);
        return sent;
    }

    private void sendViaSmtp(ContactMessage message, String recipient) throws Exception {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

        String fromAddress = (mailUsername != null && !mailUsername.isBlank()) ? mailUsername.trim() : recipient;
        helper.setFrom(new InternetAddress(fromAddress, "PATH Parish Website"));
        helper.setTo(recipient);

        if (message.getEmail() != null && !message.getEmail().isBlank()) {
            helper.setReplyTo(new InternetAddress(message.getEmail().trim(), message.getName()));
        }

        String subjectText = message.getSubject() != null && !message.getSubject().isBlank()
                ? message.getSubject().trim()
                : "General Inquiry";
        helper.setSubject("[PATH Website Inquiry] " + subjectText + " - " + message.getName());

        String htmlBody = buildHtmlTemplate(message);
        helper.setText(htmlBody, true);

        mailSender.send(mimeMessage);
    }

    private void sendViaResend(ContactMessage message, String recipient) throws Exception {
        String subjectText = message.getSubject() != null && !message.getSubject().isBlank()
                ? message.getSubject().trim()
                : "General Inquiry";
        String subject = "[PATH Website Inquiry] " + subjectText + " - " + message.getName();
        String htmlBody = buildHtmlTemplate(message);

        // Escape JSON characters
        String escapedHtml = escapeJson(htmlBody);
        String escapedSubject = escapeJson(subject);
        String escapedReplyTo = escapeJson(message.getEmail());

        String payload = String.format("""
            {
              "from": "PATH Parish Website <onboarding@resend.dev>",
              "to": ["%s"],
              "reply_to": "%s",
              "subject": "%s",
              "html": "%s"
            }
            """, recipient, escapedReplyTo, escapedSubject, escapedHtml);

        URI uri = URI.create("https://api.resend.com/emails");
        HttpURLConnection conn = (HttpURLConnection) uri.toURL().openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Authorization", "Bearer " + resendApiKey.trim());
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        conn.setConnectTimeout(8000);
        conn.setReadTimeout(8000);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(payload.getBytes(StandardCharsets.UTF_8));
        }

        int code = conn.getResponseCode();
        if (code < 200 || code >= 300) {
            throw new RuntimeException("Resend API returned HTTP " + code);
        }
    }

    private String buildHtmlTemplate(ContactMessage msg) {
        String formattedDate = msg.getCreatedAt() != null
                ? msg.getCreatedAt().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy - hh:mm a"))
                : "Just now";

        String safeName = escapeHtml(msg.getName());
        String safeEmail = escapeHtml(msg.getEmail());
        String safeSubject = escapeHtml(msg.getSubject() != null && !msg.getSubject().isBlank() ? msg.getSubject() : "General Inquiry");
        String safeMessage = escapeHtml(msg.getMessage()).replace("\n", "<br/>");

        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8"/>
              <title>New Parish Inquiry</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F7F5F0; margin: 0; padding: 24px; color: #2D2D2D;">
              <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border: 1px solid #E5DFD5;">
                <tr>
                  <td style="background: linear-gradient(135deg, #6B1D2F 0%%, #43121D 100%%); padding: 32px 28px; text-align: center; border-bottom: 4px solid #C5A059;">
                    <div style="font-size: 11px; font-weight: 700; color: #E9D5A1; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">
                      Official Parish Website
                    </div>
                    <h1 style="color: #FFFFFF; font-size: 22px; margin: 0; font-family: Georgia, serif; font-weight: 600; letter-spacing: 0.5px;">
                      Parish of the Alliance of the Two Hearts
                    </h1>
                    <p style="color: #F2E4D4; font-size: 13px; margin: 6px 0 0 0;">
                      New Public Website Inquiry Received
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 28px;">
                    <p style="font-size: 14px; line-height: 1.6; color: #555555; margin-top: 0; margin-bottom: 20px;">
                      A new message was submitted through the parish website contact form. You can reply directly to this email to reach the sender.
                    </p>
                    
                    <table width="100%%" style="background-color: #FBF9F6; border: 1px solid #EAE4D9; border-radius: 12px; margin-bottom: 24px; padding: 16px;">
                      <tr>
                        <td style="padding: 6px 12px; font-size: 12px; font-weight: 700; color: #8A6D3B; text-transform: uppercase; width: 120px;">
                          Sender Name:
                        </td>
                        <td style="padding: 6px 12px; font-size: 14px; font-weight: 600; color: #1F1F1F;">
                          %s
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 12px; font-size: 12px; font-weight: 700; color: #8A6D3B; text-transform: uppercase;">
                          Sender Email:
                        </td>
                        <td style="padding: 6px 12px; font-size: 14px; color: #6B1D2F; font-weight: 600;">
                          <a href="mailto:%s" style="color: #6B1D2F; text-decoration: underline;">%s</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 12px; font-size: 12px; font-weight: 700; color: #8A6D3B; text-transform: uppercase;">
                          Subject / Purpose:
                        </td>
                        <td style="padding: 6px 12px; font-size: 14px; color: #1F1F1F; font-weight: 600;">
                          %s
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 12px; font-size: 12px; font-weight: 700; color: #8A6D3B; text-transform: uppercase;">
                          Date &amp; Time:
                        </td>
                        <td style="padding: 6px 12px; font-size: 13px; color: #666666;">
                          %s
                        </td>
                      </tr>
                    </table>

                    <div style="margin-bottom: 12px;">
                      <span style="font-size: 12px; font-weight: 700; color: #6B1D2F; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">
                        Message Content:
                      </span>
                      <div style="background-color: #FFFFFF; border: 1px solid #E0D9CD; border-left: 4px solid #6B1D2F; border-radius: 8px; padding: 18px; font-size: 14px; line-height: 1.7; color: #2D2D2D;">
                        %s
                      </div>
                    </div>

                    <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #EEEEEE; text-align: center;">
                      <a href="mailto:%s?subject=Re:%%20%s" style="display: inline-block; background-color: #6B1D2F; color: #FFFFFF; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; padding: 12px 26px; border-radius: 9999px;">
                        Reply to %s &rarr;
                      </a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #F5F2EB; padding: 16px 24px; text-align: center; font-size: 11px; color: #777777; border-top: 1px solid #E5DFD5;">
                    Parish of the Alliance of the Two Hearts &bull; Banawa, Cebu City<br/>
                    This automated notification was generated from the parish official website.
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(safeName, safeEmail, safeEmail, safeSubject, formattedDate, safeMessage, safeEmail, safeSubject, safeName);
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
