import { createTransport } from 'nodemailer';

import type { Logger } from '../logger';

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface Mailer {
  send(message: MailMessage): Promise<void>;
  /** Checks the SMTP connection (health endpoint). Always true in log-only mode. */
  verify(): Promise<boolean>;
  close(): void;
}

export interface CreateMailerOptions {
  smtpUrl: string | undefined;
  from: string;
  logger: Logger;
}

/**
 * SMTP mailer. Without SMTP_URL (e.g. a fresh self-host install) it logs each message instead
 * of sending, so sign-up links still appear in the logs.
 */
export function createMailer({ smtpUrl, from, logger }: CreateMailerOptions): Mailer {
  if (!smtpUrl) {
    logger.warn('SMTP_URL not set: emails are logged, not sent');
    return {
      send: (message) => {
        logger.info(
          { mail: { to: message.to, subject: message.subject, text: message.text } },
          'email (not sent)',
        );
        return Promise.resolve();
      },
      verify: () => Promise.resolve(true),
      close: () => undefined,
    };
  }

  const transport = createTransport(smtpUrl);
  return {
    async send(message) {
      await transport.sendMail({ from, ...message });
      logger.debug({ to: message.to, subject: message.subject }, 'email sent');
    },
    async verify() {
      try {
        await transport.verify();
        return true;
      } catch (err) {
        logger.warn({ err }, 'SMTP verify failed');
        return false;
      }
    },
    close: () => {
      transport.close();
    },
  };
}
