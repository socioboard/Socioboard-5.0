import MailBase from '../Services/mail.services.js';
import moment from 'moment';
import MailServiceMongoModel from '../Mongoose/models/mail-services.js';
import expirednotification from './expired-mail.template.js';
import expiringEmailTemplate from './expiring-mail.template.js';
import config from 'config';
import appSumoMailTemplate from './appSumo.template.js';
class MailService extends MailBase {
  constructor(mailServiceConfig) {
    super(mailServiceConfig);
    this.template = {
      // Replace - [FirstName] [AccountType] [ActivationLink]
      registration: `<html xmlns="http://www.w3.org/1999/xhtml">

            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0">
                <title>Socioboard</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet"> 
            </head>
            
            <body bgcolor="#f8f8f8">
            
                <!-- START OF HEADER BLOCK-->
                <table align="center" bgcolor="#fff" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px;">
                    <tbody>
                        <tr>
                            <td valign="top" width="100%">
                                <table cellpadding="0" cellspacing="0" border="0">
                                    <tbody>
                                        <tr>
                                            <td width="100%">
                                
                                                <table bgcolor="#fff" class="table_scale" width="600" align="center"
                                                    cellpadding="0" cellspacing="0" border="0">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%" height="30">&nbsp;</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
            
                                                <table class="table_scale" width="600" bgcolor="#fff" cellpadding="0"
                                                    cellspacing="0" border="0">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%">
                                                                <table width="600" cellpadding="0" cellspacing="0" border="0">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td class="spacer" width="30"></td>
                                                                            <td width="540">
                                         
                                                                                <table class="full" align="center" width="auto"
                                                                                    cellpadding="0" cellspacing="0" border="0"
                                                                                    style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td class="center" align="center"
                                                                                                style="padding: 0px; text-transform: uppercase; font-family: Lucida Sans Unicode; color:#666666; font-size:24px; line-height:34px;">
                                                                                                <span>
                                                                                                    <a href="https://www.socioboard.com/"
                                                                                                        style="color:#0f48d5;" target="_blank">
                                                                                                        <img src="http://socioboard.com/wp-content/uploads/2021/07/0x0.png"
                                                                                                            alt="Socioboard"
                                                                                                            width="auto" height="80"
                                                                                                            border="0"
                                                                                                            style="display: inline;">
                                                                                                    </a>
                                                                                                </span>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                        
                                                                            </td>
                                                                            <td class="spacer" width="30"></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table align="center" bgcolor="#fff" cellpadding="0" cellspacing="0" border="0">
                    <tbody>
                        <tr> 
                            <td valign="top" width="100%">
                                <table cellpadding="0" cellspacing="0" border="0">
                                    <tbody>
                                        <tr>
                                            <td width="100%">
                                                <table class="table_scale" width="600" bgcolor="#fff" cellpadding="0"
                                                    cellspacing="0" border="0">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%">
                                                                <table width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#fff">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>
                                                                                <div style="height: 10px; line-height: 40px;"></div>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td style="padding: 0px;" width="600" valign="middle">
                                                                                <a href="#">
                                                                                <img alt="Verify Account" src="http://socioboard.com/wp-content/uploads/2021/07/verify-account.png" style="width: 100%; display:block;">
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
            
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            
            <table align="center" bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" style="background: #fff;">
                <tbody>
                    <tr>
                        <td valign="top" width="100%">
                        <table border="0" cellpadding="0" cellspacing="0">
                            <tbody>
                                <tr>
                                    <td width="100%">
                                    <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" class="table_scale" width="600">
                                        <tbody>
                                            <tr>
                                                <td width="100%">
                                                <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" width="600">
                                                    <tbody>
                                                        <tr>
                                                            <td style="padding: 0px; background: #fff;" valign="middle" width="600">
                                                            <table align="center" border="0" cellpadding="0" cellspacing="0" class="full" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; " width="540">
                                                                <tbody>
                                                                    <tr>
                                                                        <td align="center">
                                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                    <div style="height: 30px; line-height: 40px;"></div>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                     <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px; mso-line-height-rule: exactly; text-align: left; padding: 0 5px 12px;" align="left">
                                                                                         <b>Hi [FirstName],</b>
                                                                                     </td>
                                                                                </tr>
                                                                                <tr>
                                                                                     <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px; mso-line-height-rule: exactly; text-align: left; padding: 0 5px 12px;" align="left">
                                                                                         <b>Welcome!</b>
                                                                                     </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px;mso-line-height-rule: exactly; text-align: left; padding: 0 5px; padding-bottom:0px; " align="left">
                                                                                        <span>We are happy to have to get started. First, you need to confirm your account. Just press the button below.</span>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td width="100%" height="30">&nbsp;</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td class="center" style="margin: 0; padding-bottom:0px; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 16px; color: #e9e9e9; line-height: 25px;mso-line-height-rule: exactly; text-align: center;" align="center">
                                                                                        <a target="_blank" href="[ActivationLink]" style="background: #f85c37; border: 0px; padding: 12px 20px; color: #fff; font-size: 18px; letter-spacing: 1px; margin-top: 14px; cursor: pointer; font-weight: 600; border-radius: 80px; text-decoration: none;">Confirm Your Account</a>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td width="100%" height="50">&nbsp;</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px;mso-line-height-rule: exactly; text-align: left; padding: 0 5px; padding-bottom:10px; " align="left">
                                                                                        <span>If you have any issues, just email us at <a href="mailto: support@socioboard.com" style="color: #f85c37; text-decoration: none;">support@socioboard.com</a>. We’re always happy to help you out.</span>
                                                                                    </td>
                                                                                </tr>
                                                                                
                                                                                <tr>
                                                                                    <td width="100%" height="20">&nbsp;</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        </td>
                    </tr>
                </tbody>
            </table>
            
            <table align="center" bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" style="background: #fff;">
                <tbody>
                    <tr>
                        <td valign="top" width="100%">
                        <table border="0" cellpadding="0" cellspacing="0">
                            <tbody>
                                <tr>
                                    <td width="100%">
                                    <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" class="table_scale" width="600">
                                        <tbody>
                                            <tr>
                                                <td width="100%">
                                                <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" width="600">
                                                    <tbody>
                                                        <tr>
                                                            <td style="padding: 0px; background: #fff;" valign="middle" width="600">
                                                            <table align="center" border="0" cellpadding="0" cellspacing="0" class="full" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; " width="540">
                                                                <tbody>
                                                                    <tr>
                                                                        <td align="center">
                                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td width="100%" height="20">&nbsp;</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td class="center" style="margin: 0; padding-bottom:12px; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 25px;mso-line-height-rule: exactly;" align="center">
                                                                                        <span>
                                                                                            Cheers,<br>
                                                                                            <b>Team Socioboard</b> 
                                                                                        </span>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td width="100%" height="40">&nbsp;</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        </td>
                    </tr>
                </tbody>
            </table>
            
                <!---FOOTER BLOCK-->
                <table align="center" bgcolor="#26272b" cellpadding="0" cellspacing="0" border="0">
                    <tbody>
                        <tr>
                            <td valign="top" width="100%">
                                <table cellpadding="0" cellspacing="0" border="0">
                                    <tbody>
                                        <tr>
                                            <td width="100%">
                                
                                                <table bgcolor="#26272b" class="table_scale" width="600" align="center"
                                                    cellpadding="0" cellspacing="0" border="0">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%" height="30">&nbsp;</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
            
                                                <table class="table_scale" width="600" bgcolor="#26272b" cellpadding="0"
                                                    cellspacing="0" border="0">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%">
                                                                <table width="600" cellpadding="0" cellspacing="0" border="0">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td class="spacer" width="30"></td>
                                                                            <td width="540">
                                         
                                                                                <table class="full" align="center" width="auto"
                                                                                    cellpadding="0" cellspacing="0" border="0"
                                                                                    style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td class="center" align="center"
                                                                                                style="padding: 0px; text-transform: uppercase; font-family: Lucida Sans Unicode; color:#666666; font-size:24px; line-height:0; padding-bottom: 0px;">
                                                                                                <span>
                                                                                                    <a href="https://www.socioboard.com/"
                                                                                                        style="color:#0f48d5;"  target="_blank">
                                                                                                        <img src="http://socioboard.com/wp-content/uploads/2021/07/socioboard-logo-white.png"
                                                                                                            alt="Socioboard"
                                                                                                            width="auto" height="42"
                                                                                                            border="0"
                                                                                                            style="display: inline;">
                                                                                                    </a>
                                                                                                </span>
                                                                                            </td>
                                                                                        </tr>
                                                                                         <tr>
                                                                                            <td width="100%" height="30">&nbsp;</td>
                                                                                        </tr>
            
                                                                                    </tbody>
                                                                                </table>
                                        
                                                                            </td>
                                                                            <td class="spacer" width="30"></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table align="center" bgcolor="#26272b" cellpadding="0" cellspacing="0" border="0"
                    style="">
                    <tbody>
                        <tr>
                            <td valign="top" width="100%" style="background: #26272b;">
                                <table cellpadding="0" cellspacing="0" border="0">
                                    <tbody>
                                        <tr>
                                            <td width="100%">
                                                <table class="table_scale"  width="600" bgcolor="#26272b" cellpadding="0"
                                                    cellspacing="0" border="0">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%">
                                                                <table width="600" cellpadding="0" cellspacing="0" border="0">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td class="spacer" width="30"></td>
                                                                            <td width="540">
                                                                                <!-- START OF RIGHT COLUMN FOR SOCIAL ICONS-->
                                                                                <table class="full" align="center" width="auto"
                                                                                    cellpadding="0" cellspacing="0" border="0"
                                                                                    style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td class="center" align="center"
                                                                                                style="margin: 0; font-size:14px ; color:#aaaaaa; font-family: Helvetica, Arial, sans-serif; line-height: 100%; padding-bottom: 30px;">
                                                                                                <span>
                                                                                                    <a href="https://www.facebook.com/SocioBoard"
                                                                                                        target="_blank" style="padding-right: 28px; text-decoration: none;">
                                                                                                        <img src="http://socioboard.com/wp-content/uploads/2021/07/mail-fb-icon.png"
                                                                                                            style="width: 30px;" alt="facebook">
                                                                                                    </a> &nbsp;
                                                                                                    <a href="https://twitter.com/Socioboard"
                                                                                                        target="_blank" style="padding-right: 28px; text-decoration: none;">
                                                                                                        <img src="http://socioboard.com/wp-content/uploads/2021/07/mail-tw-icon.png"
                                                                                                            style="width: 30px;" alt="twitter">
                                                                                                    </a> &nbsp;
                                                                                                    <a href="https://www.linkedin.com/company/socioboard-technologies-private-limited"
                                                                                                        target="_blank" style=" text-decoration: none;">
                                                                                                        <img src="http://socioboard.com/wp-content/uploads/2021/07/mail-in-icon.png"
                                                                                                            style="width: 30px;" alt="linkedin">
                                                                                                    </a>
                                                                                                </span>
                                                                                            </td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                          <td colspan="3">
                                                                                            <table width="auto" cellspacing="0" cellpadding="0" align="center">
                                                                                              <tbody><tr>
                                                                                                <th>
                                                                                                  <a href="https://socioboard.org/privacy-policy/" style="color:#bdbdbd; font-family: Open sans, Arial, Helvetica, sans-serif; font-size:14px;font-weight:400;line-height:15px; text-decoration: none;" target="_blank">Privacy Policy</a>
                                                                                                </th>
                                                                                                <th width="10px" style="border-right: 1px solid #bdbdbd;"></th>
                                                                                                <th width="10px"></th>
                                                                                                <th>
                                                                                                  <a href="https://www.socioboard.com/" style="color:#bdbdbd;font-family: Open sans, Arial, Helvetica, sans-serif; font-size:14px;font-weight:400; line-height:15px; text-decoration: none;" target="_blank">socioboard.com</a>
                                                                                                </th>
                                                                                              </tr>
                                                                                            </tbody></table>
                                                                                          </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                                <!-- END OF RIGHT COLUMN FOR SOCIAL ICONS-->
                                                                            </td>
                                                                            <td class="spacer" width="30"></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <!-- START OF VERTICAL SPACER-->
                                                <table bgcolor="#26272b" class="table_scale" width="600" align="center"
                                                    cellpadding="0" cellspacing="0" border="0">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%" height="30">&nbsp;</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <!-- END OF VERTICAL SPACER-->
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b" align="center">
                    <tbody>
                        <tr>
                            <td width="100%" valign="top">
                                <table cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b">
                                    <tbody>
                                        <tr>
                                            <td width="100%">
            
                                                <table class="table_scale" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b" align="center">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%">
                                                                <table width="600" cellspacing="0" cellpadding="0" border="0">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td class="spacer" width="30"></td>
                                                                            <td width="540">
                                                                                <!-- START OF LEFT COLUMN FOR HEADING-->
                                                                                <table class="full" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;" width="500" cellspacing="0" cellpadding="0" border="0" align="center">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td style="margin: 0; font-size:13px ; color:#bdbdbd; font-family: Open sans, Arial, Helvetica, sans-serif; line-height: 18px; text-align: center;" width="100%" height="20">
                                                                                                Copyright © 2014 - 2021 Socioboard. All Rights Reserved.</td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                                <!-- END OF LEFT COLUMN FOR HEADING-->
                                                                            </td>
                                                                            <td class="spacer" width="30"></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <!-- END OF VERTICAL SPACER-->
                                                <!-- START OF VERTICAL SPACER-->
                                                <table class="table_scale" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b" align="center">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%" height="30">&nbsp;</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <!-- END OF VERTICAL SPACER-->
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <!-- END OF FOOTER BLOCK-->
            
            </body>
            
            </html>`,
      unlock:
        '<body style="background-color: #FB6947;"> <div style="margin-top: 50px; margin: 0 auto; width: 630px;"> <div style="width: 630px; height: auto; float: left; margin-top: 125px;"> <div style="width: 630px; padding-top: 17px; text-align: center; height: 80px; background: none repeat scroll 0px 0px rgb(255, 188, 173); border-top-left-radius: 5px; border-top-right-radius: 5px;"> <img style="max-height:110px" src="https://i.imgur.com/qAdpCjL.png" alt="" /> </div> <!--Email content--> <div style="font-family: Tahoma; font-size: 14px; background-color: #fff; color: rgb(24, 24, 24); padding: 10px; float: left; width: 606px; border: 2px solid rgb(255, 255, 255); border-bottom-left-radius: 5px; border-bottom-right-radius: 5px;"> <div style="width: 610px; float: left; height: 35px;"> </div> <div style="width: 610px; height: auto; float: left;"> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> Hi [FirstName], </div> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> Congratulations! We have received your request for [AccountType] plan. </div> </br> </br> <!--</br>--> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> <!-- Your login details are:--> Please click the link below to activate your account. </div> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> <!-- Click <a href="%replink%"> here</a> to login. </div></br></br>--> Click <a href="[ActivationLink]"> here</a> </div> </br></br> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> Hope you have a great time at Socioboard. Keep socioboarding... :)</div> </br> <!--<div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> </div>--> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> Warm regards,</div> </br> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> Socioboard Team</div> </div> <div style="width: 610px; float: left; height: 35px;"> </div> </div> <!--End Email content--> </div> </div> </body>',
      // Replace - [Payername] [payer_email] [item_name] [subscr_date] [paymentId] [amount] [payment_status] [media]
      invoice:
        '<!DOCTYPE HTML> <html style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;font-family: sans-serif;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;font-size: 10px;-webkit-tap-highlight-color: rgba(0,0,0,0);"> <head style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;"> <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;"> <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;"></script> <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;"></script> </head> <style style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;"> .form-horizontal .textalign { text-align: left !important; } .textalign .form-group { border-bottom: 1px solid #efeded; margin-left: 0px; margin-right: 0px; } </style> <body style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;margin: 0;font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;font-size: 14px;line-height: 1.42857143;color: #333;background-color: #fff;"> <div class="container" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;padding-right: 15px;padding-left: 15px;margin-right: auto;margin-left: auto;"> <div style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;"> <div class="modal-dialog" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;position: relative;width: auto;margin: 10px;"> <div class="modal-content" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;position: relative;background-color: #fff;-webkit-background-clip: padding-box;background-clip: padding-box;border: 1px solid rgba(0,0,0,.2);border-radius: 6px;outline: 0;-webkit-box-shadow: 0 5px 15px rgba(0,0,0,.5);box-shadow: 0 5px 15px rgba(0,0,0,.5);"> <div class="modal-header" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;padding: 15px;border-bottom: 1px solid #e5e5e5;"> <h4 class="modal-title" style="text-align: center;font-size: 20px;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;font-family: inherit;font-weight: 500;line-height: 1.42857143;color: inherit;margin-top: 10px;margin-bottom: 10px;margin: 0;">EMS  Paymnet Invoice</h4> </div> <div class="modal-body col-md-offset-3" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;margin-left: 25%;position: relative;padding: 15px;"> <div class="container" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;padding-right: 15px;padding-left: 15px;margin-right: auto;margin-left: auto;"> <div class="row" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;margin-right: -15px;margin-left: -15px;"> <div class="col-xs-12 col-sm-12 col-md-4 col-md-offset-1" style="padding-bottom: 20px;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;float: left;width: 33.33333333%;margin-left: 8.33333333%;"> <img src="https://i.imgur.com/qAdpCjL.png" alt="" class="img-rounded img-responsive col-offset-md-1 col-offset-sm-1" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;border: 0;vertical-align: middle;page-break-inside: avoid;display: block;max-width: 100%!important;height: auto;border-radius: 6px;"> </div> </div> <div class="row" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;margin-right: -15px;margin-left: -15px;"> <div class="col-xs-12 col-sm-6 col-md-6" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;float: left;width: 50%;"> ' +
        '<div class="well well-sm" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;min-height: 20px;padding: 9px;margin-bottom: 20px;background-color: #f5f5f5;border: 1px solid #e3e3e3;border-radius: 3px;-webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.05);box-shadow: inset 0 1px 1px rgba(0,0,0,.05);"> <div class="row" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;margin-right: -15px;margin-left: -15px;"> <div class="col-sm-6 col-md-8 col-md-offset-2" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;width: 66.66666667%;margin-left: 16.66666667%;"> <form class="form-horizontal textalign" role="form" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;"> <fieldset style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;padding: 0;margin: 0;border: 0;min-width: 0;"> <div class="form-group " style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;margin-bottom: 15px;margin-right: 0px;margin-left: 0px;border-bottom: 1px solid #efeded;"> <label class="col-sm-6 control-label textalign" for="textinput" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;display: inline-block;max-width: 100%;margin-bottom: 5px;font-weight: 700;position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;width: 50%;text-align: left !important;">Name</label> <div class="col-sm-6" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;width: 50%;"> <label type="text" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;display: inline-block;max-width: 100%;margin-bottom: 5px;font-weight: 700;">[Payername]</label> </div> </div> <div class="form-group " style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;margin-bottom: 15px;margin-right: 0px;margin-left: 0px;border-bottom: 1px solid #efeded;"> <label class="col-sm-6 control-label textalign" for="textinput" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;display: inline-block;max-width: 100%;margin-bottom: 5px;font-weight: 700;position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;width: 50%;text-align: left !important;">Email</label> <div class="col-sm-6" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;width: 50%;"> <label type="text" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;display: inline-block;max-width: 100%;margin-bottom: 5px;font-weight: 700;">[payer_email]</label> </div> </div> <div class="form-group" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;margin-bottom: 15px;margin-right: 0px;margin-left: 0px;border-bottom: 1px solid #efeded;"> <label class="col-sm-6 control-label textalign" for="textinput" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;display: inline-block;max-width: 100%;margin-bottom: 5px;font-weight: 700;position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;width: 50%;text-align: left !important;">Package</label> <div class="col-sm-6" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;width: 50%;"> <label type="text" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;display: inline-block;max-width: 100%;margin-bottom: 5px;font-weight: 700;">[item_name] EMS </label> </div> </div> <div class="form-group" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;margin-bottom: 15px;margin-right: 0px;margin-left: 0px;border-bottom: 1px solid #efeded;"> <label class="col-sm-6 control-label textalign" for="textinput" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;display: inline-block;max-width: 100%;margin-bottom: 5px;font-weight: 700;position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;width: 50%;text-align: left !important;">Created Date</label> <div class="col-sm-6" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;width: 50%;"> <label type="text" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;display: inline-block;max-width: 100%;margin-bottom: 5px;font-weight: 700;">[subscr_date]</label> </div> </div> </fieldset> </form> </div> </div> <hr style="-webkit-box-sizing: content-box;-moz-box-sizing: content-box;box-sizing: content-box;height: 0;margin-top: 20px;margin-bottom: 20px;border: 0;border-top: 1px solid #eee;"> <div class="row" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;margin-right: -15px;margin-left: -15px;"> <div class="col-sm-12 col-md-8 col-md-offset-2" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;width: 66.66666667%;margin-left: 16.66666667%;">' +
        '<form class="form-horizontal textalign" role="form" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;"> <fieldset style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;padding: 0;margin: 0;border: 0;min-width: 0;"> <div class="form-group" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;margin-bottom: 15px;margin-right: 0px;margin-left: 0px;border-bottom: 1px solid #efeded;"> <label class="col-sm-6 control-label textalign" for="textinput" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;display: inline-block;max-width: 100%;margin-bottom: 5px;font-weight: 700;position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;width: 50%;text-align: left !important;">Transaction ID</label> <div class="col-sm-6" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;width: 50%;"> <label type="text" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;display: inline-block;max-width: 100%;margin-bottom: 5px;font-weight: 700;">[paymentId]</label> </div> </div> <div class="form-group" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;margin-bottom: 15px;margin-right: 0px;margin-left: 0px;border-bottom: 1px solid #efeded;"> <label class="col-sm-6 control-label textalign" for="textinput" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;display: inline-block;max-width: 100%;margin-bottom: 5px;font-weight: 700;position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;width: 50%;text-align: left !important;">Transaction Amount</label> <div class="col-sm-6" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;width: 50%;"> <label type="text" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;display: inline-block;max-width: 100%;margin-bottom: 5px;font-weight: 700;">[amount]</label> </div> </div> <div class="form-group" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;margin-bottom: 15px;margin-right: 0px;margin-left: 0px;border-bottom: 1px solid #efeded;"> <label class="col-sm-6 control-label textalign" for="textinput" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;display: inline-block;max-width: 100%;margin-bottom: 5px;font-weight: 700;position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;width: 50%;text-align: left !important;">Transaction Status</label> <div class="col-sm-6" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;width: 50%;"> <label type="text" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;display: inline-block;max-width: 100%;margin-bottom: 5px;font-weight: 700;">[payment_status]</label> </div> </div> <div class="form-group" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;margin-bottom: 15px;margin-right: 0px;margin-left: 0px;border-bottom: 1px solid #efeded;"> <label class="col-sm-6 control-label textalign" for="textinput" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;display: inline-block;max-width: 100%;margin-bottom: 5px;font-weight: 700;position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;width: 50%;text-align: left !important;">Media Device</label> <div class="col-sm-6" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;position: relative;min-height: 1px;padding-right: 15px;padding-left: 15px;width: 50%;"> <label type="text" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;display: inline-block;max-width: 100%;margin-bottom: 5px;font-weight: 700;">[media]</label> </div> </div> </fieldset> </form> </div> </div> </div> </div> </div> </div> <div class="modal-footer" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;padding: 15px;text-align: right;border-top: 1px solid #e5e5e5;"> </div> </div> </div> </div> </div> </div> </body> </html>',

      // Replace - [FirstName] [ActivationLink]
      forgotpassword: `<html xmlns="http://www.w3.org/1999/xhtml">

            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0">
                <title>Socioboard</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet"> 
            </head>
            
            <body bgcolor="#f8f8f8">
            
                <!-- START OF HEADER BLOCK-->
            <table align="center" bgcolor="#fff" cellpadding="0" cellspacing="0" border="0"
                    style="margin-top: 20px;">
                    <tbody>
                        <tr>
                            <td valign="top" width="100%">
                                <table cellpadding="0" cellspacing="0" border="0">
                                    <tbody>
                                        <tr>
                                            <td width="100%">
                                
                                                <table bgcolor="#fff" class="table_scale" width="600" align="center"
                                                    cellpadding="0" cellspacing="0" border="0">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%" height="30">&nbsp;</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
            
                                                <table class="table_scale" width="600" bgcolor="#fff" cellpadding="0"
                                                    cellspacing="0" border="0">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%">
                                                                <table width="600" cellpadding="0" cellspacing="0" border="0">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td class="spacer" width="30"></td>
                                                                            <td width="540">
                                         
                                                                                <table class="full" align="center" width="auto"
                                                                                    cellpadding="0" cellspacing="0" border="0"
                                                                                    style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td class="center" align="center"
                                                                                                style="padding: 0px; text-transform: uppercase; font-family: Lucida Sans Unicode; color:#666666; font-size:24px; line-height:34px;">
                                                                                                <span>
                                                                                                    <a href="https://www.socioboard.com/"
                                                                                                        style="color:#0f48d5;" target="_blank">
                                                                                                        <img src="http://socioboard.com/wp-content/uploads/2021/07/0x0.png"
                                                                                                            alt="Socioboard"
                                                                                                            width="auto" height="80"
                                                                                                            border="0"
                                                                                                            style="display: inline;">
                                                                                                    </a>
                                                                                                </span>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                        
                                                                            </td>
                                                                            <td class="spacer" width="30"></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table align="center" bgcolor="#fff" cellpadding="0" cellspacing="0" border="0">
                    <tbody>
                        <tr> 
                            <td valign="top" width="100%">
                                <table cellpadding="0" cellspacing="0" border="0">
                                    <tbody>
                                        <tr>
                                            <td width="100%">
                                                <table class="table_scale" width="600" bgcolor="#fff" cellpadding="0"
                                                    cellspacing="0" border="0">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%">
                                                                <table width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#fff">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>
                                                                                <div style="height: 10px; line-height: 40px;"></div>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td style="padding: 0px;" width="600" valign="middle">
                                                                                <a href="#">
                                                                                <img alt="Reset Passsword" src="http://socioboard.com/wp-content/uploads/2021/07/reset-passsword.png" style="width: 100%; display:block;">
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
            
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            
            <table align="center" bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" style="background: #fff;">
                <tbody>
                    <tr>
                        <td valign="top" width="100%">
                        <table border="0" cellpadding="0" cellspacing="0">
                            <tbody>
                                <tr>
                                    <td width="100%">
                                    <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" class="table_scale" width="600">
                                        <tbody>
                                            <tr>
                                                <td width="100%">
                                                <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" width="600">
                                                    <tbody>
                                                        <tr>
                                                            <td style="padding: 0px; background: #fff;" valign="middle" width="600">
                                                            <table align="center" border="0" cellpadding="0" cellspacing="0" class="full" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; " width="540">
                                                                <tbody>
                                                                    <tr>
                                                                        <td align="center">
                                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                    <div style="height: 30px; line-height: 40px;"></div>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                     <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px; mso-line-height-rule: exactly; text-align: left; padding: 0 5px 12px;" align="left">
                                                                                         <b>Hi [FirstName],</b>
                                                                                     </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px;mso-line-height-rule: exactly; text-align: left; padding: 0 5px; padding-bottom:10px; " align="left">
                                                                                        <span>You have requested for reset password.</span>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px;mso-line-height-rule: exactly; text-align: left; padding: 0 5px; padding-bottom:10px; " align="left">
                                                                                        <span>Please click the link below to change your password.</span>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px;mso-line-height-rule: exactly; text-align: left; padding: 0 5px; padding-bottom: 30px;" align="left">
                                                                                        <span><a href="[ActivationLink]" target="_blank" style="color: #f85c37;">Click here</a>
                                                                                        </span>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px;mso-line-height-rule: exactly; text-align: left; padding: 0 5px; padding-bottom:10px; " align="left">
                                                                                        <span>Hope you have a great time at Socioboard. Keep socioboarding 😊</span>
                                                                                    </td>
                                                                                </tr>
                                                                                
                                                                                <tr>
                                                                                    <td width="100%" height="20">&nbsp;</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        </td>
                    </tr>
                </tbody>
            </table>
            
            <table align="center" bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" style="background: #fff;">
                <tbody>
                    <tr>
                        <td valign="top" width="100%">
                        <table border="0" cellpadding="0" cellspacing="0">
                            <tbody>
                                <tr>
                                    <td width="100%">
                                    <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" class="table_scale" width="600">
                                        <tbody>
                                            <tr>
                                                <td width="100%">
                                                <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" width="600">
                                                    <tbody>
                                                        <tr>
                                                            <td style="padding: 0px; background: #fff;" valign="middle" width="600">
                                                            <table align="center" border="0" cellpadding="0" cellspacing="0" class="full" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; " width="540">
                                                                <tbody>
                                                                    <tr>
                                                                        <td align="center">
                                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td width="100%" height="20">&nbsp;</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td class="center" style="margin: 0; padding-bottom:12px; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 25px;mso-line-height-rule: exactly;" align="center">
                                                                                        <span>
                                                                                            Regards,<br>
                                                                                            <b>Team Socioboard</b> 
                                                                                        </span>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td width="100%" height="40">&nbsp;</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        </td>
                    </tr>
                </tbody>
            </table>
            
                <!---FOOTER BLOCK-->
                <table align="center" bgcolor="#26272b" cellpadding="0" cellspacing="0" border="0">
                    <tbody>
                        <tr>
                            <td valign="top" width="100%">
                                <table cellpadding="0" cellspacing="0" border="0">
                                    <tbody>
                                        <tr>
                                            <td width="100%">
                                
                                                <table bgcolor="#26272b" class="table_scale" width="600" align="center"
                                                    cellpadding="0" cellspacing="0" border="0">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%" height="30">&nbsp;</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
            
                                                <table class="table_scale" width="600" bgcolor="#26272b" cellpadding="0"
                                                    cellspacing="0" border="0">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%">
                                                                <table width="600" cellpadding="0" cellspacing="0" border="0">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td class="spacer" width="30"></td>
                                                                            <td width="540">
                                         
                                                                                <table class="full" align="center" width="auto"
                                                                                    cellpadding="0" cellspacing="0" border="0"
                                                                                    style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td class="center" align="center"
                                                                                                style="padding: 0px; text-transform: uppercase; font-family: Lucida Sans Unicode; color:#666666; font-size:24px; line-height:0; padding-bottom: 0px;">
                                                                                                <span>
                                                                                                    <a href="https://www.socioboard.com/"
                                                                                                        style="color:#0f48d5;"  target="_blank">
                                                                                                        <img src="http://socioboard.com/wp-content/uploads/2021/07/socioboard-logo-white.png"
                                                                                                            alt="Socioboard"
                                                                                                            width="auto" height="42"
                                                                                                            border="0"
                                                                                                            style="display: inline;">
                                                                                                    </a>
                                                                                                </span>
                                                                                            </td>
                                                                                        </tr>
                                                                                         <tr>
                                                                                            <td width="100%" height="30">&nbsp;</td>
                                                                                        </tr>
            
                                                                                    </tbody>
                                                                                </table>
                                        
                                                                            </td>
                                                                            <td class="spacer" width="30"></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table align="center" bgcolor="#26272b" cellpadding="0" cellspacing="0" border="0"
                    style="">
                    <tbody>
                        <tr>
                            <td valign="top" width="100%" style="background: #26272b;">
                                <table cellpadding="0" cellspacing="0" border="0">
                                    <tbody>
                                        <tr>
                                            <td width="100%">
                                                <table class="table_scale"  width="600" bgcolor="#26272b" cellpadding="0"
                                                    cellspacing="0" border="0">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%">
                                                                <table width="600" cellpadding="0" cellspacing="0" border="0">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td class="spacer" width="30"></td>
                                                                            <td width="540">
                                                                                <!-- START OF RIGHT COLUMN FOR SOCIAL ICONS-->
                                                                                <table class="full" align="center" width="auto"
                                                                                    cellpadding="0" cellspacing="0" border="0"
                                                                                    style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td class="center" align="center"
                                                                                                style="margin: 0; font-size:14px ; color:#aaaaaa; font-family: Helvetica, Arial, sans-serif; line-height: 100%; padding-bottom: 30px;">
                                                                                                <span>
                                                                                                    <a href="https://www.facebook.com/SocioBoard"
                                                                                                        target="_blank" style="padding-right: 28px; text-decoration: none;">
                                                                                                        <img src="http://socioboard.com/wp-content/uploads/2021/07/mail-fb-icon.png"
                                                                                                            style="width: 30px;" alt="facebook">
                                                                                                    </a> &nbsp;
                                                                                                    <a href="https://twitter.com/Socioboard"
                                                                                                        target="_blank" style="padding-right: 28px; text-decoration: none;">
                                                                                                        <img src="http://socioboard.com/wp-content/uploads/2021/07/mail-tw-icon.png"
                                                                                                            style="width: 30px;" alt="twitter">
                                                                                                    </a> &nbsp;
                                                                                                    <a href="https://www.linkedin.com/company/socioboard-technologies-private-limited"
                                                                                                        target="_blank" style=" text-decoration: none;">
                                                                                                        <img src="http://socioboard.com/wp-content/uploads/2021/07/mail-in-icon.png"
                                                                                                            style="width: 30px;" alt="linkedin">
                                                                                                    </a>
                                                                                                </span>
                                                                                            </td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                          <td colspan="3">
                                                                                            <table width="auto" cellspacing="0" cellpadding="0" align="center">
                                                                                              <tbody><tr>
                                                                                                <th>
                                                                                                  <a href="https://socioboard.org/privacy-policy/" style="color:#bdbdbd; font-family: Open sans, Arial, Helvetica, sans-serif; font-size:14px;font-weight:400;line-height:15px; text-decoration: none;" target="_blank">Privacy Policy</a>
                                                                                                </th>
                                                                                                <th width="10px" style="border-right: 1px solid #bdbdbd;"></th>
                                                                                                <th width="10px"></th>
                                                                                                <th>
                                                                                                  <a href="https://www.socioboard.com/" style="color:#bdbdbd;font-family: Open sans, Arial, Helvetica, sans-serif; font-size:14px;font-weight:400; line-height:15px; text-decoration: none;" target="_blank">socioboard.com</a>
                                                                                                </th>
                                                                                            </tbody></table>
                                                                                          </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                                <!-- END OF RIGHT COLUMN FOR SOCIAL ICONS-->
                                                                            </td>
                                                                            <td class="spacer" width="30"></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <!-- START OF VERTICAL SPACER-->
                                                <table bgcolor="#26272b" class="table_scale" width="600" align="center"
                                                    cellpadding="0" cellspacing="0" border="0">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%" height="30">&nbsp;</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <!-- END OF VERTICAL SPACER-->
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b" align="center">
                    <tbody>
                        <tr>
                            <td width="100%" valign="top">
                                <table cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b">
                                    <tbody>
                                        <tr>
                                            <td width="100%">
            
                                                <table class="table_scale" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b" align="center">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%">
                                                                <table width="600" cellspacing="0" cellpadding="0" border="0">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td class="spacer" width="30"></td>
                                                                            <td width="540">
                                                                                <!-- START OF LEFT COLUMN FOR HEADING-->
                                                                                <table class="full" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;" width="500" cellspacing="0" cellpadding="0" border="0" align="center">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td style="margin: 0; font-size:13px ; color:#bdbdbd; font-family: Open sans, Arial, Helvetica, sans-serif; line-height: 18px; text-align: center;" width="100%" height="20">
                                                                                                Copyright © 2014 - 2021 Socioboard. All Rights Reserved.</td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                                <!-- END OF LEFT COLUMN FOR HEADING-->
                                                                            </td>
                                                                            <td class="spacer" width="30"></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <!-- END OF VERTICAL SPACER-->
                                                <!-- START OF VERTICAL SPACER-->
                                                <table class="table_scale" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b" align="center">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%" height="30">&nbsp;</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <!-- END OF VERTICAL SPACER-->
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <!-- END OF FOOTER BLOCK-->
            
            </body>
            
            </html>`,
      // Replace - [FirstName] [ActivationLink]
      directLogin: `<html xmlns="http://www.w3.org/1999/xhtml">

            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0">
                <title>Socioboard</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet"> 
            </head>
            
            <body bgcolor="#f8f8f8">
            
                <!-- START OF HEADER BLOCK-->
                <table align="center" bgcolor="#fff" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px;">
                    <tbody>
                        <tr>
                            <td valign="top" width="100%">
                                <table cellpadding="0" cellspacing="0" border="0">
                                    <tbody>
                                        <tr>
                                            <td width="100%">
                                
                                                <table bgcolor="#fff" class="table_scale" width="600" align="center"
                                                    cellpadding="0" cellspacing="0" border="0">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%" height="30">&nbsp;</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
            
                                                <table class="table_scale" width="600" bgcolor="#fff" cellpadding="0"
                                                    cellspacing="0" border="0">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%">
                                                                <table width="600" cellpadding="0" cellspacing="0" border="0">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td class="spacer" width="30"></td>
                                                                            <td width="540">
                                         
                                                                                <table class="full" align="center" width="auto"
                                                                                    cellpadding="0" cellspacing="0" border="0"
                                                                                    style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td class="center" align="center"
                                                                                                style="padding: 0px; text-transform: uppercase; font-family: Lucida Sans Unicode; color:#666666; font-size:24px; line-height:34px;">
                                                                                                <span>
                                                                                                    <a href="https://www.socioboard.com/"
                                                                                                        style="color:#0f48d5;" target="_blank">
                                                                                                        <img src="http://socioboard.com/wp-content/uploads/2021/07/0x0.png"
                                                                                                            alt="Socioboard"
                                                                                                            width="auto" height="80"
                                                                                                            border="0"
                                                                                                            style="display: inline;">
                                                                                                    </a>
                                                                                                </span>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                        
                                                                            </td>
                                                                            <td class="spacer" width="30"></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table align="center" bgcolor="#fff" cellpadding="0" cellspacing="0" border="0">
                    <tbody>
                        <tr> 
                            <td valign="top" width="100%">
                                <table cellpadding="0" cellspacing="0" border="0">
                                    <tbody>
                                        <tr>
                                            <td width="100%">
                                                <table class="table_scale" width="600" bgcolor="#fff" cellpadding="0"
                                                    cellspacing="0" border="0">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%">
                                                                <table width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#fff">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>
                                                                                <div style="height: 10px; line-height: 40px;"></div>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td style="padding: 0px;" width="600" valign="middle">
                                                                                <a href="#">
                                                                                <img alt="Direct Login" src="http://socioboard.com/wp-content/uploads/2021/07/direct-login.png" style="width: 100%; display:block;">
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
            
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            
            <table align="center" bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" style="background: #fff;">
                <tbody>
                    <tr>
                        <td valign="top" width="100%">
                        <table border="0" cellpadding="0" cellspacing="0">
                            <tbody>
                                <tr>
                                    <td width="100%">
                                    <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" class="table_scale" width="600">
                                        <tbody>
                                            <tr>
                                                <td width="100%">
                                                <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" width="600">
                                                    <tbody>
                                                        <tr>
                                                            <td style="padding: 0px; background: #fff;" valign="middle" width="600">
                                                            <table align="center" border="0" cellpadding="0" cellspacing="0" class="full" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; " width="540">
                                                                <tbody>
                                                                    <tr>
                                                                        <td align="center">
                                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>
                                                                                    <div style="height: 30px; line-height: 40px;"></div>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                     <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px; mso-line-height-rule: exactly; text-align: left; padding: 0 5px 12px;" align="left">
                                                                                         <b>Hi [FirstName],</b>
                                                                                     </td>
                                                                                </tr>
                                                                                <tr>
                                                                                     <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px; mso-line-height-rule: exactly; text-align: left; padding: 0 5px 12px;" align="left">
                                                                                         We have received a login request.
                                                                                     </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px;mso-line-height-rule: exactly; text-align: left; padding: 0 5px; padding-bottom:12px; " align="left">
                                                                                        Use the link below to <b>Direct Login</b> to your account without any password.
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px;mso-line-height-rule: exactly; text-align: left; padding: 0 5px; padding-bottom:0; " align="left">
                                                                                        <a target="_blank" href="[ActivationLink]" style="color: #f85c37; text-decoration: underline;">Click here</a>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td width="100%" height="30">&nbsp;</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px;mso-line-height-rule: exactly; text-align: left; padding: 0 5px; padding-bottom:10px; " align="left">
                                                                                        If you did not initiate this request, ignore this email, the link will expire on its own
                                                                                    </td>
                                                                                </tr>
                                                                                
                                                                                <tr>
                                                                                    <td width="100%" height="20">&nbsp;</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        </td>
                    </tr>
                </tbody>
            </table>
            
            <table align="center" bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" style="background: #fff;">
                <tbody>
                    <tr>
                        <td valign="top" width="100%">
                        <table border="0" cellpadding="0" cellspacing="0">
                            <tbody>
                                <tr>
                                    <td width="100%">
                                    <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" class="table_scale" width="600">
                                        <tbody>
                                            <tr>
                                                <td width="100%">
                                                <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" width="600">
                                                    <tbody>
                                                        <tr>
                                                            <td style="padding: 0px; background: #fff;" valign="middle" width="600">
                                                            <table align="center" border="0" cellpadding="0" cellspacing="0" class="full" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; " width="540">
                                                                <tbody>
                                                                    <tr>
                                                                        <td align="center">
                                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td width="100%" height="20">&nbsp;</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td class="center" style="margin: 0; padding-bottom:12px; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 25px;mso-line-height-rule: exactly;" align="center">
                                                                                        <span>
                                                                                            Cheers,<br>
                                                                                            <b>Team Socioboard</b> 
                                                                                        </span>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td width="100%" height="40">&nbsp;</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        </td>
                    </tr>
                </tbody>
            </table>
            
                <!---FOOTER BLOCK-->
                <table align="center" bgcolor="#26272b" cellpadding="0" cellspacing="0" border="0">
                    <tbody>
                        <tr>
                            <td valign="top" width="100%">
                                <table cellpadding="0" cellspacing="0" border="0">
                                    <tbody>
                                        <tr>
                                            <td width="100%">
                                
                                                <table bgcolor="#26272b" class="table_scale" width="600" align="center"
                                                    cellpadding="0" cellspacing="0" border="0">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%" height="30">&nbsp;</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
            
                                                <table class="table_scale" width="600" bgcolor="#26272b" cellpadding="0"
                                                    cellspacing="0" border="0">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%">
                                                                <table width="600" cellpadding="0" cellspacing="0" border="0">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td class="spacer" width="30"></td>
                                                                            <td width="540">
                                         
                                                                                <table class="full" align="center" width="auto"
                                                                                    cellpadding="0" cellspacing="0" border="0"
                                                                                    style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td class="center" align="center"
                                                                                                style="padding: 0px; text-transform: uppercase; font-family: Lucida Sans Unicode; color:#666666; font-size:24px; line-height:0; padding-bottom: 0px;">
                                                                                                <span>
                                                                                                    <a href="https://www.socioboard.com/"
                                                                                                        style="color:#0f48d5;"  target="_blank">
                                                                                                        <img src="http://socioboard.com/wp-content/uploads/2021/07/socioboard-logo-white.png"
                                                                                                            alt="Socioboard"
                                                                                                            width="auto" height="42"
                                                                                                            border="0"
                                                                                                            style="display: inline;">
                                                                                                    </a>
                                                                                                </span>
                                                                                            </td>
                                                                                        </tr>
                                                                                         <tr>
                                                                                            <td width="100%" height="30">&nbsp;</td>
                                                                                        </tr>
            
                                                                                    </tbody>
                                                                                </table>
                                        
                                                                            </td>
                                                                            <td class="spacer" width="30"></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table align="center" bgcolor="#26272b" cellpadding="0" cellspacing="0" border="0"
                    style="">
                    <tbody>
                        <tr>
                            <td valign="top" width="100%" style="background: #26272b;">
                                <table cellpadding="0" cellspacing="0" border="0">
                                    <tbody>
                                        <tr>
                                            <td width="100%">
                                                <table class="table_scale"  width="600" bgcolor="#26272b" cellpadding="0"
                                                    cellspacing="0" border="0">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%">
                                                                <table width="600" cellpadding="0" cellspacing="0" border="0">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td class="spacer" width="30"></td>
                                                                            <td width="540">
                                                                                <!-- START OF RIGHT COLUMN FOR SOCIAL ICONS-->
                                                                                <table class="full" align="center" width="auto"
                                                                                    cellpadding="0" cellspacing="0" border="0"
                                                                                    style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td class="center" align="center"
                                                                                                style="margin: 0; font-size:14px ; color:#aaaaaa; font-family: Helvetica, Arial, sans-serif; line-height: 100%; padding-bottom: 30px;">
                                                                                                <span>
                                                                                                    <a href="https://www.facebook.com/SocioBoard"
                                                                                                        target="_blank" style="padding-right: 28px; text-decoration: none;">
                                                                                                        <img src="http://socioboard.com/wp-content/uploads/2021/07/mail-fb-icon.png"
                                                                                                            style="width: 30px;" alt="facebook">
                                                                                                    </a> &nbsp;
                                                                                                    <a href="https://twitter.com/Socioboard"
                                                                                                        target="_blank" style="padding-right: 28px; text-decoration: none;">
                                                                                                        <img src="http://socioboard.com/wp-content/uploads/2021/07/mail-tw-icon.png"
                                                                                                            style="width: 30px;" alt="twitter">
                                                                                                    </a> &nbsp;
                                                                                                    <a href="https://www.linkedin.com/company/socioboard-technologies-private-limited"
                                                                                                        target="_blank" style=" text-decoration: none;">
                                                                                                        <img src="http://socioboard.com/wp-content/uploads/2021/07/mail-in-icon.png"
                                                                                                            style="width: 30px;" alt="linkedin">
                                                                                                    </a>
                                                                                                </span>
                                                                                            </td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                          <td colspan="3">
                                                                                            <table width="auto" cellspacing="0" cellpadding="0" align="center">
                                                                                              <tbody><tr>
                                                                                                <th>
                                                                                                  <a href="https://socioboard.org/privacy-policy/" style="color:#bdbdbd; font-family: Open sans, Arial, Helvetica, sans-serif; font-size:14px;font-weight:400;line-height:15px; text-decoration: none;" target="_blank">Privacy Policy</a>
                                                                                                </th>
                                                                                                <th width="10px" style="border-right: 1px solid #bdbdbd;"></th>
                                                                                                <th width="10px"></th>
                                                                                                <th>
                                                                                                  <a href="https://www.socioboard.com/" style="color:#bdbdbd;font-family: Open sans, Arial, Helvetica, sans-serif; font-size:14px;font-weight:400; line-height:15px; text-decoration: none;" target="_blank">socioboard.com</a>
                                                                                                </th>
                                                                                              </tr>
                                                                                            </tbody></table>
                                                                                          </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                                <!-- END OF RIGHT COLUMN FOR SOCIAL ICONS-->
                                                                            </td>
                                                                            <td class="spacer" width="30"></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <!-- START OF VERTICAL SPACER-->
                                                <table bgcolor="#26272b" class="table_scale" width="600" align="center"
                                                    cellpadding="0" cellspacing="0" border="0">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%" height="30">&nbsp;</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <!-- END OF VERTICAL SPACER-->
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b" align="center">
                    <tbody>
                        <tr>
                            <td width="100%" valign="top">
                                <table cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b">
                                    <tbody>
                                        <tr>
                                            <td width="100%">
            
                                                <table class="table_scale" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b" align="center">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%">
                                                                <table width="600" cellspacing="0" cellpadding="0" border="0">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td class="spacer" width="30"></td>
                                                                            <td width="540">
                                                                                <!-- START OF LEFT COLUMN FOR HEADING-->
                                                                                <table class="full" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;" width="500" cellspacing="0" cellpadding="0" border="0" align="center">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td style="margin: 0; font-size:13px ; color:#bdbdbd; font-family: Open sans, Arial, Helvetica, sans-serif; line-height: 18px; text-align: center;" width="100%" height="20">
                                                                                                Copyright © 2014 - 2021 Socioboard. All Rights Reserved.</td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                                <!-- END OF LEFT COLUMN FOR HEADING-->
                                                                            </td>
                                                                            <td class="spacer" width="30"></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <!-- END OF VERTICAL SPACER-->
                                                <!-- START OF VERTICAL SPACER-->
                                                <table class="table_scale" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b" align="center">
                                                    <tbody>
                                                        <tr>
                                                            <td width="100%" height="30">&nbsp;</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <!-- END OF VERTICAL SPACER-->
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <!-- END OF FOOTER BLOCK-->
            
            </body>
            
            </html>`,
      // Replace - [TeamName] [InvitationLink]
      invitationLink:
        '<body style="background-color: #FB6947;"> <div style="margin-top: 50px; margin: 0 auto; width: 630px;"> <div style="width: 630px; height: auto; float: left; margin-top: 125px;"> <div style="width: 630px; padding-top: 17px; text-align: center; height: 80px; background: none repeat scroll 0px 0px rgb(255, 188, 173); border-top-left-radius: 5px; border-top-right-radius: 5px;"> <img style="max-height:110px" src="https://i.imgur.com/JuBM9U5.png" alt="" /> </div> <!--Email content--> <div style="font-family: Tahoma; font-size: 14px; background-color: #fff; color: rgb(24, 24, 24); padding: 10px; float: left; width: 606px; border: 2px solid rgb(255, 255, 255); border-bottom-left-radius: 5px; border-bottom-right-radius: 5px;"> <div style="width: 610px; float: left; height: 35px;"> </div> <div style="width: 610px; height: auto; float: left;"> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> Hello , </div> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> Hello Invitation from the EMS, </div> </br> </br> <!--</br>--> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;">  Please click the link below to add the social acount. </div> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> <!-- Click <a href="%replink%"> here</a> to add account. </div></br></br>--> Click <a href="[InvitationLink]"> here</a> </div> </br></br> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> Hope you have a great time at Electronic Monitoring System.... :)</div> </br> <!--<div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> </div>--> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> Warm regards,</div> </br> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> Electronic Monitoring System Team</div> </div> <div style="width: 610px; float: left; height: 35px;"> </div> </div> <!--End Email content--> </div> </div> </body>',

      newInvitationLink: `<html xmlns="http://www.w3.org/1999/xhtml">

      <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0">
          <title>Socioboard Invitation</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet"> 
      </head>
      
      <body bgcolor="#f8f8f8">
      
          <!-- START OF HEADER BLOCK-->
      <table align="center" bgcolor="#fff" cellpadding="0" cellspacing="0" border="0"
              style="margin-top: 20px;">
              <tbody>
                  <tr>
                      <td valign="top" width="100%">
                          <table cellpadding="0" cellspacing="0" border="0">
                              <tbody>
                                  <tr>
                                      <td width="100%">
                          
                                          <table bgcolor="#fff" class="table_scale" width="600" align="center"
                                              cellpadding="0" cellspacing="0" border="0">
                                              <tbody>
                                                  <tr>
                                                      <td width="100%" height="30">&nbsp;</td>
                                                  </tr>
                                              </tbody>
                                          </table>
      
                                          <table class="table_scale" width="600" bgcolor="#fff" cellpadding="0"
                                              cellspacing="0" border="0">
                                              <tbody>
                                                  <tr>
                                                      <td width="100%">
                                                          <table width="600" cellpadding="0" cellspacing="0" border="0">
                                                              <tbody>
                                                                  <tr>
                                                                      <td class="spacer" width="30"></td>
                                                                      <td width="540">
                                   
                                                                          <table class="full" align="center" width="auto"
                                                                              cellpadding="0" cellspacing="0" border="0"
                                                                              style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td class="center" align="center"
                                                                                          style="padding: 0px; text-transform: uppercase; font-family: Lucida Sans Unicode; color:#666666; font-size:24px; line-height:34px;">
                                                                                          <span>
                                                                                              <a href="https://www.socioboard.com/"
                                                                                                  style="color:#0f48d5;" target="_blank">
                                                                                                  <img src="http://socioboard.com/wp-content/uploads/2021/07/0x0.png"
                                                                                                      alt="Socioboard"
                                                                                                      width="auto" height="80"
                                                                                                      border="0"
                                                                                                      style="display: inline;">
                                                                                              </a>
                                                                                          </span>
                                                                                      </td>
                                                                                  </tr>
                                                                              </tbody>
                                                                          </table>
                                  
                                                                      </td>
                                                                      <td class="spacer" width="30"></td>
                                                                  </tr>
                                                              </tbody>
                                                          </table>
                                                      </td>
                                                  </tr>
                                              </tbody>
                                          </table>
                                      </td>
                                  </tr>
                              </tbody>
                          </table>
                      </td>
                  </tr>
              </tbody>
          </table>
      
      
      <table align="center" bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" style="background: #fff;">
          <tbody>
              <tr>
                  <td valign="top" width="100%">
                  <table border="0" cellpadding="0" cellspacing="0">
                      <tbody>
                          <tr>
                              <td width="100%">
                              <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" class="table_scale" width="600">
                                  <tbody>
                                      <tr>
                                          <td width="100%">
                                          <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" width="600">
                                              <tbody>
                                                  <tr>
                                                      <td style="padding: 0px; background: #fff;" valign="middle" width="600">
                                                      <table align="center" border="0" cellpadding="0" cellspacing="0" class="full" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; " width="540">
                                                          <tbody>
                                                              <tr>
                                                                  <td align="center">
                                                                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                      <tbody>
                                                                          <tr>
                                                                              <td>
                                                                              <div style="height: 30px; line-height: 40px;"></div>
                                                                              </td>
                                                                          </tr>
                                                                          <tr>
                                                                               <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px; mso-line-height-rule: exactly; text-align: left; padding: 0 5px 12px;" align="left">
                                                                                   <b>Hi [accName],</b>
                                                                               </td>
                                                                          </tr>
                                                                          <tr>
                                                                              <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px;mso-line-height-rule: exactly; text-align: left; padding: 0 5px; padding-bottom:10px; " align="left">
                                                                                  <span>You have received this mail to add account <b>[userName]</b> of <b>[network]</b> to Socioboard System from <b>[sbuser]</b>
                                                                                  </span>
                                                                              </td>
                                                                          </tr>
                                                                          <tr>
                                                                              <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px;mso-line-height-rule: exactly; text-align: left; padding: 0 5px; padding-bottom:12px; " align="left">
                                                                                  <span>We request you to grant us access to the account by clicking on the <b>"Add Account"</b> button
                                                                                  </span>
                                                                              </td>
                                                                          </tr>
                                                                          <tr>
                                                                              <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px;mso-line-height-rule: exactly; text-align: left; padding: 0 5px; padding-bottom:30px; " align="left">
                                                                                  <span>Before proceeding please make sure your currently logged in [network] account of same account or try to open this account in the incognito mode
                                                                                  </span>
                                                                              </td>
                                                                          </tr>
                                                                          <tr>
                                                                              <td class="left"
                                                                                  style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px;mso-line-height-rule: exactly; text-align: left; padding: 0 5px; padding-bottom:30px; "
                                                                                  align="left">
                                                                                  <span>Once you click and approve in [network] it will add that logged in the account to Socioboard
                                                                                  </span>
                                                                              </td>
                                                                          </tr>
                                                                          <tr>
                                                                              <td class="center" style="margin: 0; padding-bottom:0px; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 16px; color: #e9e9e9; line-height: 25px;mso-line-height-rule: exactly; text-align: center;" align="center">
                                                                                  <a target="_blank" href="[invitationLink]" style="background: #f85c37; border: 0px; padding: 12px 20px; color: #fff; font-size: 18px; letter-spacing: 1px; margin-top: 14px; cursor: pointer; font-weight: 600; border-radius: 80px; text-decoration: none;">Add Account</a>
                                                                              </td>
                                                                          </tr>
                                                                          <tr>
                                                                              <td width="100%" height="50">&nbsp;</td>
                                                                          </tr>
                                                                          <tr>
                                                                              <td width="100%" height="20">&nbsp;</td>
                                                                          </tr>
                                                                      </tbody>
                                                                  </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                      </td>
                                                  </tr>
                                              </tbody>
                                          </table>
                                          </td>
                                      </tr>
                                  </tbody>
                              </table>
                              </td>
                          </tr>
                      </tbody>
                  </table>
                  </td>
              </tr>
          </tbody>
      </table>
      
      
      
      
          <!---FOOTER BLOCK-->
          <table align="center" bgcolor="#26272b" cellpadding="0" cellspacing="0" border="0">
              <tbody>
                  <tr>
                      <td valign="top" width="100%">
                          <table cellpadding="0" cellspacing="0" border="0">
                              <tbody>
                                  <tr>
                                      <td width="100%">
                          
                                          <table bgcolor="#26272b" class="table_scale" width="600" align="center"
                                              cellpadding="0" cellspacing="0" border="0">
                                              <tbody>
                                                  <tr>
                                                      <td width="100%" height="30">&nbsp;</td>
                                                  </tr>
                                              </tbody>
                                          </table>
      
                                          <table class="table_scale" width="600" bgcolor="#26272b" cellpadding="0"
                                              cellspacing="0" border="0">
                                              <tbody>
                                                  <tr>
                                                      <td width="100%">
                                                          <table width="600" cellpadding="0" cellspacing="0" border="0">
                                                              <tbody>
                                                                  <tr>
                                                                      <td class="spacer" width="30"></td>
                                                                      <td width="540">
                                   
                                                                          <table class="full" align="center" width="auto"
                                                                              cellpadding="0" cellspacing="0" border="0"
                                                                              style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td class="center" align="center"
                                                                                          style="padding: 0px; text-transform: uppercase; font-family: Lucida Sans Unicode; color:#666666; font-size:24px; line-height:0; padding-bottom: 0px;">
                                                                                          <span>
                                                                                              <a href="https://www.socioboard.com/"
                                                                                                  style="color:#0f48d5;"  target="_blank">
                                                                                                  <img src="http://socioboard.com/wp-content/uploads/2021/07/socioboard-logo-white.png"
                                                                                                      alt="Socioboard"
                                                                                                      width="auto" height="42"
                                                                                                      border="0"
                                                                                                      style="display: inline;">
                                                                                              </a>
                                                                                          </span>
                                                                                      </td>
                                                                                  </tr>
                                                                                   <tr>
                                                                                      <td width="100%" height="30">&nbsp;</td>
                                                                                  </tr>
      
                                                                              </tbody>
                                                                          </table>
                                  
                                                                      </td>
                                                                      <td class="spacer" width="30"></td>
                                                                  </tr>
                                                              </tbody>
                                                          </table>
                                                      </td>
                                                  </tr>
                                              </tbody>
                                          </table>
                                      </td>
                                  </tr>
                              </tbody>
                          </table>
                      </td>
                  </tr>
              </tbody>
          </table>
          <table align="center" bgcolor="#26272b" cellpadding="0" cellspacing="0" border="0"
              style="">
              <tbody>
                  <tr>
                      <td valign="top" width="100%" style="background: #26272b;">
                          <table cellpadding="0" cellspacing="0" border="0">
                              <tbody>
                                  <tr>
                                      <td width="100%">
                                          <table class="table_scale"  width="600" bgcolor="#26272b" cellpadding="0"
                                              cellspacing="0" border="0">
                                              <tbody>
                                                  <tr>
                                                      <td width="100%">
                                                          <table width="600" cellpadding="0" cellspacing="0" border="0">
                                                              <tbody>
                                                                  <tr>
                                                                      <td class="spacer" width="30"></td>
                                                                      <td width="540">
                                                                          <!-- START OF RIGHT COLUMN FOR SOCIAL ICONS-->
                                                                          <table class="full" align="center" width="auto"
                                                                              cellpadding="0" cellspacing="0" border="0"
                                                                              style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td class="center" align="center"
                                                                                          style="margin: 0; font-size:14px ; color:#aaaaaa; font-family: Helvetica, Arial, sans-serif; line-height: 100%; padding-bottom: 30px;">
                                                                                          <span>
                                                                                              <a href="https://www.facebook.com/SocioBoard"
                                                                                                  target="_blank" style="padding-right: 28px; text-decoration: none;">
                                                                                                  <img src="http://socioboard.com/wp-content/uploads/2021/07/mail-fb-icon.png"
                                                                                                      style="width: 30px;" alt="facebook">
                                                                                              </a> &nbsp;
                                                                                              <a href="https://twitter.com/Socioboard"
                                                                                                  target="_blank" style="padding-right: 28px; text-decoration: none;">
                                                                                                  <img src="http://socioboard.com/wp-content/uploads/2021/07/mail-tw-icon.png"
                                                                                                      style="width: 30px;" alt="twitter">
                                                                                              </a> &nbsp;
                                                                                              <a href="https://www.linkedin.com/company/socioboard-technologies-private-limited"
                                                                                                  target="_blank" style=" text-decoration: none;">
                                                                                                  <img src="http://socioboard.com/wp-content/uploads/2021/07/mail-in-icon.png"
                                                                                                      style="width: 30px;" alt="linkedin">
                                                                                              </a>
                                                                                          </span>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                    <td colspan="3">
                                                                                      <table width="auto" cellspacing="0" cellpadding="0" align="center">
                                                                                        <tbody><tr>
                                                                                          <th>
                                                                                            <a href="https://socioboard.org/privacy-policy/" style="color:#bdbdbd; font-family: Open sans, Arial, Helvetica, sans-serif; font-size:14px;font-weight:400;line-height:15px; text-decoration: none;" target="_blank">Privacy Policy</a>
                                                                                          </th>
                                                                                          <th width="10px" style="border-right: 1px solid #bdbdbd;"></th>
                                                                                          <th width="10px"></th>
                                                                                          <th>
                                                                                            <a href="https://www.socioboard.com/" style="color:#bdbdbd;font-family: Open sans, Arial, Helvetica, sans-serif; font-size:14px;font-weight:400; line-height:15px; text-decoration: none;" target="_blank">socioboard.com</a>
                                                                                          </th>
                                                                                          <th width="10px" style="border-right: 1px solid #bdbdbd;"></th>
                                                                                          <th width="10px"></th>
                                                                                          <th>
                                                                                            <a href="{{{unsubscribe}}}" style="color:#bdbdbd; font-family: Open sans, Arial, Helvetica, sans-serif; font-size:14px;font-weight:400;line-height:15px; text-decoration: none;">Unsubscribe</a>
                                                                                          </th>
                                                                                        </tr>
                                                                                      </tbody></table>
                                                                                    </td>
                                                                                  </tr>
                                                                              </tbody>
                                                                          </table>
                                                                          <!-- END OF RIGHT COLUMN FOR SOCIAL ICONS-->
                                                                      </td>
                                                                      <td class="spacer" width="30"></td>
                                                                  </tr>
                                                              </tbody>
                                                          </table>
                                                      </td>
                                                  </tr>
                                              </tbody>
                                          </table>
                                          <!-- START OF VERTICAL SPACER-->
                                          <table bgcolor="#26272b" class="table_scale" width="600" align="center"
                                              cellpadding="0" cellspacing="0" border="0">
                                              <tbody>
                                                  <tr>
                                                      <td width="100%" height="30">&nbsp;</td>
                                                  </tr>
                                              </tbody>
                                          </table>
                                          <!-- END OF VERTICAL SPACER-->
                                      </td>
                                  </tr>
                              </tbody>
                          </table>
                      </td>
                  </tr>
              </tbody>
          </table>
          <table cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b" align="center">
              <tbody>
                  <tr>
                      <td width="100%" valign="top">
                          <table cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b">
                              <tbody>
                                  <tr>
                                      <td width="100%">
      
                                          <table class="table_scale" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b" align="center">
                                              <tbody>
                                                  <tr>
                                                      <td width="100%">
                                                          <table width="600" cellspacing="0" cellpadding="0" border="0">
                                                              <tbody>
                                                                  <tr>
                                                                      <td class="spacer" width="30"></td>
                                                                      <td width="540">
                                                                          <!-- START OF LEFT COLUMN FOR HEADING-->
                                                                          <table class="full" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;" width="500" cellspacing="0" cellpadding="0" border="0" align="center">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td style="margin: 0; font-size:13px ; color:#bdbdbd; font-family: Open sans, Arial, Helvetica, sans-serif; line-height: 18px; text-align: center;" width="100%" height="20">
                                                                                          Copyright © 2014 - 2021 Socioboard. All Rights Reserved.</td>
                                                                                  </tr>
                                                                              </tbody>
                                                                          </table>
                                                                          <!-- END OF LEFT COLUMN FOR HEADING-->
                                                                      </td>
                                                                      <td class="spacer" width="30"></td>
                                                                  </tr>
                                                              </tbody>
                                                          </table>
                                                      </td>
                                                  </tr>
                                              </tbody>
                                          </table>
                                          <!-- END OF VERTICAL SPACER-->
                                          <!-- START OF VERTICAL SPACER-->
                                          <table class="table_scale" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b" align="center">
                                              <tbody>
                                                  <tr>
                                                      <td width="100%" height="30">&nbsp;</td>
                                                  </tr>
                                              </tbody>
                                          </table>
                                          <!-- END OF VERTICAL SPACER-->
                                      </td>
                                  </tr>
                              </tbody>
                          </table>
                      </td>
                  </tr>
              </tbody>
          </table>
          <!-- END OF FOOTER BLOCK-->
      
      </body>
      
      </html>`,

      welcomeMailLink: `<html xmlns="http://www.w3.org/1999/xhtml">

             <head>
                 <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                 <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0">
                 <title>Socioboard</title>
                 <link rel="preconnect" href="https://fonts.googleapis.com">
                 <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                 <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet"> 
             </head>
             
             <body bgcolor="#f8f8f8">
             
                 <!-- START OF HEADER BLOCK-->
             <table align="center" bgcolor="#fff" cellpadding="0" cellspacing="0" border="0"
                     style="margin-top: 20px;">
                     <tbody>
                         <tr>
                             <td valign="top" width="100%">
                                 <table cellpadding="0" cellspacing="0" border="0">
                                     <tbody>
                                         <tr>
                                             <td width="100%">
                                 
                                                 <table bgcolor="#fff" class="table_scale" width="600" align="center"
                                                     cellpadding="0" cellspacing="0" border="0">
                                                     <tbody>
                                                         <tr>
                                                             <td width="100%" height="30">&nbsp;</td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
             
                                                 <table class="table_scale" width="600" bgcolor="#fff" cellpadding="0"
                                                     cellspacing="0" border="0">
                                                     <tbody>
                                                         <tr>
                                                             <td width="100%">
                                                                 <table width="600" cellpadding="0" cellspacing="0" border="0">
                                                                     <tbody>
                                                                         <tr>
                                                                             <td class="spacer" width="30"></td>
                                                                             <td width="540">
                                          
                                                                                 <table class="full" align="center" width="auto"
                                                                                     cellpadding="0" cellspacing="0" border="0"
                                                                                     style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                                                                                     <tbody>
                                                                                         <tr>
                                                                                             <td class="center" align="center"
                                                                                                 style="padding: 0px; text-transform: uppercase; font-family: Lucida Sans Unicode; color:#666666; font-size:24px; line-height:34px;">
                                                                                                 <span>
                                                                                                     <a href="https://www.socioboard.com/"
                                                                                                         style="color:#0f48d5;" target="_blank">
                                                                                                         <img src="http://socioboard.com/wp-content/uploads/2021/07/0x0.png"
                                                                                                             alt="Socioboard"
                                                                                                             width="auto" height="80"
                                                                                                             border="0"
                                                                                                             style="display: inline;">
                                                                                                     </a>
                                                                                                 </span>
                                                                                             </td>
                                                                                         </tr>
                                                                                     </tbody>
                                                                                 </table>
                                         
                                                                             </td>
                                                                             <td class="spacer" width="30"></td>
                                                                         </tr>
                                                                     </tbody>
                                                                 </table>
                                                             </td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
                                             </td>
                                         </tr>
                                     </tbody>
                                 </table>
                             </td>
                         </tr>
                     </tbody>
                 </table>
                 <table align="center" bgcolor="#fff" cellpadding="0" cellspacing="0" border="0">
                     <tbody>
                         <tr> 
                             <td valign="top" width="100%">
                                 <table cellpadding="0" cellspacing="0" border="0">
                                     <tbody>
                                         <tr>
                                             <td width="100%">
                                                 <table class="table_scale" width="600" bgcolor="#fff" cellpadding="0"
                                                     cellspacing="0" border="0">
                                                     <tbody>
                                                         <tr>
                                                             <td width="100%">
                                                                 <table width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#fff">
                                                                     <tbody>
                                                                         <tr>
                                                                             <td>
                                                                                 <div style="height: 20px; line-height: 40px;"></div>
                                                                             </td>
                                                                         </tr>
                                                                         <tr>
                                                                             <td style="padding: 0px;" width="600" valign="middle">
                                                                                 <a href="#">
                                                                                 <img alt="Welcome" src="http://socioboard.com/wp-content/uploads/2021/07/welcomemail-1.png" style="width: 100%; display:block;">
                                                                                 </a>
                                                                             </td>
                                                                         </tr>
                                                                     </tbody>
                                                                 </table>
             
                                                             </td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
                                             </td>
                                         </tr>
                                     </tbody>
                                 </table>
                             </td>
                         </tr>
                     </tbody>
                 </table>
             
             <table align="center" bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" style="background: #fff;">
                 <tbody>
                     <tr>
                         <td valign="top" width="100%">
                         <table border="0" cellpadding="0" cellspacing="0">
                             <tbody>
                                 <tr>
                                     <td width="100%">
                                     <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" class="table_scale" width="600">
                                         <tbody>
                                             <tr>
                                                 <td width="100%">
                                                 <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" width="600">
                                                     <tbody>
                                                         <tr>
                                                             <td style="padding: 0px; background: #fff;" valign="middle" width="600">
                                                             <table align="center" border="0" cellpadding="0" cellspacing="0" class="full" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; " width="540">
                                                                 <tbody>
                                                                     <tr>
                                                                         <td align="center">
                                                                         <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                             <tbody>
                                                                                 <tr>
                                                                                     <td>
                                                                                     <div style="height: 30px; line-height: 40px;"></div>
                                                                                     </td>
                                                                                 </tr>
                                                                                 <tr>
                                                                                      <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px; mso-line-height-rule: exactly; text-align: left; padding: 0 5px 12px;" align="left">
                                                                                          <b>Hi [FirstName],</b>
                                                                                      </td>
                                                                                 </tr>
                                                                                 <tr>
                                                                                     <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px;mso-line-height-rule: exactly; text-align: left; padding: 0 5px; padding-bottom:10px; " align="left">
                                                                                         <span>Welcome to Socioboard! We’re happy to have you here. 
                                                                                         </span>
                                                                                     </td>
                                                                                 </tr>
                                                                                 <tr>
                                                                                     <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px;mso-line-height-rule: exactly; text-align: left; padding: 0 5px; padding-bottom:12px; " align="left">
                                                                                         <span>By signing up, you have taken your first step towards building a better social media presence. We'll take the lead on your behalf for branding while you focus your time and energy on building better products!
                                                                                         </span>
                                                                                     </td>
                                                                                 </tr>
                                                                                 <tr>
                                                                                     <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px;mso-line-height-rule: exactly; text-align: left; padding: 0 5px; padding-bottom:30px; " align="left">
                                                                                         <span>Ready to save your time with automation? Hit the button below to start building your perfect workflow.
                                                                                         </span>
                                                                                     </td>
                                                                                 </tr>
                                                                                 <tr>
                                                                                     <td class="center" style="margin: 0; padding-bottom:0px; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 16px; color: #e9e9e9; line-height: 25px;mso-line-height-rule: exactly; text-align: center;" align="center">
                                                                                         <a target="_blank" href="https://appv5.socioboard.com/login" style="background: #f85c37; border: 0px; padding: 12px 20px; color: #fff; font-size: 18px; letter-spacing: 1px; margin-top: 14px; cursor: pointer; font-weight: 600; border-radius: 80px; text-decoration: none;">Start Scheduling</a>
                                                                                     </td>
                                                                                 </tr>
                                                                                 <tr>
                                                                                     <td width="100%" height="50">&nbsp;</td>
                                                                                 </tr>
                                                                                 <tr>
                                                                                      <td class="center" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 19px; color: #383737; line-height: 32px; mso-line-height-rule: exactly; text-align: center; padding: 0 5px 12px;" align="center">
                                                                                          <b>We encourage you to explore our new features.<br>
                                                                                          Our dashboard will help you to :</b>
                                                                                      </td>
                                                                                 </tr>
                                                                                 <tr>
                                                                                     <td width="100%" height="20">&nbsp;</td>
                                                                                 </tr>
                                                                             </tbody>
                                                                         </table>
                                                                         </td>
                                                                     </tr>
                                                                 </tbody>
                                                             </table>
                                                             </td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
                                                 </td>
                                             </tr>
                                         </tbody>
                                     </table>
                                     </td>
                                 </tr>
                             </tbody>
                         </table>
                         </td>
                     </tr>
                 </tbody>
             </table>
             
             <table style="background: #fff;" cellspacing="0" cellpadding="0" border="0" bgcolor="#fff" align="center">
                     <tbody>
                         <tr>
                             <td width="100%" valign="top">
                                 <table cellspacing="0" cellpadding="0" border="0">
                                     <tbody>
                                         <tr>
                                             <td width="100%">
                                                 <table class="table_scale" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#fff">
                                                     <tbody>
                                                         <tr>
                                                             <td width="100%">
                                                                 <table width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#fff">
                                                                     <tbody>
                                                                         <tr>
                                                                             <td style="padding: 0px; background: #fff; " width="600" valign="middle">
                                                                                 <table class="full" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; " width="540" cellspacing="0" cellpadding="0" border="0" align="center">
                                                                                     <tbody>
                                                                                         <tr>
                                                                                             <td style="" bgcolor="" align="center">
                                                                                                 <table width="100%" cellspacing="0" cellpadding="0" border="0">
                                                                                                     <tbody>
             
                                                                                                     <tr>
                                                                                                         <td align="center">
                                                                                                             <!-- padding -->
                                                                                                             <div class="mob_100" style="float: left; display: inline-block; width: 260px; ">
                                                                                                                 <table class="mob_100" style="border-collapse: collapse;" width="100%" cellspacing="0" cellpadding="0" border="0" align="left">
                                                                                                                 <tbody>
                                                                                                                 <tr>
                                                                                                                     <td style="text-align:center; padding-bottom: 20px;">
                                                                                                                         <img src="http://socioboard.com/wp-content/uploads/2021/07/engage-icon.png" alt="Attendance Management"  style="width: 100px; text-align: center; background: #f3f3f3; border-radius: 100px; padding: 13px;">
                                                                                                                     </td>
                                                                                                                 </tr>
                                                                                                                 <tr>
                                                                                                                     <td>
                                                                                                                         <h3 style="font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 19px; text-align: center; color: #f85c37; line-height: 25px; margin-bottom: 3px; margin-top: 0;">Attendance Management</h3>
                                                                                                                     </td>
                                                                                                                 </tr>
                                                                                                                 <tr>
                                                                                                                     <td class="center" style="margin: 0; padding-bottom:0px; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 16px; color: #383737; line-height: 21px;mso-line-height-rule: exactly; text-align: center" align="center">
                                                                                                                         <span>with profiles to develop brand loyalty and build trust
                                                                                                                         </span>
                                                                                                                     </td>
                                                                                                                 </tr>
                                                                                                                 <tr>
                                                                                                                     <td width="100%" height="30">&nbsp;</td>
                                                                                                                 </tr>
             
                                                                                                                 </tbody></table>
                                                                                                             </div>
             
                                                                                                             <div class="mob_100" style="float: left; display: inline-block; width: 20px;">
                                                                                                                 <table class="mob_100" style="border-collapse: collapse;" width="100%" cellspacing="0" cellpadding="0" border="0" align="left">
                                                                                                                     <tbody><tr>
                                                                                                                         <td>
                                                                                                                             &nbsp;
                                                                                                                         </td>
                                                                                                                     </tr>
                                                                                                                 </tbody></table>
                                                                                                             </div>
                                                                                                             <div class="mob_100" style="float: right; display: inline-block; width: 260px; ">
                                                                                                                 <table class="mob_100" style="border-collapse: collapse;" width="100%" cellspacing="0" cellpadding="0" border="0" align="left">
                                                                                                                 <tbody>
                                                                                                                 <tr>
                                                                                                                     <td style="text-align:center; padding-bottom: 20px;">
                                                                                                                         <img src="http://socioboard.com/wp-content/uploads/2021/07/schedule-icon.png" alt="Schedule" style="width: 100px; text-align: center; background: #f3f3f3; border-radius: 100px; padding: 13px;">
                                                                                                                     </td>
                                                                                                                 </tr>
                                                                                                                 <tr>
                                                                                                                     <td>
                                                                                                                         <h3 style="font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 19px; text-align: center; color: #f85c37; line-height: 25px; margin-bottom: 3px; margin-top: 0;">Schedule</h3>
                                                                                                                     </td>
                                                                                                                 </tr>
                                                                                                                 <tr>
                                                                                                                     <td class="center" style="margin: 0; padding-bottom:0px; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 16px; color: #383737; line-height: 21px;mso-line-height-rule: exactly; text-align: center" align="center">
                                                                                                                         <span>and publish content on autopilot without any hassle
                                                                                                                         </span>
                                                                                                                     </td>
                                                                                                                 </tr>
                                                                                                                 <tr>
                                                                                                                     <td width="100%" height="30">&nbsp;</td>
                                                                                                                 </tr>
             
                                                                                                                 </tbody></table>
                                                                                                             </div>
                                                                                                             
                                                                                                         </td>
                                                                                                     </tr>
                                                                                                     
                                                                                                    
                                                                                                 </tbody></table>
                                                                                             </td>
                                                                                         </tr>
                                                                                     </tbody>
                                                                                 </table>
             
                                                                             </td>
                                                                         </tr>
                                                                         <!--[if gte mso 9]> </v:textbox> </v:rect> <![endif]-->
                                                                     </tbody>
                                                                 </table>
                                                             </td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
                                             </td>
                                         </tr>
                                     </tbody>
                                 </table>
                             </td>
                         </tr>
                     </tbody>
             </table>
             <table style="background: #fff;" cellspacing="0" cellpadding="0" border="0" bgcolor="#fff" align="center">
                     <tbody>
                         <tr>
                             <td width="100%" valign="top">
                                 <table cellspacing="0" cellpadding="0" border="0">
                                     <tbody>
                                         <tr>
                                             <td width="100%">
                                                 <table class="table_scale" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#fff">
                                                     <tbody>
                                                         <tr>
                                                             <td width="100%">
                                                                 <table width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#fff">
                                                                     <tbody>
                                                                         <tr>
                                                                             <td style="padding: 0px; background: #fff; " width="600" valign="middle">
                                                                                 <table class="full" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; " width="540" cellspacing="0" cellpadding="0" border="0" align="center">
                                                                                     <tbody>
                                                                                         <tr>
                                                                                             <td style="" bgcolor="" align="center">
                                                                                                 <table width="100%" cellspacing="0" cellpadding="0" border="0">
                                                                                                     <tbody>
             
                                                                                                     <tr>
                                                                                                         <td align="center">
                                                                                                             <!-- padding -->
                                                                                                             <div class="mob_100" style="float: left; display: inline-block; width: 260px; ">
                                                                                                                 <table class="mob_100" style="border-collapse: collapse;" width="100%" cellspacing="0" cellpadding="0" border="0" align="left">
                                                                                                                 <tbody>
                                                                                                                 <tr>
                                                                                                                     <td style="text-align:center; padding-bottom: 20px;">
                                                                                                                         <img src="http://socioboard.com/wp-content/uploads/2021/07/collaborate-icon.png" alt="Collaborate" style="width: 100px; text-align: center; background: #f3f3f3; border-radius: 100px; padding: 13px;">
                                                                                                                     </td>
                                                                                                                 </tr>
                                                                                                                 <tr>
                                                                                                                     <td>
                                                                                                                         <h3 style="font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 19px; text-align: center; color: #f85c37; line-height: 25px; margin-bottom: 3px; margin-top: 0;">Collaborate</h3>
                                                                                                                     </td>
                                                                                                                 </tr>
                                                                                                                 <tr>
                                                                                                                     <td class="center" style="margin: 0; padding-bottom:0px; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 16px; color: #383737; line-height: 21px;mso-line-height-rule: exactly; text-align: center" align="center">
                                                                                                                         <span>with users over multiple social media networks
                                                                                                                         </span>
                                                                                                                     </td>
                                                                                                                 </tr>
                                                                                                                 <tr>
                                                                                                                     <td width="100%" height="30">&nbsp;</td>
                                                                                                                 </tr>
             
                                                                                                                 </tbody></table>
                                                                                                             </div>
             
                                                                                                             <div class="mob_100" style="float: left; display: inline-block; width: 20px;">
                                                                                                                 <table class="mob_100" style="border-collapse: collapse;" width="100%" cellspacing="0" cellpadding="0" border="0" align="left">
                                                                                                                     <tbody><tr>
                                                                                                                         <td>
                                                                                                                             &nbsp;
                                                                                                                         </td>
                                                                                                                     </tr>
                                                                                                                 </tbody></table>
                                                                                                             </div>
                                                                                                             <div class="mob_100" style="float: right; display: inline-block; width: 260px; ">
                                                                                                                 <table class="mob_100" style="border-collapse: collapse;" width="100%" cellspacing="0" cellpadding="0" border="0" align="left">
                                                                                                                 <tbody>
                                                                                                                 <tr>
                                                                                                                     <td style="text-align:center; padding-bottom: 20px;">
                                                                                                                         <img src="http://socioboard.com/wp-content/uploads/2021/07/analyze-icon.png" alt="Analyze" style="width: 100px; text-align: center; background: #f3f3f3; border-radius: 100px; padding: 13px;">
                                                                                                                     </td>
                                                                                                                 </tr>
                                                                                                                 <tr>
                                                                                                                     <td>
                                                                                                                         <h3 style="font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 19px; text-align: center; color: #f85c37; line-height: 25px; margin-bottom: 3px; margin-top: 0;">Analyze</h3>
                                                                                                                     </td>
                                                                                                                 </tr>
                                                                                                                 <tr>
                                                                                                                     <td class="center" style="margin: 0; padding-bottom:0px; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 16px; color: #383737; line-height: 21px;mso-line-height-rule: exactly; text-align: center" align="center">
                                                                                                                         <span>your performance. Measure and track results
                                                                                                                         </span>
                                                                                                                     </td>
                                                                                                                 </tr>
                                                                                                                 <tr>
                                                                                                                     <td width="100%" height="30">&nbsp;</td>
                                                                                                                 </tr>
             
                                                                                                                 </tbody></table>
                                                                                                             </div>
                                                                                                             
                                                                                                         </td>
                                                                                                     </tr>
                                                                                                     
                                                                                                    
                                                                                                 </tbody></table>
                                                                                             </td>
                                                                                         </tr>
                                                                                     </tbody>
                                                                                 </table>
             
                                                                             </td>
                                                                         </tr>
                                                                         <!--[if gte mso 9]> </v:textbox> </v:rect> <![endif]-->
                                                                     </tbody>
                                                                 </table>
                                                             </td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
                                             </td>
                                         </tr>
                                     </tbody>
                                 </table>
                             </td>
                         </tr>
                     </tbody>
             </table>
             
             <table align="center" bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" style="background: #fff;">
                 <tbody>
                     <tr>
                         <td valign="top" width="100%">
                         <table border="0" cellpadding="0" cellspacing="0">
                             <tbody>
                                 <tr>
                                     <td width="100%">
                                     <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" class="table_scale" width="600">
                                         <tbody>
                                             <tr>
                                                 <td width="100%">
                                                 <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" width="600">
                                                     <tbody>
                                                         <tr>
                                                             <td style="padding: 0px; background: #fff;" valign="middle" width="600">
                                                             <table align="center" border="0" cellpadding="0" cellspacing="0" class="full" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; " width="540">
                                                                 <tbody>
                                                                     <tr>
                                                                         <td align="center">
                                                                         <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                             <tbody>
                                                                                 <tr>
                                                                                     <td width="100%" height="40">&nbsp;</td>
                                                                                 </tr>
                                                                                 <tr>
                                                                                      <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 19px; color: #383737; line-height: 32px; mso-line-height-rule: exactly; text-align: center; padding: 0 5px 12px;" align="center">
                                                                                          <b>Have a query? <a href="skype:socioboard.support?chat" target="_blank" style="color: #f85c37; text-decoration: none;">Drop us a Hi!</a>
                                                                                          </b>
                                                                                      </td>
                                                                                 </tr>
                                                                                 <tr>
                                                                                     <td width="100%" height="30">&nbsp;</td>
                                                                                 </tr>
                                                                                 <tr>
                                                                                     <td class="center" style="margin: 0; padding-bottom:12px; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 25px;mso-line-height-rule: exactly;" align="center">
                                                                                         <span>
                                                                                             Regards,<br>
                                                                                             <b>Team Socioboard</b> 
                                                                                         </span>
                                                                                     </td>
                                                                                 </tr>
                                                                                 <tr>
                                                                                     <td width="100%" height="40">&nbsp;</td>
                                                                                 </tr>
                                                                             </tbody>
                                                                         </table>
                                                                         </td>
                                                                     </tr>
                                                                 </tbody>
                                                             </table>
                                                             </td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
                                                 </td>
                                             </tr>
                                         </tbody>
                                     </table>
                                     </td>
                                 </tr>
                             </tbody>
                         </table>
                         </td>
                     </tr>
                 </tbody>
             </table>
             
                 <!---FOOTER BLOCK-->
                 <table align="center" bgcolor="#26272b" cellpadding="0" cellspacing="0" border="0">
                     <tbody>
                         <tr>
                             <td valign="top" width="100%">
                                 <table cellpadding="0" cellspacing="0" border="0">
                                     <tbody>
                                         <tr>
                                             <td width="100%">
                                 
                                                 <table bgcolor="#26272b" class="table_scale" width="600" align="center"
                                                     cellpadding="0" cellspacing="0" border="0">
                                                     <tbody>
                                                         <tr>
                                                             <td width="100%" height="30">&nbsp;</td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
             
                                                 <table class="table_scale" width="600" bgcolor="#26272b" cellpadding="0"
                                                     cellspacing="0" border="0">
                                                     <tbody>
                                                         <tr>
                                                             <td width="100%">
                                                                 <table width="600" cellpadding="0" cellspacing="0" border="0">
                                                                     <tbody>
                                                                         <tr>
                                                                             <td class="spacer" width="30"></td>
                                                                             <td width="540">
                                          
                                                                                 <table class="full" align="center" width="auto"
                                                                                     cellpadding="0" cellspacing="0" border="0"
                                                                                     style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                                                                                     <tbody>
                                                                                         <tr>
                                                                                             <td class="center" align="center"
                                                                                                 style="padding: 0px; text-transform: uppercase; font-family: Lucida Sans Unicode; color:#666666; font-size:24px; line-height:0; padding-bottom: 0px;">
                                                                                                 <span>
                                                                                                     <a href="https://www.socioboard.com/"
                                                                                                         style="color:#0f48d5;"  target="_blank">
                                                                                                         <img src="http://socioboard.com/wp-content/uploads/2021/07/socioboard-logo-white.png"
                                                                                                             alt="Socioboard"
                                                                                                             width="auto" height="42"
                                                                                                             border="0"
                                                                                                             style="display: inline;">
                                                                                                     </a>
                                                                                                 </span>
                                                                                             </td>
                                                                                         </tr>
                                                                                          <tr>
                                                                                             <td width="100%" height="30">&nbsp;</td>
                                                                                         </tr>
             
                                                                                     </tbody>
                                                                                 </table>
                                         
                                                                             </td>
                                                                             <td class="spacer" width="30"></td>
                                                                         </tr>
                                                                     </tbody>
                                                                 </table>
                                                             </td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
                                             </td>
                                         </tr>
                                     </tbody>
                                 </table>
                             </td>
                         </tr>
                     </tbody>
                 </table>
                 <table align="center" bgcolor="#26272b" cellpadding="0" cellspacing="0" border="0"
                     style="">
                     <tbody>
                         <tr>
                             <td valign="top" width="100%" style="background: #26272b;">
                                 <table cellpadding="0" cellspacing="0" border="0">
                                     <tbody>
                                         <tr>
                                             <td width="100%">
                                                 <table class="table_scale"  width="600" bgcolor="#26272b" cellpadding="0"
                                                     cellspacing="0" border="0">
                                                     <tbody>
                                                         <tr>
                                                             <td width="100%">
                                                                 <table width="600" cellpadding="0" cellspacing="0" border="0">
                                                                     <tbody>
                                                                         <tr>
                                                                             <td class="spacer" width="30"></td>
                                                                             <td width="540">
                                                                                 <!-- START OF RIGHT COLUMN FOR SOCIAL ICONS-->
                                                                                 <table class="full" align="center" width="auto"
                                                                                     cellpadding="0" cellspacing="0" border="0"
                                                                                     style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                                                                                     <tbody>
                                                                                         <tr>
                                                                                             <td class="center" align="center"
                                                                                                 style="margin: 0; font-size:14px ; color:#aaaaaa; font-family: Helvetica, Arial, sans-serif; line-height: 100%; padding-bottom: 30px;">
                                                                                                 <span>
                                                                                                     <a href="https://www.facebook.com/SocioBoard"
                                                                                                         target="_blank" style="padding-right: 28px; text-decoration: none;">
                                                                                                         <img src="http://socioboard.com/wp-content/uploads/2021/07/mail-fb-icon.png"
                                                                                                             style="width: 30px;" alt="facebook">
                                                                                                     </a> &nbsp;
                                                                                                     <a href="https://twitter.com/Socioboard"
                                                                                                         target="_blank" style="padding-right: 28px; text-decoration: none;">
                                                                                                         <img src="http://socioboard.com/wp-content/uploads/2021/07/mail-tw-icon.png"
                                                                                                             style="width: 30px;" alt="twitter">
                                                                                                     </a> &nbsp;
                                                                                                     <a href="https://www.linkedin.com/company/socioboard-technologies-private-limited"
                                                                                                         target="_blank" style=" text-decoration: none;">
                                                                                                         <img src="http://socioboard.com/wp-content/uploads/2021/07/mail-in-icon.png"
                                                                                                             style="width: 30px;" alt="linkedin">
                                                                                                     </a>
                                                                                                 </span>
                                                                                             </td>
                                                                                         </tr>
                                                                                         <tr>
                                                                                           <td colspan="3">
                                                                                             <table width="auto" cellspacing="0" cellpadding="0" align="center">
                                                                                               <tbody><tr>
                                                                                                 <th>
                                                                                                   <a href="https://socioboard.org/privacy-policy/" style="color:#bdbdbd; font-family: Open sans, Arial, Helvetica, sans-serif; font-size:14px;font-weight:400;line-height:15px; text-decoration: none;" target="_blank">Privacy Policy</a>
                                                                                                 </th>
                                                                                                 <th width="10px" style="border-right: 1px solid #bdbdbd;"></th>
                                                                                                 <th width="10px"></th>
                                                                                                 <th>
                                                                                                   <a href="https://www.socioboard.com/" style="color:#bdbdbd;font-family: Open sans, Arial, Helvetica, sans-serif; font-size:14px;font-weight:400; line-height:15px; text-decoration: none;" target="_blank">socioboard.com</a>
                                                                                                 </th>
                                                                                             </tbody></table>
                                                                                           </td>
                                                                                         </tr>
                                                                                     </tbody>
                                                                                 </table>
                                                                                 <!-- END OF RIGHT COLUMN FOR SOCIAL ICONS-->
                                                                             </td>
                                                                             <td class="spacer" width="30"></td>
                                                                         </tr>
                                                                     </tbody>
                                                                 </table>
                                                             </td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
                                                 <!-- START OF VERTICAL SPACER-->
                                                 <table bgcolor="#26272b" class="table_scale" width="600" align="center"
                                                     cellpadding="0" cellspacing="0" border="0">
                                                     <tbody>
                                                         <tr>
                                                             <td width="100%" height="30">&nbsp;</td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
                                                 <!-- END OF VERTICAL SPACER-->
                                             </td>
                                         </tr>
                                     </tbody>
                                 </table>
                             </td>
                         </tr>
                     </tbody>
                 </table>
                 <table cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b" align="center">
                     <tbody>
                         <tr>
                             <td width="100%" valign="top">
                                 <table cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b">
                                     <tbody>
                                         <tr>
                                             <td width="100%">
             
                                                 <table class="table_scale" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b" align="center">
                                                     <tbody>
                                                         <tr>
                                                             <td width="100%">
                                                                 <table width="600" cellspacing="0" cellpadding="0" border="0">
                                                                     <tbody>
                                                                         <tr>
                                                                             <td class="spacer" width="30"></td>
                                                                             <td width="540">
                                                                                 <!-- START OF LEFT COLUMN FOR HEADING-->
                                                                                 <table class="full" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;" width="500" cellspacing="0" cellpadding="0" border="0" align="center">
                                                                                     <tbody>
                                                                                         <tr>
                                                                                             <td style="margin: 0; font-size:13px ; color:#bdbdbd; font-family: Open sans, Arial, Helvetica, sans-serif; line-height: 18px; text-align: center;" width="100%" height="20">
                                                                                                 Copyright © 2014 - 2021 Socioboard. All Rights Reserved.</td>
                                                                                         </tr>
                                                                                     </tbody>
                                                                                 </table>
                                                                                 <!-- END OF LEFT COLUMN FOR HEADING-->
                                                                             </td>
                                                                             <td class="spacer" width="30"></td>
                                                                         </tr>
                                                                     </tbody>
                                                                 </table>
                                                             </td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
                                                 <!-- END OF VERTICAL SPACER-->
                                                 <!-- START OF VERTICAL SPACER-->
                                                 <table class="table_scale" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b" align="center">
                                                     <tbody>
                                                         <tr>
                                                             <td width="100%" height="30">&nbsp;</td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
                                                 <!-- END OF VERTICAL SPACER-->
                                             </td>
                                         </tr>
                                     </tbody>
                                 </table>
                             </td>
                         </tr>
                     </tbody>
                 </table>
                 <!-- END OF FOOTER BLOCK-->
             
             </body>
             
             </html>`,

      deleteUserLink: `<html xmlns="http://www.w3.org/1999/xhtml">

             <head>
                 <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                 <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0">
                 <title>Socioboard</title>
                 <link rel="preconnect" href="https://fonts.googleapis.com">
                 <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                 <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet"> 
             </head>
             
             <body bgcolor="#f8f8f8">
             
                 <!-- START OF HEADER BLOCK-->
                 <table align="center" bgcolor="#fff" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px;">
                     <tbody>
                         <tr>
                             <td valign="top" width="100%">
                                 <table cellpadding="0" cellspacing="0" border="0">
                                     <tbody>
                                         <tr>
                                             <td width="100%">
                                 
                                                 <table bgcolor="#fff" class="table_scale" width="600" align="center"
                                                     cellpadding="0" cellspacing="0" border="0">
                                                     <tbody>
                                                         <tr>
                                                             <td width="100%" height="30">&nbsp;</td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
             
                                                 <table class="table_scale" width="600" bgcolor="#fff" cellpadding="0"
                                                     cellspacing="0" border="0">
                                                     <tbody>
                                                         <tr>
                                                             <td width="100%">
                                                                 <table width="600" cellpadding="0" cellspacing="0" border="0">
                                                                     <tbody>
                                                                         <tr>
                                                                             <td class="spacer" width="30"></td>
                                                                             <td width="540">
                                          
                                                                                 <table class="full" align="center" width="auto"
                                                                                     cellpadding="0" cellspacing="0" border="0"
                                                                                     style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                                                                                     <tbody>
                                                                                         <tr>
                                                                                             <td class="center" align="center"
                                                                                                 style="padding: 0px; text-transform: uppercase; font-family: Lucida Sans Unicode; color:#666666; font-size:24px; line-height:34px;">
                                                                                                 <span>
                                                                                                     <a href="https://www.socioboard.com/"
                                                                                                         style="color:#0f48d5;" target="_blank">
                                                                                                         <img src="http://socioboard.com/wp-content/uploads/2021/07/0x0.png"
                                                                                                             alt="Socioboard"
                                                                                                             width="auto" height="80"
                                                                                                             border="0"
                                                                                                             style="display: inline;">
                                                                                                     </a>
                                                                                                 </span>
                                                                                             </td>
                                                                                         </tr>
                                                                                     </tbody>
                                                                                 </table>
                                         
                                                                             </td>
                                                                             <td class="spacer" width="30"></td>
                                                                         </tr>
                                                                     </tbody>
                                                                 </table>
                                                             </td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
                                             </td>
                                         </tr>
                                     </tbody>
                                 </table>
                             </td>
                         </tr>
                     </tbody>
                 </table>
                 <table align="center" bgcolor="#fff" cellpadding="0" cellspacing="0" border="0">
                     <tbody>
                         <tr> 
                             <td valign="top" width="100%">
                                 <table cellpadding="0" cellspacing="0" border="0">
                                     <tbody>
                                         <tr>
                                             <td width="100%">
                                                 <table class="table_scale" width="600" bgcolor="#fff" cellpadding="0"
                                                     cellspacing="0" border="0">
                                                     <tbody>
                                                         <tr>
                                                             <td width="100%">
                                                                 <table width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#fff">
                                                                     <tbody>
                                                                         <tr>
                                                                             <td>
                                                                                 <div style="height: 10px; line-height: 40px;"></div>
                                                                             </td>
                                                                         </tr>
                                                                         <tr>
                                                                             <td style="padding: 0px;" width="600" valign="middle">
                                                                                 <a href="#">
                                                                                 <img alt="Account Deleted" src="http://socioboard.com/wp-content/uploads/2021/07/account-deleted.png" style="width: 100%; display:block;">
                                                                                 </a>
                                                                             </td>
                                                                         </tr>
                                                                     </tbody>
                                                                 </table>
             
                                                             </td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
                                             </td>
                                         </tr>
                                     </tbody>
                                 </table>
                             </td>
                         </tr>
                     </tbody>
                 </table>
             
             <table align="center" bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" style="background: #fff;">
                 <tbody>
                     <tr>
                         <td valign="top" width="100%">
                         <table border="0" cellpadding="0" cellspacing="0">
                             <tbody>
                                 <tr>
                                     <td width="100%">
                                     <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" class="table_scale" width="600">
                                         <tbody>
                                             <tr>
                                                 <td width="100%">
                                                 <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" width="600">
                                                     <tbody>
                                                         <tr>
                                                             <td style="padding: 0px; background: #fff;" valign="middle" width="600">
                                                             <table align="center" border="0" cellpadding="0" cellspacing="0" class="full" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; " width="540">
                                                                 <tbody>
                                                                     <tr>
                                                                         <td align="center">
                                                                         <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                             <tbody>
                                                                                 <tr>
                                                                                     <td>
                                                                                     <div style="height: 30px; line-height: 40px;"></div>
                                                                                     </td>
                                                                                 </tr>
                                                                                 <tr>
                                                                                      <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px; mso-line-height-rule: exactly; text-align: left; padding: 0 5px 12px;" align="left">
                                                                                          <b>Hi [FirstName],</b>
                                                                                      </td>
                                                                                 </tr>
                                                                                 <tr>
                                                                                      <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px; mso-line-height-rule: exactly; text-align: left; padding: 0 5px 12px;" align="left">
                                                                                          Your account has been successfully deleted at your request. Thank you again for being a part of the Socioboard community.
                                                                                      </td>
                                                                                 </tr>
                                                                                 <tr>
                                                                                     <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px;mso-line-height-rule: exactly; text-align: left; padding: 0 5px; padding-bottom:12px; " align="left">
                                                                                         We hope to see you again!
                                                                                     </td>
                                                                                 </tr>
                                                                                 <tr>
                                                                                     <td width="100%" height="20">&nbsp;</td>
                                                                                 </tr>
                                                                             </tbody>
                                                                         </table>
                                                                         </td>
                                                                     </tr>
                                                                 </tbody>
                                                             </table>
                                                             </td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
                                                 </td>
                                             </tr>
                                         </tbody>
                                     </table>
                                     </td>
                                 </tr>
                             </tbody>
                         </table>
                         </td>
                     </tr>
                 </tbody>
             </table>
             
             <table align="center" bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" style="background: #fff;">
                 <tbody>
                     <tr>
                         <td valign="top" width="100%">
                         <table border="0" cellpadding="0" cellspacing="0">
                             <tbody>
                                 <tr>
                                     <td width="100%">
                                     <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" class="table_scale" width="600">
                                         <tbody>
                                             <tr>
                                                 <td width="100%">
                                                 <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" width="600">
                                                     <tbody>
                                                         <tr>
                                                             <td style="padding: 0px; background: #fff;" valign="middle" width="600">
                                                             <table align="center" border="0" cellpadding="0" cellspacing="0" class="full" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; " width="540">
                                                                 <tbody>
                                                                     <tr>
                                                                         <td align="center">
                                                                         <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                             <tbody>
                                                                                 <tr>
                                                                                     <td width="100%" height="20">&nbsp;</td>
                                                                                 </tr>
                                                                                 <tr>
                                                                                     <td class="center" style="margin: 0; padding-bottom:12px; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 25px;mso-line-height-rule: exactly;" align="center">
                                                                                         <span>
                                                                                             Cheers,<br>
                                                                                             <b>Team Socioboard</b> 
                                                                                         </span>
                                                                                     </td>
                                                                                 </tr>
                                                                                 <tr>
                                                                                     <td width="100%" height="40">&nbsp;</td>
                                                                                 </tr>
                                                                             </tbody>
                                                                         </table>
                                                                         </td>
                                                                     </tr>
                                                                 </tbody>
                                                             </table>
                                                             </td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
                                                 </td>
                                             </tr>
                                         </tbody>
                                     </table>
                                     </td>
                                 </tr>
                             </tbody>
                         </table>
                         </td>
                     </tr>
                 </tbody>
             </table>
             
                 <!---FOOTER BLOCK-->
                 <table align="center" bgcolor="#26272b" cellpadding="0" cellspacing="0" border="0">
                     <tbody>
                         <tr>
                             <td valign="top" width="100%">
                                 <table cellpadding="0" cellspacing="0" border="0">
                                     <tbody>
                                         <tr>
                                             <td width="100%">
                                 
                                                 <table bgcolor="#26272b" class="table_scale" width="600" align="center"
                                                     cellpadding="0" cellspacing="0" border="0">
                                                     <tbody>
                                                         <tr>
                                                             <td width="100%" height="30">&nbsp;</td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
             
                                                 <table class="table_scale" width="600" bgcolor="#26272b" cellpadding="0"
                                                     cellspacing="0" border="0">
                                                     <tbody>
                                                         <tr>
                                                             <td width="100%">
                                                                 <table width="600" cellpadding="0" cellspacing="0" border="0">
                                                                     <tbody>
                                                                         <tr>
                                                                             <td class="spacer" width="30"></td>
                                                                             <td width="540">
                                          
                                                                                 <table class="full" align="center" width="auto"
                                                                                     cellpadding="0" cellspacing="0" border="0"
                                                                                     style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                                                                                     <tbody>
                                                                                         <tr>
                                                                                             <td class="center" align="center"
                                                                                                 style="padding: 0px; text-transform: uppercase; font-family: Lucida Sans Unicode; color:#666666; font-size:24px; line-height:0; padding-bottom: 0px;">
                                                                                                 <span>
                                                                                                     <a href="https://www.socioboard.com/"
                                                                                                         style="color:#0f48d5;"  target="_blank">
                                                                                                         <img src="http://socioboard.com/wp-content/uploads/2021/07/socioboard-logo-white.png"
                                                                                                             alt="Socioboard"
                                                                                                             width="auto" height="42"
                                                                                                             border="0"
                                                                                                             style="display: inline;">
                                                                                                     </a>
                                                                                                 </span>
                                                                                             </td>
                                                                                         </tr>
                                                                                          <tr>
                                                                                             <td width="100%" height="30">&nbsp;</td>
                                                                                         </tr>
             
                                                                                     </tbody>
                                                                                 </table>
                                         
                                                                             </td>
                                                                             <td class="spacer" width="30"></td>
                                                                         </tr>
                                                                     </tbody>
                                                                 </table>
                                                             </td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
                                             </td>
                                         </tr>
                                     </tbody>
                                 </table>
                             </td>
                         </tr>
                     </tbody>
                 </table>
                 <table align="center" bgcolor="#26272b" cellpadding="0" cellspacing="0" border="0"
                     style="">
                     <tbody>
                         <tr>
                             <td valign="top" width="100%" style="background: #26272b;">
                                 <table cellpadding="0" cellspacing="0" border="0">
                                     <tbody>
                                         <tr>
                                             <td width="100%">
                                                 <table class="table_scale"  width="600" bgcolor="#26272b" cellpadding="0"
                                                     cellspacing="0" border="0">
                                                     <tbody>
                                                         <tr>
                                                             <td width="100%">
                                                                 <table width="600" cellpadding="0" cellspacing="0" border="0">
                                                                     <tbody>
                                                                         <tr>
                                                                             <td class="spacer" width="30"></td>
                                                                             <td width="540">
                                                                                 <!-- START OF RIGHT COLUMN FOR SOCIAL ICONS-->
                                                                                 <table class="full" align="center" width="auto"
                                                                                     cellpadding="0" cellspacing="0" border="0"
                                                                                     style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                                                                                     <tbody>
                                                                                         <tr>
                                                                                             <td class="center" align="center"
                                                                                                 style="margin: 0; font-size:14px ; color:#aaaaaa; font-family: Helvetica, Arial, sans-serif; line-height: 100%; padding-bottom: 30px;">
                                                                                                 <span>
                                                                                                     <a href="https://www.facebook.com/SocioBoard"
                                                                                                         target="_blank" style="padding-right: 28px; text-decoration: none;">
                                                                                                         <img src="http://socioboard.com/wp-content/uploads/2021/07/mail-fb-icon.png"
                                                                                                             style="width: 30px;" alt="facebook">
                                                                                                     </a> &nbsp;
                                                                                                     <a href="https://twitter.com/Socioboard"
                                                                                                         target="_blank" style="padding-right: 28px; text-decoration: none;">
                                                                                                         <img src="http://socioboard.com/wp-content/uploads/2021/07/mail-tw-icon.png"
                                                                                                             style="width: 30px;" alt="twitter">
                                                                                                     </a> &nbsp;
                                                                                                     <a href="https://www.linkedin.com/company/socioboard-technologies-private-limited"
                                                                                                         target="_blank" style=" text-decoration: none;">
                                                                                                         <img src="http://socioboard.com/wp-content/uploads/2021/07/mail-in-icon.png"
                                                                                                             style="width: 30px;" alt="linkedin">
                                                                                                     </a>
                                                                                                 </span>
                                                                                             </td>
                                                                                         </tr>
                                                                                         <tr>
                                                                                           <td colspan="3">
                                                                                             <table width="auto" cellspacing="0" cellpadding="0" align="center">
                                                                                               <tbody><tr>
                                                                                                 <th>
                                                                                                   <a href="https://socioboard.org/privacy-policy/" style="color:#bdbdbd; font-family: Open sans, Arial, Helvetica, sans-serif; font-size:14px;font-weight:400;line-height:15px; text-decoration: none;" target="_blank">Privacy Policy</a>
                                                                                                 </th>
                                                                                                 <th width="10px" style="border-right: 1px solid #bdbdbd;"></th>
                                                                                                 <th width="10px"></th>
                                                                                                 <th>
                                                                                                   <a href="https://www.socioboard.com/" style="color:#bdbdbd;font-family: Open sans, Arial, Helvetica, sans-serif; font-size:14px;font-weight:400; line-height:15px; text-decoration: none;" target="_blank">socioboard.com</a>
                                                                                                 </th>
                                                                                             </tbody></table>
                                                                                           </td>
                                                                                         </tr>
                                                                                     </tbody>
                                                                                 </table>
                                                                                 <!-- END OF RIGHT COLUMN FOR SOCIAL ICONS-->
                                                                             </td>
                                                                             <td class="spacer" width="30"></td>
                                                                         </tr>
                                                                     </tbody>
                                                                 </table>
                                                             </td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
                                                 <!-- START OF VERTICAL SPACER-->
                                                 <table bgcolor="#26272b" class="table_scale" width="600" align="center"
                                                     cellpadding="0" cellspacing="0" border="0">
                                                     <tbody>
                                                         <tr>
                                                             <td width="100%" height="30">&nbsp;</td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
                                                 <!-- END OF VERTICAL SPACER-->
                                             </td>
                                         </tr>
                                     </tbody>
                                 </table>
                             </td>
                         </tr>
                     </tbody>
                 </table>
                 <table cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b" align="center">
                     <tbody>
                         <tr>
                             <td width="100%" valign="top">
                                 <table cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b">
                                     <tbody>
                                         <tr>
                                             <td width="100%">
             
                                                 <table class="table_scale" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b" align="center">
                                                     <tbody>
                                                         <tr>
                                                             <td width="100%">
                                                                 <table width="600" cellspacing="0" cellpadding="0" border="0">
                                                                     <tbody>
                                                                         <tr>
                                                                             <td class="spacer" width="30"></td>
                                                                             <td width="540">
                                                                                 <!-- START OF LEFT COLUMN FOR HEADING-->
                                                                                 <table class="full" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;" width="500" cellspacing="0" cellpadding="0" border="0" align="center">
                                                                                     <tbody>
                                                                                         <tr>
                                                                                             <td style="margin: 0; font-size:13px ; color:#bdbdbd; font-family: Open sans, Arial, Helvetica, sans-serif; line-height: 18px; text-align: center;" width="100%" height="20">
                                                                                                 Copyright © 2014 - 2021 Socioboard. All Rights Reserved.</td>
                                                                                         </tr>
                                                                                     </tbody>
                                                                                 </table>
                                                                                 <!-- END OF LEFT COLUMN FOR HEADING-->
                                                                             </td>
                                                                             <td class="spacer" width="30"></td>
                                                                         </tr>
                                                                     </tbody>
                                                                 </table>
                                                             </td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
                                                 <!-- END OF VERTICAL SPACER-->
                                                 <!-- START OF VERTICAL SPACER-->
                                                 <table class="table_scale" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b" align="center">
                                                     <tbody>
                                                         <tr>
                                                             <td width="100%" height="30">&nbsp;</td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
                                                 <!-- END OF VERTICAL SPACER-->
                                             </td>
                                         </tr>
                                     </tbody>
                                 </table>
                             </td>
                         </tr>
                     </tbody>
                 </table>
                 <!-- END OF FOOTER BLOCK-->
             
             </body>
             
             </html>`,

      // Replace -[Email] [AccountType]
      beforeExpireNotification:
        '<!DOCTYPE html PUBLIC><html lang="en"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"><meta name="format-detection" content="telephone=no" /><title>Notification of Account Expiry - SocioBoard</title><link rel="stylesheet" href="email.css" /><style>body {font-family: "Source Sans Pro","Helvetica Neue",Helvetica,Arial,sans-serif;}</style></head><body bgcolor="#E1E1E1" leftmargin="0" marginwidth="0" topmargin="0" marginheight="0" offset="0"><center style="background-color:#E1E1E1;"><table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable" style="table-layout: fixed;max-width:100% !important;width: 100% !important;min-width: 100% !important;"><tr><td align="center" valign="top" id="bodyCell"><table bgcolor="#FFFFFF"  border="0" cellpadding="0" cellspacing="0" width="700" id="emailBody"><tr><td align="center" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#fff"><tr><td align="center" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="500" class="flexibleContainer"><tr><td align="center" valign="top" width="500" class="flexibleContainerCell"><table border="0" cellpadding="30" cellspacing="0" width="100%"><tr><td align="center" valign="top" class="textContent"><center><img src="http://imgur.com/nvNPyAp.png" /></center></td></tr></table></td></tr></table></td></tr></table></td></tr><tr><td align="center" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#ffaa7b"><tr style="padding-top:0;"><td align="center" valign="top"><table border="0" cellpadding="30" cellspacing="0" width="700" class="flexibleContainer"><tr><td style="padding-top:0;" align="center" valign="top" width="500" class="flexibleContainerCell"><table border="0" cellpadding="0" cellspacing="0" width="90%" style="margin-top:10%;"><tr><td align="left"><p>Hi [FirstName]</p></td></tr><tr><td align="left"><p style="margin-top: 7%;">Your account will expire on [ExpireDate].</p></td></tr><tr><td align="left"><p style="margin-top: 5%;">You can continue using socioboard by upgrading your account or downgrading to basic version in a very short span of time.</p></td></tr><tr><td align="left"><p style="margin-top: 5%;">You can look into more exciting options</p></td></tr><tr><td align="left"><p style="margin-top: 5%;">Login to socioboard <a href="https://www.socioboard.com/Home#/profilesettings" target="_blank" style="text-decoration:none;color:#828282;"><span style="color:#828282;">click here</span></a>.</p></td></tr><tr><td align="left"><p style="margin-top: 5%;">Please feel free to contact us in case you have any questions</p></td></tr><tr><td align="left"><p style="margin-top: 10%; margin-bottom:5%;">Best regards<br/>Support Team<br/>Socioboard</p></td></tr></table></td></tr></table></td></tr></table></td></tr></table><table bgcolor="#E1E1E1" border="0" cellpadding="0" cellspacing="0" width="500" id="emailFooter"><tr><td align="center" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="500" class="flexibleContainer"><tr><td align="center" valign="top" width="500" class="flexibleContainerCell"><table border="0" cellpadding="30" cellspacing="0" width="100%"><tr><td valign="top" bgcolor="#E1E1E1"><div style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#828282;text-align:center;line-height:120%;"><div>Copyright &copy; 2019 <a href="#" target="_blank" style="text-decoration:none;color:#828282;"><span style="color:#828282;">Socioboard</span></a>. All&nbsp;rights&nbsp;reserved.</div><div></div></div></td></tr></table></td></tr></table></td></tr></table></td></tr></table></td></tr></table></center></body></html>',

      // Replace -[Email] [AccountType] [message]
      messagenotification:
        '<body style="background-color: #FB6947;"> <div style="margin-top: 50px; margin: 0 auto; width: 630px;"> <div style="width: 630px; height: auto; float: left; margin-top: 125px;"> <div style="width: 630px; padding-top: 17px; text-align: center; height: 80px; background: none repeat scroll 0px 0px rgb(255, 188, 173); border-top-left-radius: 5px; border-top-right-radius: 5px;"> <img style="max-height:110px" src="https://i.imgur.com/qAdpCjL.png" alt="" /> </div> <!--Email content--> <div style="font-family: Tahoma; font-size: 14px; background-color: #fff; color: rgb(24, 24, 24); padding: 10px; float: left; width: 606px; border: 2px solid rgb(255, 255, 255); border-bottom-left-radius: 5px; border-bottom-right-radius: 5px;"> <div style="width: 610px; float: left; height: 35px;"> </div> <div style="width: 610px; height: auto; float: left;"> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> Hi [FirstName], </div> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;">Notification [message] <i class="em em-disappointed_relieved"></i></div> </div><div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> Email:  [Email]  </div> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> AccountType:  [AccountType]  </div> </br> </br> <!--</br>--> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> Please Upgrade the plan. </div> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> Hope you have a great time at Socioboard. Keep socioboarding... :)</div> </br> <!--<div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> </div>--> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> Warm regards,</div> </br> <div style="width: 680px; height: auto; float: left; font-size: 22px; font-family: Arial; margin-top: 10px;"> Socioboard Team</div> </div> <div style="width: 610px; float: left; height: 30px;"> </div> </div> </div> </div> </body>',

      // Replace -[Email] [AccountType]
      expirednotification:
        '<!DOCTYPE html PUBLIC><html lang="en"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"><meta name="format-detection" content="telephone=no" /><title>Notification of Account Expiry - SocioBoard</title><link rel="stylesheet" href="email.css" /><style>body {font-family: "Source Sans Pro","Helvetica Neue",Helvetica,Arial,sans-serif;}</style></head><body bgcolor="#E1E1E1" leftmargin="0" marginwidth="0" topmargin="0" marginheight="0" offset="0"><center style="background-color:#E1E1E1;"><table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable" style="table-layout: fixed;max-width:100% !important;width: 100% !important;min-width: 100% !important;"><tr><td align="center" valign="top" id="bodyCell"><table bgcolor="#FFFFFF"  border="0" cellpadding="0" cellspacing="0" width="700" id="emailBody"><tr><td align="center" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#fff"><tr><td align="center" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="500" class="flexibleContainer"><tr><td align="center" valign="top" width="500" class="flexibleContainerCell"><table border="0" cellpadding="30" cellspacing="0" width="100%"><tr><td align="center" valign="top" class="textContent"><center><img src="http://imgur.com/nvNPyAp.png" /></center></td></tr></table></td></tr></table></td></tr></table></td></tr><tr><td align="center" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#ffaa7b"><tr style="padding-top:0;"><td align="center" valign="top"><table border="0" cellpadding="30" cellspacing="0" width="700" class="flexibleContainer"><tr><td style="padding-top:0;" align="center" valign="top" width="500" class="flexibleContainerCell"><table border="0" cellpadding="0" cellspacing="0" width="90%" style="margin-top:10%;"><tr><td align="left"><p>Hi [FirstName],</p></td></tr><tr><td align="left"><p style="margin-top: 7%;">Your socioboard account has been expired .</p></td></tr><tr><td align="left"><p style="margin-top: 5%;">You can continue using socioboard by upgrading your account or downgrading to basic version in a very short span of time.</p></td></tr><tr><td align="left"><p style="margin-top: 5%;">You can look into more exciting options</p></td></tr><tr><td align="left"><p style="margin-top: 5%;">Login to socioboard <a href="https://www.socioboard.com/Home#/profilesettings" target="_blank" style="text-decoration:none;color:#828282;"><span style="color:#828282;">click here</span></a>.</p></td></tr><tr><td align="left"><p style="margin-top: 5%;">Please feel free to contact us in case you have any questions</p></td></tr><tr><td align="left"><p style="margin-top: 10%; margin-bottom:5%;">Best regards<br/>Support Team<br/>Socioboard</p></td></tr></table></td></tr></table></td></tr></table></td></tr></table><table bgcolor="#E1E1E1" border="0" cellpadding="0" cellspacing="0" width="500" id="emailFooter"><tr><td align="center" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="500" class="flexibleContainer"><tr><td align="center" valign="top" width="500" class="flexibleContainerCell"><table border="0" cellpadding="30" cellspacing="0" width="100%"><tr><td valign="top" bgcolor="#E1E1E1"><div style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#828282;text-align:center;line-height:120%;"><div>Copyright &copy; 2019 <a href="#" target="_blank" style="text-decoration:none;color:#828282;"><span style="color:#828282;">Socioboard</span></a>. All&nbsp;rights&nbsp;reserved.</div><div></div></div></td></tr></table></td></tr></table></td></tr></table></td></tr></table></td></tr></table></center></body></html>',
      //  Replace -[Email] [AccountType]
      loginReminderNotification:
        '<!DOCTYPE html PUBLIC><html lang="en"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"><meta name="format-detection" content="telephone=no" /><title>Account Expiry - SocioBoard</title><link rel="stylesheet" href="email.css" /><style>body {font-family: "Source Sans Pro","Helvetica Neue",Helvetica,Arial,sans-serif;}</style></head><body bgcolor="#E1E1E1" leftmargin="0" marginwidth="0" topmargin="0" marginheight="0" offset="0"><center style="background-color:#E1E1E1;"><table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable" style="table-layout: fixed;max-width:100% !important;width: 100% !important;min-width: 100% !important;"><tr><td align="center" valign="top" id="bodyCell"><table bgcolor="#FFFFFF"  border="0" cellpadding="0" cellspacing="0" width="700" id="emailBody"><tr><td align="center" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#fff"><tr><td align="center" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="500" class="flexibleContainer"><tr><td align="center" valign="top" width="500" class="flexibleContainerCell"><table border="0" cellpadding="30" cellspacing="0" width="100%"><tr><td align="center" valign="top" class="textContent"><center><img src="http://imgur.com/nvNPyAp.png" /></center></td></tr></table></td></tr></table></td></tr></table></td></tr><tr><td align="center" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#ffaa7b"><tr style="padding-top:0;"><td align="center" valign="top"><table border="0" cellpadding="30" cellspacing="0" width="700" class="flexibleContainer"><tr><td style="padding-top:0;" align="center" valign="top" width="500" class="flexibleContainerCell"><table border="0" cellpadding="0" cellspacing="0" width="90%" style="margin-top:10%;"><tr><td align="left"><p>Hi [FirstName],</p></td></tr><tr><td align="left"><p style="margin-top: 7%;">You have not logged in to your SocioBoard account since [LastLogin].We miss you. </p></td></tr><tr><td align="left"><p style="margin-top: 2%;"> Please login to SocioBoard account by <a href="https://www.socioboard.com/#" target="_blank" style="text-decoration:none;color:#828282;"><span style="color:#2979ff;">clicking here</span></a><tr><td align="left"><p style="margin-top: 5%;">Please feel free to contact us in case you have any questions</p></td></tr><tr><td align="left"><p style="margin-top: 10%; margin-bottom:5%;">Best regards<br/>Support Team<br/>SocioBoard</p></td></tr></table></td></tr></table></td></tr></table></td></tr></table><table bgcolor="#E1E1E1" border="0" cellpadding="0" cellspacing="0" width="500" id="emailFooter"><tr><td align="center" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="500" class="flexibleContainer"><tr><td align="center" valign="top" width="500" class="flexibleContainerCell"><table border="0" cellpadding="30" cellspacing="0" width="100%"><tr><td valign="top" bgcolor="#E1E1E1"><div style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#828282;text-align:center;line-height:120%;"><div>Copyright &copy; 2019 <a href="#" target="_blank" style="text-decoration:none;color:#828282;"><span style="color:#828282;">Socioboard</span></a>. All&nbsp;rights&nbsp;reserved.</div><div>If you do not want to recieve emails from us, you can <a href="https://www.socioboard.com/Home#/profilesettings" target="_blank" style="text-decoration:none;color:#828282;"><span style="color:#828282;">unsubscribe</span></a>.</div></div></td></tr></table></td></tr></table></td></tr></table></td></tr></table></td></tr></table></center></body></html>',

      // Replace -[OTP]
      mail_otp:
        '<body style="background-color: #FB6947;"> <div style="margin-top: 50px; margin: 0 auto; width: 630px;"> <div style="width: 630px; height: auto; float: left; margin-top: 125px;"> <div style="width: 630px; padding-top: 17px; text-align: center; height: 80px; background: none repeat scroll 0px 0px rgb(255, 188, 173); border-top-left-radius: 5px; border-top-right-radius: 5px;"> <img style="max-height:110px" src="https://i.imgur.com/qAdpCjL.png" alt="" /> </div> <!--Email content--> <div style="font-family: Tahoma; font-size: 14px; background-color: #fff; color: rgb(24, 24, 24); padding: 10px; float: left; width: 606px; border: 2px solid rgb(255, 255, 255); border-bottom-left-radius: 5px; border-bottom-right-radius: 5px;"> <div style="width: 610px; float: left; height: 35px;"> </div> <div style="width: 610px; height: auto; float: left;"> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> Welcome to SOCIOBOARD <strong> 2<->way Authentication </strong>, </div> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> Congratulations! Your OTP is:  <Strong> [OTP].  </strong> </div> </br> </br> <!--</br>--> <br/> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> <strong> Please, Use this OTP within 10 minutes otherwise OTP will get expire </strong></div> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> <!-- Click <a href="%replink%"> here</a> to login. </div></br></br>--></a> </div> </br></br> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> Hope you have a great time at Socioboard. Keep socioboarding... :)</div> </br> <!--<div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> </div>--> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> Warm regards,</div> </br> <div style="width: 610px; height: auto; float: left; font-size: 15px; font-family: Arial; margin-top: 10px;"> Socioboard Team</div> </div> <div style="width: 610px; float: left; height: 35px;"> </div> </div> <!--End Email content--> </div> </div> </body>',

      invite_team_user: `<html xmlns="http://www.w3.org/1999/xhtml">

      <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0">
          <title>Mail Template</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet"> 
          <style>
             
             @media screen and (max-width: 767px) {
                 .table_scale {
                     width: 100% !important;
                 }
             } 
          </style>
      </head>
      
      <body bgcolor="#f8f8f8">
      
          <!-- START OF HEADER BLOCK-->
      <table align="center" bgcolor="#fff" cellpadding="0" cellspacing="0" border="0"
              style="margin-top: 20px;">
          <tbody>
              <tr>
                  <td valign="top" width="100%">
                      <table cellpadding="0" cellspacing="0" border="0">
                          <tbody>
                              <tr>
                                  <td width="100%">
                      
                                      <table bgcolor="#fff" class="table_scale" width="600" align="center"
                                          cellpadding="0" cellspacing="0" border="0">
                                          <tbody>
                                              <tr>
                                                  <td width="100%" height="30">&nbsp;</td>
                                              </tr>
                                          </tbody>
                                      </table>
      
                                      <table class="table_scale" width="600" bgcolor="#fff" cellpadding="0"
                                          cellspacing="0" border="0">
                                          <tbody>
                                              <tr>
                                                  <td width="100%">
                                                      <table width="600" cellpadding="0" cellspacing="0" border="0">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="spacer" width="30"></td>
                                                                  <td width="540">
                                  
                                                                      <table class="full" align="center" width="auto"
                                                                          cellpadding="0" cellspacing="0" border="0"
                                                                          style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                                                                          <tbody>
                                                                              <tr>
                                                                                  <td class="center" align="center"
                                                                                      style="padding: 0px; text-transform: uppercase; font-family: Lucida Sans Unicode; color:#666666; font-size:24px; line-height:34px;">
                                                                                      <span>
                                                                                          <a href="https://www.socioboard.com/"
                                                                                              style="color:#0f48d5;" target="_blank">
                                                                                              <img src="http://socioboard.com/wp-content/uploads/2021/07/0x0.png"
                                                                                                  alt="Socioboard"
                                                                                                  width="auto" height="80"
                                                                                                  border="0"
                                                                                                  style="display: inline;">
                                                                                          </a>
                                                                                      </span>
                                                                                  </td>
                                                                              </tr>
                                                                          </tbody>
                                                                      </table>
                              
                                                                  </td>
                                                                  <td class="spacer" width="30"></td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                          </tbody>
                      </table>
                  </td>
              </tr>
          </tbody>
      </table>
      
      
      <table align="center" bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" style="background: #fff;">
          <tbody>
              <tr>
                  <td valign="top" width="100%">
                  <table border="0" cellpadding="0" cellspacing="0">
                      <tbody>
                          <tr>
                              <td width="100%">
                              <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" class="table_scale" width="600">
                                  <tbody>
                                      <tr>
                                          <td width="100%">
                                          <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" width="600">
                                              <tbody>
                                                  <tr>
                                                      <td style="padding: 0px; background: #fff;" valign="middle" width="600">
                                                      <table align="center" border="0" cellpadding="0" cellspacing="0" class="full" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; " width="540">
                                                          <tbody>
                                                              <tr>
                                                                  <td align="center">
                                                                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                      <tbody>
                                                                          <tr>
                                                                              <td>
                                                                              <div style="height: 30px; line-height: 40px;"></div>
                                                                              </td>
                                                                          </tr>
                                                                          <tr>
                                                                               <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px; mso-line-height-rule: exactly; text-align: left; padding: 0 5px 12px;" align="left">
                                                                                   <b>Hi [FirstName]</b>
                                                                               </td>
                                                                          </tr>
                                                                          <tr>
                                                                              <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px;mso-line-height-rule: exactly; text-align: left; padding: 0 5px; padding-bottom:20px; " align="left">
                                                                                  <p>We are pleased to acquaint you that <b>[inviteduser]</b> requested you to join the <b>[teamname]</b> team and be a part of the <b>SocioBoard</b> family.
                                                                                  </p>
                                                                                  <p>
                                                                                  The step of joining is just a few clicks away. Please click on the Register button down at the end of this mail to register into the team instantly.
                                                                                  </p>
                                                                              </td>
                                                                          </tr>
                                                                          <tr>
                                                                              <td class="left" style="background: #fff; margin: 0; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 17px; color: #383737; line-height: 24px;mso-line-height-rule: exactly; text-align: left; padding: 0 5px; padding-bottom:35px; " align="left">
                                                                                  <span>Welcome to the SocioBoard team!
                                                                                  </span>
                                                                              </td>
                                                                          </tr>
                                                                         
                                                                          <tr>
                                                                              <td class="center" style="margin: 0; padding-bottom:0px; margin:0; font-family: Open sans, Arial, Helvetica, sans-serif; font-size: 16px; color: #e9e9e9; line-height: 25px;mso-line-height-rule: exactly; text-align: center;" align="center">
                                                                                  <a target="_blank" href="[RegisterLink]" style="background: #f85c37; border: 0px; padding: 12px 20px; color: #fff; font-size: 18px; letter-spacing: 1px; margin-top: 14px; cursor: pointer; font-weight: 600; border-radius: 80px; text-decoration: none;">Register Now</a>
                                                                              </td>
                                                                          </tr>
                                                                          <tr>
                                                                              <td width="100%" height="20">&nbsp;</td>
                                                                          </tr>
                                                                          <tr>
                                                                              <td width="100%" height="20">&nbsp;</td>
                                                                          </tr>
                                                                      </tbody>
                                                                  </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                      </td>
                                                  </tr>
                                              </tbody>
                                          </table>
                                          </td>
                                      </tr>
                                  </tbody>
                              </table>
                              </td>
                          </tr>
                      </tbody>
                  </table>
                  </td>
              </tr>
          </tbody>
      </table>
      
      
          <!---FOOTER BLOCK-->
          <table align="center" bgcolor="#26272b" cellpadding="0" cellspacing="0" border="0">
              <tbody>
                  <tr>
                      <td valign="top" width="100%">
                          <table cellpadding="0" cellspacing="0" border="0">
                              <tbody>
                                  <tr>
                                      <td width="100%">
                          
                                          <table bgcolor="#26272b" class="table_scale" width="600" align="center"
                                              cellpadding="0" cellspacing="0" border="0">
                                              <tbody>
                                                  <tr>
                                                      <td width="100%" height="30">&nbsp;</td>
                                                  </tr>
                                              </tbody>
                                          </table>
      
                                          <table class="table_scale" width="600" bgcolor="#26272b" cellpadding="0"
                                              cellspacing="0" border="0">
                                              <tbody>
                                                  <tr>
                                                      <td width="100%">
                                                          <table width="600" cellpadding="0" cellspacing="0" border="0">
                                                              <tbody>
                                                                  <tr>
                                                                      <td class="spacer" width="30"></td>
                                                                      <td width="540">
                                   
                                                                          <table class="full" align="center" width="auto"
                                                                              cellpadding="0" cellspacing="0" border="0"
                                                                              style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td class="center" align="center"
                                                                                          style="padding: 0px; text-transform: uppercase; font-family: Lucida Sans Unicode; color:#666666; font-size:24px; line-height:0; padding-bottom: 0px;">
                                                                                          <span>
                                                                                              <a href="https://www.socioboard.com/"
                                                                                                  style="color:#0f48d5;"  target="_blank">
                                                                                                  <img src="http://socioboard.com/wp-content/uploads/2021/07/socioboard-logo-white.png"
                                                                                                      alt="Socioboard"
                                                                                                      width="auto" height="42"
                                                                                                      border="0"
                                                                                                      style="display: inline;">
                                                                                              </a>
                                                                                          </span>
                                                                                      </td>
                                                                                  </tr>
                                                                                   <tr>
                                                                                      <td width="100%" height="30">&nbsp;</td>
                                                                                  </tr>
      
                                                                              </tbody>
                                                                          </table>
                                  
                                                                      </td>
                                                                      <td class="spacer" width="30"></td>
                                                                  </tr>
                                                              </tbody>
                                                          </table>
                                                      </td>
                                                  </tr>
                                              </tbody>
                                          </table>
                                      </td>
                                  </tr>
                              </tbody>
                          </table>
                      </td>
                  </tr>
              </tbody>
          </table>
          <table align="center" bgcolor="#26272b" cellpadding="0" cellspacing="0" border="0"
              style="">
              <tbody>
                  <tr>
                      <td valign="top" width="100%" style="background: #26272b;">
                          <table cellpadding="0" cellspacing="0" border="0">
                              <tbody>
                                  <tr>
                                      <td width="100%">
                                          <table class="table_scale"  width="600" bgcolor="#26272b" cellpadding="0"
                                              cellspacing="0" border="0">
                                              <tbody>
                                                  <tr>
                                                      <td width="100%">
                                                          <table width="600" cellpadding="0" cellspacing="0" border="0">
                                                              <tbody>
                                                                  <tr>
                                                                      <td class="spacer" width="30"></td>
                                                                      <td width="540">
                                                                          <!-- START OF RIGHT COLUMN FOR SOCIAL ICONS-->
                                                                          <table class="full" align="center" width="auto"
                                                                              cellpadding="0" cellspacing="0" border="0"
                                                                              style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td class="center" align="center"
                                                                                          style="margin: 0; font-size:14px ; color:#aaaaaa; font-family: Helvetica, Arial, sans-serif; line-height: 100%; padding-bottom: 30px;">
                                                                                          <span>
                                                                                              <a href="https://www.facebook.com/SocioBoard"
                                                                                                  target="_blank" style="padding-right: 28px; text-decoration: none;">
                                                                                                  <img src="http://socioboard.com/wp-content/uploads/2021/07/mail-fb-icon.png"
                                                                                                      style="width: 30px;" alt="facebook">
                                                                                              </a> &nbsp;
                                                                                              <a href="https://twitter.com/Socioboard"
                                                                                                  target="_blank" style="padding-right: 28px; text-decoration: none;">
                                                                                                  <img src="http://socioboard.com/wp-content/uploads/2021/07/mail-tw-icon.png"
                                                                                                      style="width: 30px;" alt="twitter">
                                                                                              </a> &nbsp;
                                                                                              <a href="https://www.linkedin.com/company/socioboard-technologies-private-limited"
                                                                                                  target="_blank" style=" text-decoration: none;">
                                                                                                  <img src="http://socioboard.com/wp-content/uploads/2021/07/mail-in-icon.png"
                                                                                                      style="width: 30px;" alt="linkedin">
                                                                                              </a>
                                                                                          </span>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                    <td colspan="3">
                                                                                      <table width="auto" cellspacing="0" cellpadding="0" align="center">
                                                                                        <tbody><tr>
                                                                                          <th>
                                                                                            <a href="https://socioboard.org/privacy-policy/" style="color:#bdbdbd; font-family: Open sans, Arial, Helvetica, sans-serif; font-size:14px;font-weight:400;line-height:15px; text-decoration: none;" target="_blank">Privacy Policy</a>
                                                                                          </th>
                                                                                          <th width="10px" style="border-right: 1px solid #bdbdbd;"></th>
                                                                                          <th width="10px"></th>
                                                                                          <th>
                                                                                            <a href="https://www.socioboard.com/" style="color:#bdbdbd;font-family: Open sans, Arial, Helvetica, sans-serif; font-size:14px;font-weight:400; line-height:15px; text-decoration: none;" target="_blank">socioboard.com</a>
                                                                                          </th>
                                                                                          <th width="10px" style="border-right: 1px solid #bdbdbd;"></th>
                                                                                          <th width="10px"></th>
                                                                                          <th>
                                                                                            <a href="{{{unsubscribe}}}" style="color:#bdbdbd; font-family: Open sans, Arial, Helvetica, sans-serif; font-size:14px;font-weight:400;line-height:15px; text-decoration: none;">Unsubscribe</a>
                                                                                          </th>
                                                                                        </tr>
                                                                                      </tbody></table>
                                                                                    </td>
                                                                                  </tr>
                                                                              </tbody>
                                                                          </table>
                                                                          <!-- END OF RIGHT COLUMN FOR SOCIAL ICONS-->
                                                                      </td>
                                                                      <td class="spacer" width="30"></td>
                                                                  </tr>
                                                              </tbody>
                                                          </table>
                                                      </td>
                                                  </tr>
                                              </tbody>
                                          </table>
                                          <!-- START OF VERTICAL SPACER-->
                                          <table bgcolor="#26272b" class="table_scale" width="600" align="center"
                                              cellpadding="0" cellspacing="0" border="0">
                                              <tbody>
                                                  <tr>
                                                      <td width="100%" height="30">&nbsp;</td>
                                                  </tr>
                                              </tbody>
                                          </table>
                                          <!-- END OF VERTICAL SPACER-->
                                      </td>
                                  </tr>
                              </tbody>
                          </table>
                      </td>
                  </tr>
              </tbody>
          </table>
          <table cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b" align="center">
              <tbody>
                  <tr>
                      <td width="100%" valign="top">
                          <table cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b">
                              <tbody>
                                  <tr>
                                      <td width="100%">
      
                                          <table class="table_scale" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b" align="center">
                                              <tbody>
                                                  <tr>
                                                      <td width="100%">
                                                          <table width="600" cellspacing="0" cellpadding="0" border="0">
                                                              <tbody>
                                                                  <tr>
                                                                      <td class="spacer" width="30"></td>
                                                                      <td width="540">
                                                                          <!-- START OF LEFT COLUMN FOR HEADING-->
                                                                          <table class="full" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;" width="500" cellspacing="0" cellpadding="0" border="0" align="center">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td style="margin: 0; font-size:13px ; color:#bdbdbd; font-family: Open sans, Arial, Helvetica, sans-serif; line-height: 18px; text-align: center;" width="100%" height="20">
                                                                                          Copyright © 2014 - 2021 Socioboard. All Rights Reserved.</td>
                                                                                  </tr>
                                                                              </tbody>
                                                                          </table>
                                                                          <!-- END OF LEFT COLUMN FOR HEADING-->
                                                                      </td>
                                                                      <td class="spacer" width="30"></td>
                                                                  </tr>
                                                              </tbody>
                                                          </table>
                                                      </td>
                                                  </tr>
                                              </tbody>
                                          </table>
                                          <!-- END OF VERTICAL SPACER-->
                                          <!-- START OF VERTICAL SPACER-->
                                          <table class="table_scale" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#26272b" align="center">
                                              <tbody>
                                                  <tr>
                                                      <td width="100%" height="30">&nbsp;</td>
                                                  </tr>
                                              </tbody>
                                          </table>
                                          <!-- END OF VERTICAL SPACER-->
                                      </td>
                                  </tr>
                              </tbody>
                          </table>
                      </td>
                  </tr>
              </tbody>
          </table>
          <!-- END OF FOOTER BLOCK-->
      
      </body>
      
      </html>`,

      appSumoMailTemplate,
    };
  }

