import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

const FROM = `Budget by ZOD <${process.env.EMAIL_USER ?? 'noreply@gmail.com'}>`
const APP  = process.env.NEXT_PUBLIC_APP_NAME ?? 'Budget by ZOD'
const URL  = process.env.NEXT_PUBLIC_APP_URL  ?? 'http://localhost:3000'

// ── helpers ──────────────────────────────────────────────────────────────────
function baseLayout(body: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    body { font-family: Inter, Arial, sans-serif; background:#f9fafb; margin:0; padding:0; }
    .wrap { max-width:600px; margin:32px auto; background:#fff; border-radius:12px;
            border:1px solid #e5e7eb; overflow:hidden; }
    .header { background:linear-gradient(135deg,#4f46e5,#7c3aed); padding:28px 32px; }
    .header h1 { color:#fff; margin:0; font-size:22px; }
    .header p  { color:#c7d2fe; margin:4px 0 0; font-size:14px; }
    .body { padding:32px; color:#374151; font-size:15px; line-height:1.6; }
    .card { background:#f3f4f6; border-radius:8px; padding:20px; margin:20px 0; }
    .amount { font-size:28px; font-weight:700; color:#4f46e5; }
    .badge-red   { display:inline-block; background:#fee2e2; color:#991b1b;
                   padding:4px 12px; border-radius:20px; font-size:13px; }
    .badge-green { display:inline-block; background:#dcfce7; color:#166534;
                   padding:4px 12px; border-radius:20px; font-size:13px; }
    .btn { display:inline-block; background:#4f46e5; color:#fff; padding:12px 28px;
           border-radius:8px; text-decoration:none; font-weight:600; margin:16px 0; }
    .footer { background:#f9fafb; padding:20px 32px; text-align:center;
              font-size:12px; color:#9ca3af; border-top:1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>💰 ${APP}</h1>
      <p>Your personal finance assistant</p>
    </div>
    <div class="body">${body}</div>
    <div class="footer">
      © ${new Date().getFullYear()} ${APP} · <a href="${URL}" style="color:#6366f1">Open App</a>
    </div>
  </div>
</body>
</html>`
}

async function sendMail(to: string, subject: string, html: string): Promise<void> {
  await transporter.sendMail({ from: FROM, to, subject, html })
}

// ── exported senders ──────────────────────────────────────────────────────────
export async function sendBudgetExceededEmail(opts: {
  to:       string
  name:     string
  category: string
  spent:    number
  budget:   number
  currency: string
}): Promise<void> {
  const over = opts.spent - opts.budget
  const pct  = ((opts.spent / opts.budget) * 100).toFixed(0)

  await sendMail(
    opts.to,
    `⚠️ Budget Alert: ${opts.category} limit exceeded`,
    baseLayout(`
      <p>Hi <strong>${opts.name}</strong>,</p>
      <p>Your <strong>${opts.category}</strong> budget has been exceeded this month.</p>
      <div class="card">
        <div class="amount">${opts.currency} ${opts.spent.toFixed(2)}</div>
        <p style="margin:4px 0;color:#6b7280">Spent · Budget was ${opts.currency} ${opts.budget.toFixed(2)}</p>
        <span class="badge-red">${pct}% of budget used · ${opts.currency} ${over.toFixed(2)} over</span>
      </div>
      <p>Consider reviewing your ${opts.category} spending to get back on track.</p>
      <a href="${URL}/dashboard/budget" class="btn">View Budget</a>
    `),
  )
}

export async function sendLowBalanceEmail(opts: {
  to:        string
  name:      string
  balance:   number
  threshold: number
  currency:  string
}): Promise<void> {
  await sendMail(
    opts.to,
    `🔴 Low Balance Alert — ${opts.currency} ${opts.balance.toFixed(2)} remaining`,
    baseLayout(`
      <p>Hi <strong>${opts.name}</strong>,</p>
      <p>Your account balance has dropped below your alert threshold of <strong>${opts.currency} ${opts.threshold.toFixed(2)}</strong>.</p>
      <div class="card">
        <div class="amount" style="color:#dc2626">${opts.currency} ${opts.balance.toFixed(2)}</div>
        <p style="margin:4px 0;color:#6b7280">Current Balance</p>
        <span class="badge-red">Below ${opts.currency} ${opts.threshold.toFixed(2)} threshold</span>
      </div>
      <p>Review your recent transactions and consider reducing discretionary spending.</p>
      <a href="${URL}/dashboard" class="btn">Go to Dashboard</a>
    `),
  )
}

export async function sendWeeklySummaryEmail(opts: {
  to:          string
  name:        string
  income:      number
  expenses:    number
  balance:     number
  currency:    string
  topCategory: string
  savingsRate: number
}): Promise<void> {
  const saved = opts.income - opts.expenses
  await sendMail(
    opts.to,
    `📊 Your Weekly Financial Summary`,
    baseLayout(`
      <p>Hi <strong>${opts.name}</strong>, here's your weekly snapshot:</p>
      <div class="card">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:8px 0;color:#6b7280">Total Income</td>
            <td style="text-align:right;font-weight:600;color:#16a34a">${opts.currency} ${opts.income.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280">Total Expenses</td>
            <td style="text-align:right;font-weight:600;color:#dc2626">${opts.currency} ${opts.expenses.toFixed(2)}</td>
          </tr>
          <tr style="border-top:1px solid #e5e7eb">
            <td style="padding:12px 0 4px;font-weight:600">Balance</td>
            <td style="text-align:right;font-weight:700;font-size:18px;color:#4f46e5">${opts.currency} ${opts.balance.toFixed(2)}</td>
          </tr>
        </table>
      </div>
      <p>🏆 Top spending category: <strong>${opts.topCategory}</strong></p>
      <p>💰 Savings rate this period: <strong>${opts.savingsRate.toFixed(1)}%</strong>
         ${opts.savingsRate >= 20 ? '<span class="badge-green">On Track</span>' : '<span class="badge-red">Needs Work</span>'}</p>
      ${saved > 0
        ? `<p style="color:#16a34a">✅ You saved <strong>${opts.currency} ${saved.toFixed(2)}</strong> — great work!</p>`
        : `<p style="color:#dc2626">⚠️ You spent <strong>${opts.currency} ${Math.abs(saved).toFixed(2)}</strong> more than you earned this period.</p>`
      }
      <a href="${URL}/dashboard/analytics" class="btn">View Full Report</a>
    `),
  )
}

export async function sendWelcomeEmail(opts: { to: string; name: string }): Promise<void> {
  await sendMail(
    opts.to,
    `Welcome to ${APP} 🎉`,
    baseLayout(`
      <p>Hi <strong>${opts.name}</strong>, welcome aboard!</p>
      <p>${APP} is your personal finance companion. Here's how to get started:</p>
      <ol style="padding-left:20px;line-height:2">
        <li>Set your <strong>monthly income</strong> in Settings</li>
        <li>Add your first <strong>transaction</strong></li>
        <li>Set <strong>budget limits</strong> per category</li>
        <li>Watch the <strong>analytics</strong> work their magic</li>
      </ol>
      <a href="${URL}/dashboard" class="btn">Go to Dashboard</a>
    `),
  )
}
