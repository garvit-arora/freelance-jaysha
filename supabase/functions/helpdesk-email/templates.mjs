export function helpdeskEmail(kind, row) {
  if (kind === 'complaint') return { subject: 'Girlfriend Helpdesk — Complaint received', message: `Hey Jaysha,

Your complaint has officially been received by the Girlfriend Helpdesk.

Complaint details

* Complaint category: ${row.category}
* Description: ${row.incident}
* Severity: ${row.severity}

Your complaint has been forwarded to the accused, who has been instructed to review the matter and take appropriate action.

Thank you for bringing this matter to our attention. We apologise for any inconvenience caused by your boyfriend’s questionable behaviour.

With love,
Girlfriend Helpdesk
(Management is currently being handled by the accused himself.)` }
  if (kind === 'request') return { subject: 'Girlfriend Helpdesk — Request received', message: `Hey Jaysha,

Your request has been successfully submitted to the Girlfriend Helpdesk.

Request details

* Request category: ${row.category}
* Description: ${row.description}
* Priority: ${row.urgency}

Your boyfriend has been notified and will attend to your request according to the priority selected.

Thank you for trusting us with your happiness. We look forward to making your day a little more special.

With love,
Your Personal Boyfriend
Girlfriend Helpdesk` }
  if (kind === 'date-booking') return { subject: 'Girlfriend Helpdesk — Date request received', message: `Hey Jaysha,

Your date request has officially been received. Your personal date planner is delighted to have been selected for this very important assignment.

Your date details

* Preferred date: ${row.preferred_date}
* Type of date: ${row.experience}
* Special requests: ${row.details || 'None specified'}

Your boyfriend will review your preferences and get back to you with the final plan.

Please note that this is a date request, not yet a confirmed reservation. Your personal date planner will confirm the details with you shortly.

Until then, start getting excited. ❤️

With love,
Your Personal Date Planner
Girlfriend Helpdesk` }
  throw new Error('Unknown helpdesk department')
}