  /**
   *  Make a schedule for sending emails
   *  @param {Object} scheduleObject - To specify the neccessary details for sending emails
   *  @param {Number} data.moduleId - To specify the module id, between 1 to 4 (1-ExpireAlert, 2-ExpiredIntimation, 3-Login Reminder, 4-customMessage)
   *  @param {String} data.batchId - To specify the batch id
   *  @param {Array} data.users - To specify to whom email should sent
   *  @param {Array} data.scheduleId - To specify to schedule Id (Only for schedule success or schedule failed related mails)
   *  @param {Array} data.teamId - To specify to team Id (Only for Team reports related mails)
   *  @param {Array} data.newsletterContent - To specify to custom message (Only for custom mails)
   */
  mailServiceSchedule(scheduleObject) {
    return new Promise((resolve, reject) => {
      let emailContent = '';
      let emailTitle = '';
      switch (scheduleObject.moduleId) {
        case 1:
          emailContent = expiringEmailTemplate();
          emailTitle = 'SocioBoard plan will expire in [days] days!';
          break;
        case 2:
          emailContent = expirednotification();
          emailTitle = 'SocioBoard plan expired!';
          break;
        case 3:
          emailContent = this.template.loginReminderNotification;
          emailTitle = 'SocioBoard login reminder!';
          break;
        case 4:
          emailContent = scheduleObject.newsletterContent;
          emailTitle = 'SocioBoard offer only for you!';
          break;
        default:
          break;
      }

      this.sendNotificationMails(
        scheduleObject,
        emailTitle,
        emailContent,
        scheduleObject.newsletterContent,
        scheduleObject.mailServiceConfiguration
      )
        .then(() => {
          console.log('Process completed');
        })
        .catch(error => {
          console.log('Process Failed', error);
        });

      resolve(true);
    });
  }

