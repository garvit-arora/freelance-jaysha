export function helpdeskEmail(kind, row, submitterEmail) {
  const email = (submitterEmail || '').trim().toLowerCase()
  if (email && email !== 'jayshasingyan03@gmail.com') {
    const boyfriend = email === 'lakshyagrover01@gmail.com'
    const name = boyfriend ? 'Lakshya (your boyfriend)' : 'A signed-in account'
    const details = kind === 'complaint' ? `* Complaint category: ${row.category}\n* Description: ${row.incident}\n* Severity: ${row.severity}`
      : kind === 'request' ? `* Request category: ${row.category}\n* Description: ${row.description}\n* Priority: ${row.urgency}`
      : kind === 'date-booking' ? `* Preferred date: ${row.preferred_date}\n* Type of date: ${row.experience}\n* Special requests: ${row.details || 'None specified'}` : null
    if (!details) throw new Error('Unknown helpdesk department')
    const label = kind === 'date-booking' ? 'date request' : kind
    return { subject: `Girlfriend Helpdesk - ${boyfriend ? 'From your boyfriend' : 'Submission received'}: ${label}`, message: `Hey Jaysha,

${name} has submitted a ${label} through the Girlfriend Helpdesk.

${details}

${kind === 'date-booking' ? 'This is a date request, not yet a confirmed reservation. Let us work out the final plan together.' : boyfriend ? 'These are the details he wanted to share with you.' : 'These are the details submitted through the helpdesk.'}

With love,
${boyfriend ? 'Your Boyfriend, Lakshya' : 'Girlfriend Helpdesk'}` }
  }
  if (kind === 'complaint') return { subject: 'Girlfriend Helpdesk — Complaint received', message: `Hey Jaysha,

Submitted by: Jaysha (girlfriend)

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

Submitted by: Jaysha (girlfriend)

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

Submitted by: Jaysha (girlfriend)

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
