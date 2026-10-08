<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KolehiYohoo! - Institutional Verification Application Status</title>
</head>
<body style="font-family: Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #333333; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
        <p style="margin: 0 0 16px 0; font-size: 17px;"><strong>KolehiYOHOO! {{ $repName }}!</strong></p>

        <p style="margin: 0 0 16px 0;">We are pleased to inform you that your institutional verification request for <strong>{{ $schoolName }}</strong> has been officially approved by our team.</p>

        <p style="margin: 0 0 16px 0;">Your institutional administrator account has been created. You can now log in to the KolehiYohoo Institution Portal to manage and update your academic programs and campus profile:</p>

        <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 14px 18px; margin: 0 0 16px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0;"><strong>Portal URL:</strong> <a href="https://kolehiyohoo.app" style="color: #2563eb; text-decoration: underline;">kolehiyohoo.app</a></p>
            <p style="margin: 0 0 8px 0;"><strong>Email:</strong> {{ $email }}</p>
            <p style="margin: 0;"><strong>Temporary Password:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">{{ $temp_password }}</code></p>
        </div>

        <p style="margin: 0 0 16px 0;">For security purposes, please log in at your earliest convenience and update your password.</p>

        <p style="margin: 0 0 24px 0;">If you have any questions or require assistance managing your account, please feel free to contact us.</p>

        <p style="margin: 0; color: #555555;">Best regards,<br><strong>KolehiYohoo Admin Team</strong></p>
    </div>
</body>
</html>
