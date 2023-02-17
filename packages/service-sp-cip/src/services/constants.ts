export const commentBody = (who: string, comment: string, commentLink: string, taskName: string) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!--[if gte mso 9]>
       <xml>
          <o:OfficeDocumentSettings>
             <o:AllowPNG/>
             <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
       </xml>
    <![endif]--><style type="text/css" id="ignore">
    <!-- [if gte mso 9] > body {
        mso-line-height-rule: exactly;
    }

    table {
        border-collapse: collapse;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
    }

    tr {
        mso-line-height-rule: exactly;
    }

    td {
        mso-line-height-rule: exactly;
    }
    <!-- <![endif] -->
    <!-- [if gte mso 15] > body {
        font-size: 0;
        line-height: 0;
        mso-line-height-rule: exactly;
    }

    table {
        border-collapse: collapse;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
    }

    tr {
        font-size: 0px;
        mso-line-height-alt: 0px;
        mso-margin-top-alt: 0px;
        mso-line-height-rule: exactly;
    }

    td {
        mso-line-height-rule: exactly;
    }
    <!-- <![endif] -->
    .MetaData--hideDesktop {
        display: none;
    }

    @media only screen and (max-width: 480px) {
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }
        /* Gmail-specific so this class gets applied */
        * [lang~="MetaData--hideGmail"] {
            display: none !important;
        }

        table {
            width: 100% !important;
        }

            table[class="AutoWidth"] {
                width: auto !important;
            }

        .MobileNoPadding {
            padding: 0 !important;
        }

        .MobileFullWidth {
            width: 100% !important;
        }

        img[class="MobileFullWidth"] {
            height: auto !important;
        }

        .pl12 {
            padding-left: 12px !important;
        }

        .MetaData--hideMobile {
            display: none;
            font-size: 1px;
            color: #333333;
            line-height: 1px;
            max-height: 0px;
            opacity: 0;
            overflow: hidden;
        }

        .MetaData--hideDesktop {
            display: block !important;
        }

        .pbm0 {
            padding-bottom: 0 !important;
        }
    }

    @media only screen and (max-width: 900px) {
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }
    }
</style>
</head>
<body style="-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; margin: 0; padding: 0; background-color: #f8f8f8; width: 800px" dir="ltr">
<!--[if mso]>
        <center>
        <table><tr><td width="640">
    <![endif]-->
