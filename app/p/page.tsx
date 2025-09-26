import React from "react";

export const metadata = {
	title: "Consent & Opt‑In | Agent Stratos",
	description:
		"Public documentation of how Agent Stratos collects and honors SMS/call consent.",
};

export default function ConsentPage() {
	return (
		<div className="mx-auto max-w-3xl px-6 py-12 prose prose-slate dark:prose-invert">
			<h1>Consent and Opt‑In Disclosure</h1>
			<p>
				Agent Stratos communicates with customers and prospects by SMS and phone
				call to deliver appointment reminders, check‑ins, and support updates. We
				collect consent verbally during live calls and via web forms where
				applicable. This page publicly documents our consent practices for
				carrier review.
			</p>

			<h2>How verbal opt‑in is collected</h2>
			<p>
				During calls initiated by the consumer or by our representatives, the
				agent reads the following consent disclosure and records the consumer’s
				response in our CRM:
			</p>
			<blockquote>
				<p>
					“Before we proceed, can we text you appointment updates and support
					messages at this number? Message and data rates may apply. Message
					frequency varies. Reply STOP to opt out, and HELP for help. Your
					consent is not a condition of purchase. Do you agree to receive these
					messages?”
				</p>
			</blockquote>
			<p>
				If the consumer agrees, the agent confirms verbally and logs the consent
				status, timestamp, and the phone number in the contact record.
			</p>

			<h2>Scope and frequency</h2>
			<ul>
				<li>Purpose: appointment reminders, check‑ins, and account/support notices.</li>
				<li>Frequency: varies by activity; typically 1–6 messages per month.</li>
				<li>Carrier rates: message and data rates may apply.</li>
				<li>Age: service intended for users 18+.</li>
			</ul>

			<h2>Opt‑out and assistance</h2>
			<ul>
				<li>Text <strong>STOP</strong> to end messages at any time.</li>
				<li>Text <strong>HELP</strong> for help.</li>
				<li>
					You can also email <a href="mailto:support@agentstratos.com">support@agentstratos.com</a>
					to revoke consent.
				</li>
			</ul>

			<h2>Data handling</h2>
			<p>
				We store consent status with the contact profile and honor opt‑out
				requests immediately. See our <a href="/privacy">Privacy Policy</a> and
				<a href="/terms">Terms of Service</a> for details.
			</p>

			<p className="text-sm text-muted-foreground">
				Last updated: {new Date().toISOString().slice(0, 10)}
			</p>
		</div>
	);
}


