delete from public.events
where source in ('Gmail', 'Gmail Reminder')
  and (
    title ~* '(payment|credit card|debit card|transaction|invoice|receipt|statement|refund|order|shipped|delivered|verification code|password reset|otp)'
    or title ~* 'sent you a message'
  );