<div class="OuterContainer" width="640" style="padding: 0; margin: 0 auto; width: 640px; background-color: #F8F8F8;">
<table class="OuterTable" border="0" cellpadding="0" cellspacing="0" style="mso-table-lspace: 0pt;mso-table-rspace: 0pt;border: 0;font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif;width: 640px;padding: 0;margin: 0 auto">
<!--Comment Mention Header-->
<tbody>
<tr style="mso-line-height-rule: exactly;mso-line-height-alt: 0px;mso-margin-top-alt: 0px;font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif">
<td class="HeaderCell" style="mso-line-height-rule: exactly;font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif;padding: 15px 20px">
</td>
</tr>
<tr style="mso-line-height-rule: exactly;mso-line-height-alt: 0px;mso-margin-top-alt: 0px;font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif">
<td class="ContentCell" style="mso-line-height-rule: exactly;font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif">
<table class="ContentTable" bgcolor="#FFFFFF" align="center" border="0" cellpadding="0" cellspacing="0" width="636px" style="mso-table-lspace: 0pt;mso-table-rspace: 0pt;font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif;border: 1px solid #DEDEDE;width: 636px;padding: 0">
<!-- greeting row -->
<tbody>
<tr style="mso-line-height-rule: exactly;mso-line-height-alt: 0px;mso-margin-top-alt: 0px;font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif">
<td class="InnerHeaderCell" style="mso-line-height-rule: exactly;font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif;padding: 36px 80px;text-align: center">
<img class="GreetingImage" width="36" height="36" alt="Pictogramă @menționare" data-outlook-trace="F:0|T:1" src="https://icons.veryicon.com/png/o/miscellaneous/tiptap-editor/mention-1.png">
<p class="GreetingParagraph" style="padding: 0; margin: 0; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif; margin-top: 20px; font-size: 24px; font-weight: 600; text-align: center; color: #222222; line-height: 32px;">
<span class="GreetingText" style="font-size: 24px; font-weight: 600; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif;"><span>${who} mentioned you in a comment</span>
</span></p>
</td>
</tr>
<!-- content row -->
<tr style="mso-line-height-rule: exactly;mso-line-height-alt: 0px;mso-margin-top-alt: 0px;font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif">
<td class="InnerContentCell" style="mso-line-height-rule: exactly;font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif;padding: 32px 32px 20px 32px;background-color: #F8F8F8;border-top: 1px solid #DEDEDE;border-bottom: 1px solid #DEDEDE">
<table class="ActivityTable" border="0" cellpadding="0" cellspacing="0" width="100%;" style="mso-table-lspace: 0pt;mso-table-rspace: 0pt;border: 0;font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif">
<!-- document name and icon row -->
<tbody>
<tr class="DocumentTitleRow" style="mso-line-height-rule: exactly;mso-line-height-alt: 0px;mso-margin-top-alt: 0px;font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif">
<td class="DocumentIconCell" style="mso-line-height-rule: exactly;width: 56px;height: 56px;vertical-align: middle" height="56px" width="56px" valign="middle" align="center">
<img class="DocumentIcon" width="32" style="border: none; padding: 1px" alt="Pictogramă {0}" data-outlook-trace="F:0|T:1" src="https://icons.veryicon.com/png/o/miscellaneous/standard/task-32.png">
</td>
<td class="DocumentTitleCell" style="mso-line-height-rule: exactly;font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif;font-size: 16px;vertical-align: middle" valign="middle">
<span>In a CIP task &quot;${taskName}&quot;</span> </td>
</tr>
<tr style="mso-line-height-rule: exactly;mso-line-height-alt: 0px;mso-margin-top-alt: 0px;height: 12px" height="12px">
</tr>
<!-- empty row for spacing --><!-- loop of activity item rows -->
<tr class="ActivityRow" style="mso-line-height-rule: exactly;mso-line-height-alt: 0px;mso-margin-top-alt: 0px;font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif">
<td class="ActivityIconCell" style="mso-line-height-rule: exactly;font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif;vertical-align: bottom;width: 48px" valign="bottom" align="center" width="48px">
<img class="ActivityIcon" width="32" alt="Pictogramă @menționare" data-outlook-trace="F:0|T:1" src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/instagram-comment-icon.png">
</td>
<td class="ActivityDescriptionCell" style="mso-line-height-rule: exactly;font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif;font-size: 14px;color: #666666;vertical-align: top" valign="top">
<span style="color: #333333; font-weight: 600;">${who}</span> mentioned you in a comment</td>
</tr>
<tr style="mso-line-height-rule: exactly;mso-line-height-alt: 0px;mso-margin-top-alt: 0px">
<td style="mso-line-height-rule: exactly"></td>
<!-- empty column for spacing -->
<td class="ActivityDescriptionCell" style="mso-line-height-rule: exactly;font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif;padding: 0;font-size: 14px;color: #000000;vertical-align: middle" ,="" valign="middle">
&quot;${comment}&quot;</td>
</tr>
<tr style="mso-line-height-rule: exactly;mso-line-height-alt: 0px;mso-margin-top-alt: 0px;height: 12px">
</tr>
<!-- empty row for spacing -->
</tbody>
</table>
</td>
</tr>
<!-- call to action row -->
<tr style="mso-line-height-rule: exactly;mso-line-height-alt: 0px;mso-margin-top-alt: 0px;font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif">
<td class="InnerButtonCell" style="mso-line-height-rule: exactly;padding: 32px 0;height: 40px;text-align: center;border-top: none;border-bottom: none">
<!-- creating a dummy table to correct spacing issues, and disable clicks on empty sapces around the CTA -->
<table style="mso-table-lspace: 0pt;mso-table-rspace: 0pt;width: 100%">
<tbody>
<tr style="mso-line-height-rule: exactly;mso-line-height-alt: 0px;mso-margin-top-alt: 0px">
<td style="mso-line-height-rule: exactly"></td>
<td style="mso-line-height-rule: exactly;width: 184px"></td>
<td style="mso-line-height-rule: exactly"></td>
</tr>
<tr style="mso-line-height-rule: exactly;mso-line-height-alt: 0px;mso-margin-top-alt: 0px;height: 40px">
<td style="mso-line-height-rule: exactly"></td>
<td style="mso-line-height-rule: exactly;width: 184px"><!--[if mso]>
                <a href="${commentLink}">
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${commentLink}" style="height:40px;v-text-anchor:middle;width:184px" arcsize="2%" strokecolor="#0078D7" fillcolor="#0078D7">
                        <w:anchorlock/>
                        <center style="color:#ffffff;font-family: 'Segoe UI', sans-serif;font-size:16px"> Open task </center>
                    </v:roundrect>
                </a>
                <![endif]--><!--[if !mso]> <!----><a href="${commentLink}" class="OpenButton" style="display: inline-block; font-size: 16px; color: #ffffff; background-color: #0078D7; border-color: #0078D7; border-radius:3px;border-style:solid; text-decoration: none;text-align:center;line-height:38px;width:184px">Open comment</a><!-- <![endif]--></td>
<td style="mso-line-height-rule: exactly"></td>
</tr>
<tr style="mso-line-height-rule: exactly;mso-line-height-alt: 0px;mso-margin-top-alt: 0px">
<td style="mso-line-height-rule: exactly"></td>
<td style="mso-line-height-rule: exactly;width: 184px"></td>
<td style="mso-line-height-rule: exactly"></td>
</tr>
</tbody>
</table>
</td>
</tr>
<tr style="mso-line-height-rule: exactly;mso-line-height-alt: 0px;mso-margin-top-alt: 0px;font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif">
</tr>
</tbody>
</table>
</td>
</tr>
<!-- End Module --><!--[if mso]>
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;max-width:640px;overflow:hidden;table-layout:fixed;" width="640">
<![endif]--><!--[if !mso]><!---->
</tbody>
</table>
</div>
<!--[if mso]>
        </td></tr></table>
        </center>
    <![endif]--><img aria-hidden="true" role="presentation" height="1" width="1" istrackingpixel="true" src="https://northeuroper-notifyp.svc.ms:443/api/v2/tracking/method/View?mi=t8IPWsp1I0aiZL3Y9G8siQ">
</body>
</html>
`;