# Resources & CMS — What's New and How It Works

*A guide for Super Admins and the team.*

We've added a few ways to send content and change requests into our build pipeline. This covers the **Resources** tab in Media Studio and the **CMS** Frontend & Dashboard editors, plus the two actions that hand work off to be built.

> The same explanations are available in-app: click the **ⓘ How it works** button next to the title on the **Media Studio** and **CMS** pages.

---

## 📁 Media Studio → Resources

A new **Resources** tab (next to Photos) for uploading reference material — feature requests, documents, designs, and assets. Each media type has a **Studio** sub-tab (to create) and a **Files** sub-tab (your library).

### Uploading a resource
- Upload a **PDF, JPEG, PNG, Word doc, text file, or other document type** — or paste a **File URL** instead of uploading.
- Add a **Title**, a **Resource type** (Feature request, Reference / documentation, Design / asset, or Other), and **Description / notes**.
- For feature requests, put as much detail as you like in the notes — it's read alongside the file.
- Set **Status** (draft / published) and **Visibility** (private / public / assigned).

### Share & notify Super Admins — *Super Admin only*
- Pick specific **Super Admins** to share a resource with.
- Newly-added Super Admins get a **dashboard notification** when you save — editing later won't re-notify people already on it.
- The **"Share on"** toggles choose where a published resource can appear (Resources page, Frontend home, dashboard, etc.).

---

## 🛠️ CMS → Frontend & Dashboard Editors

The CMS (Super Admin) is where we review pages and collect + triage change requests.

### Overview
The landing tab: quick-launch tiles plus at-a-glance stats — **Pages**, **Open requests**, **Dev Queue** (items flagged for Claude), **In progress**, **Completed**, and recent activity.

### Frontend Editor
Open a public page and leave requests directly on it.
- Click any element (heading, card, section…) to attach an **edit or add request**, with a type and priority.
- Requests re-attach to the same element, so reviewers see exactly what you meant.

### Dashboard Editor (Review button)
The floating **Review** button captures and annotates a dashboard screen, then files a request.
- Dashboard requests include a **screenshot**, can be **shared** with specific recipients, and support a **reply thread**.

### Edit Requests — triage
The **Edit Requests** tab lists everything from both sources, split into **Frontend Edits** and **Dashboard Edits**, viewable as Cards, List, or Table.
- Open any request to **reassign** the requester, change **status** (Open → In progress → Done), **Archive**, or **Delete**.

---

## 🤖 Two actions that hand work off to be built

These appear on **each resource card** and **inside each edit request**:

- **Send to Claude** — adds the item to the **Dev Request Queue**, the list of things flagged to be implemented. It captures all the detail so the request is self-contained. Re-sending just updates the same entry (it won't duplicate), and the button then reads **"Queued for Claude."**
- **Ask Steward** — opens our in-app AI assistant, already loaded with that item, to **summarize** it, **outline** how it'd be built, or **add it to the queue**.

The **Dev Queue** tile on the CMS Overview shows how many items are currently waiting to be built — click it to open Steward and triage.

---

> **Note:** Sharing / notify, Send to Claude, and the Dev Queue are **Super Admin** features.

*Created for More.*