  sendNotificationMails(
    scheduleObject,
    emailTitle,
    emailContent,
    newsletterContent
  ) {
    return new Promise((resolve, reject) => {
      return Promise.all(
        scheduleObject.users.map(user => {
          let asm;
          let htmlContent = emailContent
            .replace('[AccountType]', user.Activations.user_plan)
            .replace('[Email]', user.email)
            .replace('[message]', newsletterContent)
            .replace('[FirstName]', user.first_name)
            .replace('[ExpireDate]', user.Activations.account_expire_date)
            .replace('[LastLogin]', user.Activations.last_login);
          let days = moment(
            user.Activations.account_expire_date,
            'YYYY-MM-DD'
          ).diff(moment().format('YYYY-MM-DD'), 'days');
          if (scheduleObject.moduleId == 1) {
            htmlContent = expiringEmailTemplate(days, user.first_name);
            asm = {
              group_id: config.get('mail_subscription_group.expiring') ?? '',
              groups_to_display: [
                config.get('mail_subscription_group.expiring') ?? '',
              ],
            };
          }
          if (scheduleObject.moduleId == 2) {
            asm = {
              group_id: config.get('mail_subscription_group.expired') ?? '',
              groups_to_display: [
                config.get('mail_subscription_group.expired') ?? '',
              ],
            };
          }
          let emailDetails = {
            subject: emailTitle.replace('[days]', days),
            toMail: user.email,
            htmlContent: htmlContent,
            asm: asm ?? '',
          };
          return this.sendMails(
            this.mailServiceConfig.defaultMailOption,
            emailDetails
          ).catch(error => {
            throw error;
          });
        })
      )
        .then(() => {
          let mailDetails = [];
          scheduleObject.users.map(function (user) {
            let object = {
              userEmail: user.email,
              notification_type: scheduleObject.moduleId,
              plan_type: user.Activations.user_plan,
              expire_date: user.Activations.account_expire_date,
              last_login: user.Activations.last_login,
              other_newsletter_title: user.message,
              sent_date: moment(),
              batchId: scheduleObject.batchId,
              schedule_id: scheduleObject.scheduleId,
              team_id: scheduleObject.teamId,
            };
            mailDetails.push(object);
          });
          return MailServiceMongoModel.insertMany(mailDetails);
        })
        .then(() => {
          resolve(true);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * TODO To send auto mail report.
   * @description To send auto mail report
   * @param {object} user - User details to send mail
   * @param {object} attachments -Pdf and csv file for attachment
   * @return {object} Returns mail sent status
   */
  sendReport(user, attachments) {
    const info = this.sendEmailReportBySendGridApi(user, attachments);
    return info;
  }

  /**
   *  To send the email to specify user
   *  @param {Number} defaultService - To specify which method need to use while sending emails
   *  @param {Object} mailingDetails - To specify the neccessary details for sending emails
   *  @param {String} mailingDetails.subject - To specify the subject for the mail
   *  @param {String} mailingDetails.toMail - To specify the to whom need to send mail
   *  @param {String} mailingDetails.htmlContent - To specify the html content which we need to sent
   */
  sendMails(defaultService, mailingDetails) {
    return new Promise(async (resolve, reject) => {
      switch (defaultService) {
        case 'gmail':
          try {
            const info = await this.sendEmailByGmail(mailingDetails);
            return resolve(info);
          } catch (error) {
            return reject(error);
          }
        case 'sendgrid':
          try {
            const info_1 = await this.sendEmailBySendGrid(mailingDetails);
            return resolve(info_1);
          } catch (error_1) {
            return reject(error_1);
          }
        case 'sendgridapi':
          try {
            const info_2 = await this.sendEmailBySendGridApi(mailingDetails);
            return resolve(info_2);
          } catch (error_2) {
            return reject(error_2);
          }
        default:
          break;
      }
    });
  }
}

export default MailService;
