import Twilio from 'twilio';
class OtpVerificationLibs {
  /**
   * Create a Twilio client.
   * @param  {object} twilioConfig -Twilio account application key
   * @param  {string} account_sid -Twilio account sid
   * @param  {string} auth_key -Twilio authorize key
   * @param  {Twilio} client - Instance of Twilio
   */
  constructor(twilioConfig) {
    this.twilioConfig = twilioConfig;
    this.client = new Twilio(twilioConfig.account_sid, twilioConfig.auth_key);
  }

  /**
   * TODO To get OTP for phone number
   * This function get OTP for phone number
   * @param  {number} countryCode -Country code
   * @param  {number} phoneNumber -Phone Number
   * @Returns Otp verification sms sent status
   */
  async getOtpPhoneNumber(countryCode, phoneNumber) {
    return this.client.verify
      .services(this.twilioConfig.service_id)
      .verifications.create({
        to: `${countryCode}${phoneNumber}`,
        channel: 'sms',
      })
      .then(verification => verification.status)
      .catch(error => {
        console.log(error);
        throw new Error(error);
      });
  }

  /**
   * TODO To verify OTP for phone number
   * This function to verify OTP for phone number
   * @param  {number} countryCode -Country code
   * @param  {number} phoneNumber -Phone Number
   * @param  {number} code -OTP Number
   * @Returns Otp verification status
   */
  async getOtpPhoneNumberVerify(countryCode, phoneNumber, code) {
    return this.client.verify
      .services(this.twilioConfig.service_id)
      .verificationChecks.create({to: `${countryCode}${phoneNumber}`, code})
      .then(verification => verification)
      .catch(error => {
        throw new Error(error);
      });
  }

  /**
   * TODO To get OTP for email address
   * This function to get OTP for email address
   * @param  {email} email -Email address
   * @Returns Otp verification email sent status
   */
  async getOtpEmail(email) {
    return this.client.verify
      .services(this.twilioConfig.service_id)
      .verifications.create({to: email, channel: 'email'})
      .then(verification => verification.status)
      .catch(error => {
        throw new Error(error);
      });
  }

  /**
   * TODO To verify OTP for email address
   * This function to verify OTP for email address
   * @param  {email} email -Email address
   * @param  {number} code -OTP Number
   * @Returns Otp verification status
   */
  async getOtpEmailVerify(email, code) {
    return this.client.verify
      .services(this.twilioConfig.service_id)
      .verificationChecks.create({to: email, code})
      .then(verification => verification)
      .catch(error => {
        throw new Error(error);
      });
  }
}

export default OtpVerificationLibs;
