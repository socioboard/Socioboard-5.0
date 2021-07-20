export default function emailTemplate({
    publishedCount, postFailed, fbCount, twitterCount, scheduleCount, totalPost, heading, reportDate, instagramCount, youTubeCount, linkedInCount,
    sellerMailChangesObj
}) {
    return `
    <!DOCTYPE>
    <html>
    
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Email Report</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    
    <body style="margin: 0; padding: 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td style="padding: 10px 0 30px 0;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="650"
                        style="border: 1px solid #cccccc; border-collapse: collapse;">
                        <tr ${!sellerMailChangesObj?.hasLogo ? '' : "style='display:none'"} >
                            <td align="center"
                                style="padding: 40px 0 30px 0; color: #ff0000; font-size: 40px; font-weight: bold; font-family: Arial, sans-serif;">
                                Socio<span style="color: #414042;">Board</span>
                            </td>
                        </tr>
                        <tr  ${sellerMailChangesObj?.hasLogo ? '' : "style='display:none'"} >
                            <td align="center" style="padding: 40px 0 30px 0;">
                                <img src="${sellerMailChangesObj?.logoLink}"
                                    alt="LOGO" style="width: 200px;">
                            </td> 
                         </tr>
                        <tr>
                            <td
                                style="padding: 0 30px 0 30px; color: #153643; font-family: Arial, sans-serif; font-size: 24px; text-align:left;">
                                <b>${heading}</b>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0 30px 0 30px; text-align:right; font-family: Arial, sans-serif;">
                                <b> Report Date :</b>&nbsp;&nbsp;${reportDate}
                            </td>
                        </tr>
                        <tr>
                            <td bgcolor="#ffffff" style="padding: 40px 30px 30px 30px;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td>
                                            <table width="100%" style="text-align: center; margin: 20px 00 20px 00;">
                                                <tr bgcolor="#ff8080">
                                                    <td width="33.33%"
                                                        style="padding: 20px 00 20px 00; font-family: Arial, sans-serif; color: #153643;">
                                                        <b>Published Count </b><br>
                                                        ${publishedCount}
                                                    </td>
                                                    <td width="33.33%"
                                                        style="padding: 20px 00 20px 00; font-family: Arial, sans-serif; color: #153643;">
                                                        <b> Scheduled Count </b><br>
                                                        ${scheduleCount}
                                                    </td>
                                                </tr>
                                                <tr bgcolor="#ff0000">
                                                    <td width="33.33%"
                                                        style="padding: 10px 00 10px 00; font-family: Arial, sans-serif;">
                                                        <b> Post failed </b><br>
                                                        ${postFailed}
                                                    </td>
                                                    <td width="33.33%"
                                                        style="padding: 10px 00 10px 00; font-family: Arial, sans-serif;">
                                                        <b> Total Post  </b><br>
                                                        ${totalPost}
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
    
                                    <tr>
                                        <td>
                                            <table width="100%" style="text-align: center; margin: 00px 00 20px 00;">
                                                <tr bgcolor="#800000">
                                                    <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 20px; text-align: center; padding: 10px 00 10px 00;"
                                                        colspan="5">
                                                        <b>Social Accounts</b>
                                                    </td>
                                                </tr>
                                                <tr bgcolor="#ff8080">
                                                    <td width="33.33%"
                                                        style="padding: 20px 15px 20px 15px; font-family: Arial, sans-serif; color: #153643;">
                                                        <b> Facebook </b><br>
    
                                                        <small><b></b><br>${fbCount}</small>
                                                    </td>
                                                    <td width="33.33%"
                                                        style="padding: 20px 20px 20px 20px; font-family: Arial, sans-serif; color: #153643;">
                                                        <b> Twitter</b><br>
    
                                                        <small><br> ${twitterCount} </small>
                                                    </td>
                                                    <td width="33.33%"
                                                        style="padding: 20px 20px 20px 20px; font-family: Arial, sans-serif; color: #153643;">
                                                        <b>Instagram</b><br>
    
                                                        <small><br> ${instagramCount} </small>
                                                    </td>
                                                    <td width="33.33%"
                                                        style="padding: 20px 20px 20px 20px; font-family: Arial, sans-serif; color: #153643;">
                                                        <b> YouTube </b><br>
    
                                                        <small><br> ${youTubeCount} </small>
                                                    </td>
                                                    <td width="33.33%"
                                                        style="padding: 20px 20px 20px 20px; font-family: Arial, sans-serif; color: #153643;">
                                                        <b> LinkedIn </b><br>
    
                                                        <small><br> ${linkedInCount} </small>
                                                    </td>
                                                </tr>
    
                                            </table>
                                        </td>
                                    </tr>
                                <tr>
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
                    
                                    <table bgcolor="#fff" class="table_scale" width="600" align="center"
                                        cellpadding="0" cellspacing="0" border="0">
                                        <tbody>
                                            <tr>
                                                <td width="100%" height="60">&nbsp;</td>
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
                                                                <td class="spacer" width="20"></td>
                                                                <td width="540">
                             
                                                                    <table class="full" align="center" width="auto"
                                                                        cellpadding="0" cellspacing="0" border="0"
                                                                        style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td class="center" align="center"
                                                                                    style="padding: 0px; text-transform: uppercase; font-family: Lucida Sans Unicode; color:#666666; font-size:24px; line-height:34px; padding-bottom: 10px;">
                                                                                    <span>
                                                                                        <a href="https://www.socioboard.com/"
                                                                                            style="color:#0f48d5;"  target="_blank">
                                                                                            <img src="http://socioboard.com/wp-content/uploads/2021/07/Socioboard_new_withouttag.png"
                                                                                                alt="Socioboard"
                                                                                                width="auto" height="50"
                                                                                                border="0"
                                                                                                style="display: inline;">
                                                                                        </a>
                                                                                    </span>
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td class="center" style="background: #fff; margin: 0; margin:0; font-family: 'Lato', sans-serif, Arial, Helvetica; font-size: 14px; color: #565a5d; line-height: 21px;mso-line-height-rule: exactly; text-align: center; padding: 0 5px; padding-bottom: 20px; " align="center">
                                                                                    <span>No. 16, Lakshya Towers, 2nd Floor, KHB Colony, 5th Block, Koramangala, Bengaluru, Karnataka 560095
                                                                                    </span>
                                                                                </td>
                                                                            </tr>

                                                                            <tr>
                                                                              <td colspan="3">
                                                                                <table width="auto" cellspacing="0" cellpadding="0" align="center">
                                                                                  <tbody><tr>
                                                                                    <th>
                                                                                      <a href="https://www.socioboard.com/" style="color:#383737;font-family: 'Lato', sans-serif, Arial, Helvetica; font-size:14px;font-weight:400; line-height:21px; text-decoration: underline;" target="_blank">Socioboard.com</a>
                                                                                    </th>
                                                                                    <th width="16px"></th>
                                                                                    <th>
                                                                                      <a href="https://socioboard.org/privacy-policy/" style="color:#383737; font-family: 'Lato', sans-serif, Arial, Helvetica; font-size:14px;font-weight:400;line-height:21px; text-decoration: underline;" target="_blank">Privacy Policy</a>
                                                                                    </th>
                                                                                    <th width="16px"></th>
                                                                                    <th>
                                                                                      <a href="#" style="color:#383737; font-family: 'Lato', sans-serif, Arial, Helvetica; font-size:14px;font-weight:400;line-height:21px; text-decoration: underline;">Unsubscribe</a>
                                                                                    </th>
                                                                                  </tr>
                                                                                </tbody></table>
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
    
        <!-- START OF SOCIAL BLOCK-->
        <table align="center" bgcolor="#fff" cellpadding="0" cellspacing="0" border="0"
        style="">
        <tbody>
            <tr>
                <td valign="top" width="100%" style="background: #fff;">
                    <table cellpadding="0" cellspacing="0" border="0">
                        <tbody>
                            <tr>
                                <td width="100%">
                                    <!-- START OF VERTICAL SPACER-->
                                    <table bgcolor="#fff" class="table_scale" width="600" align="center"
                                        cellpadding="0" cellspacing="0" border="0">
                                        <tbody>
                                            <tr>
                                                <td width="100%" height="8">&nbsp;</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <!-- END OF VERTICAL SPACER-->
                                    <table class="table_scale"  width="600" bgcolor="#fff" cellpadding="0"
                                        cellspacing="0" border="0">
                                        <tbody>
                                            <tr>
                                                <td width="100%">
                                                    <table width="600" cellpadding="0" cellspacing="0" border="0">
                                                        <tbody>
                                                            <tr>
                                                                <td class="spacer" width="10"></td>
                                                                <td width="540">
                                                                    <!-- START OF RIGHT COLUMN FOR SOCIAL ICONS-->
                                                                    <table class="full" align="center" width="280"
                                                                        cellpadding="0" cellspacing="0" border="0"
                                                                        style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td class="center" align="center"
                                                                                    style="margin: 0; font-size:14px ; color:#aaaaaa; font-family: Helvetica, Arial, sans-serif; line-height: 100%; padding-top: 10px;">
                                                                                    <span>
                                                                                        <a href="https://www.facebook.com/SocioBoard"
                                                                                            target="_blank" style="padding-right: 5px;">
                                                                                            <img src="http://socioboard.com/wp-content/uploads/2021/07/newsletter-fb.png"
                                                                                                style="width: 25px;" alt="facebook">
                                                                                        </a> &nbsp;
                                                                                        <a href="https://twitter.com/Socioboard"
                                                                                            target="_blank" style="padding-right: 5px;">
                                                                                            <img src="http://socioboard.com/wp-content/uploads/2021/07/newsletter-tw.png"
                                                                                                style="width: 25px;" alt="twitter">
                                                                                        </a> &nbsp;
                                                                                        <a href="https://www.linkedin.com/company/socioboard-technologies-private-limited"
                                                                                            target="_blank">
                                                                                            <img src="http://socioboard.com/wp-content/uploads/2021/07/newsletter-linkedin.png"
                                                                                                style="width: 25px;" alt="linkedin">
                                                                                        </a>
                                                                                    </span>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                    <!-- END OF RIGHT COLUMN FOR SOCIAL ICONS-->
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <!-- START OF VERTICAL SPACER-->
                                    <table bgcolor="#fff" class="table_scale" width="600" align="center"
                                        cellpadding="0" cellspacing="0" border="0">
                                        <tbody>
                                            <tr>
                                                <td width="100%" height="10">&nbsp;</td>
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
        <!-- END OF SOCIAL BLOCK-->
    
    
        <!-- START OF SUB-FOOTER BLOCK-->
        <table cellspacing="0" cellpadding="0" border="0" bgcolor="#fff" align="center">
            <tbody>
                <tr>
                    <td width="100%" valign="top">
                        <table cellspacing="0" cellpadding="0" border="0" bgcolor="#fff">
                            <tbody>
                                <tr>
                                    <td width="100%">
    
                                        <table class="table_scale" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#fff" align="center">
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
                                                                                    <td style="margin: 0; font-size:13px ; color:#565a5d; font-family: 'Lato', sans-serif, Arial, Helvetica; line-height: 18px; text-align: center;" width="100%" height="20">
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
                                        <table class="table_scale" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#fff" align="center">
                                            <tbody>
                                                <tr>
                                                    <td width="100%" height="10">&nbsp;</td>
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
                        
        </table>
    </body>
    </html>`
}
