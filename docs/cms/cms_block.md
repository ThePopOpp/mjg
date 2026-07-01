# MJG CMS Blocks and Customization Options

This file defines the block library for the MJG WebApp CMS and future Experience Builder. These blocks should support frontend page editing, dashboard-based page building, role-based visibility, form integration, automations, and AI Agent Steward support.

The CMS should allow Super Admin users to add, edit, reorder, duplicate, hide, delete, preview, and publish blocks. AI-generated blocks should always remain in draft status until reviewed and published by a Super Admin.

---

## 1. Section Block

A full-width page section used to group content.

### Customization Options

- Background color
- Background image
- Background video
- Background gradient
- Overlay color
- Overlay opacity
- Padding top / right / bottom / left
- Margin top / bottom
- Max width
- Full width or contained layout
- Border radius
- Border style
- Box shadow
- Vertical alignment
- Horizontal alignment
- Visibility by device
- Visibility by user role
- Animation on scroll

---

## 2. Row Block

A horizontal layout container inside a section.

### Customization Options

- Number of columns
- Column gap
- Row gap
- Alignment
- Max width
- Padding
- Margin
- Background color
- Border
- Border radius
- Reverse order on mobile
- Stack columns on mobile

---

## 3. Column Block

A vertical content area inside a row.

### Customization Options

- Column width
- Background color
- Padding
- Margin
- Border radius
- Border
- Shadow
- Vertical alignment
- Horizontal alignment
- Minimum height
- Responsive width
- Hide/show by device
- Hide/show by user role

---

## 4. Heading Block

Used for page titles, section titles, and feature titles.

### Customization Options

- Heading level: H1, H2, H3, H4, H5, H6
- Text content
- Font family
- Font size
- Font weight
- Line height
- Letter spacing
- Text color
- Text alignment
- Margin
- Padding
- Max width
- Highlight word or phrase
- Optional eyebrow text
- Animation

---

## 5. Subtitle Block

Used below headings for supporting text.

### Customization Options

- Text content
- Font size
- Font weight
- Line height
- Text color
- Text alignment
- Max width
- Margin
- Padding
- Responsive font size

---

## 6. Paragraph / Rich Text Block

Used for body copy, descriptions, instructions, and longer-form content.

### Customization Options

- Text content
- Rich text formatting
- Bold / italic / underline
- Links
- Bullet lists
- Numbered lists
- Text color
- Font size
- Line height
- Text alignment
- Max width
- Padding
- Margin

---

## 7. Image Block

Used for photos, illustrations, logos, diagrams, or visual resources.

### Customization Options

- Image upload / media library selection
- Alt text
- Caption
- Width
- Height
- Object fit
- Alignment
- Border radius
- Border
- Shadow
- Link image to URL
- Open link in new tab
- Lazy load
- Mobile image replacement
- Hide/show by device

---

## 8. Video Block

Used for embedded videos, uploaded videos, walkthroughs, and lessons.

### Customization Options

- Video upload or embed URL
- Poster image
- Autoplay
- Muted
- Loop
- Controls on/off
- Aspect ratio
- Border radius
- Shadow
- Caption
- Padding
- Margin
- Visibility by user role

---

## 9. Button Block

Used for CTAs, navigation, booking links, downloads, and dashboard actions.

### Customization Options

- Button text
- Button URL
- Open in same tab or new tab
- Button style: primary, secondary, outline, ghost
- Background color
- Text color
- Border color
- Border radius
- Padding
- Font size
- Font weight
- Icon before / after text
- Alignment
- Full width on mobile
- Tracking event
- Role-based visibility

---

## 10. Link Block

Used for inline or standalone links.

### Customization Options

- Link text
- URL
- Open in new tab
- Text color
- Hover color
- Underline on/off
- Font size
- Font weight
- Icon
- Alignment

---

## 11. Card Block

Used for feature cards, service cards, stewardship categories, dashboard summaries, or resource previews.

### Customization Options

- Card title
- Subtitle
- Body text
- Icon
- Image
- Button
- Background color
- Border color
- Border radius
- Shadow
- Padding
- Text alignment
- Card layout: vertical or horizontal
- Hover effect
- Link entire card
- Role-based visibility

---

## 12. Card Grid Block

Used to display multiple cards in a grid.

### Customization Options

- Number of columns
- Card gap
- Stack on mobile
- Equal height cards
- Background color
- Padding
- Card style
- Card hover animation
- Card ordering
- Responsive columns

---

## 13. Icon Block

Used for simple visual cues.

### Customization Options

- Icon selection
- Icon upload
- Icon size
- Icon color
- Background shape
- Background color
- Border radius
- Alignment
- Margin
- Animation

---

## 14. Divider Block

Used to separate sections or content groups.

### Customization Options

- Line color
- Line width
- Line style: solid, dashed, dotted
- Thickness
- Margin top / bottom
- Max width
- Alignment

---

## 15. Spacer Block

Used to create vertical or horizontal spacing.

### Customization Options

- Height desktop
- Height tablet
- Height mobile
- Width
- Responsive spacing

---

## 16. Form Block

Used to collect user information, stewardship inputs, assessments, applications, or requests.

### Customization Options

- Select existing form
- Create new form
- Form title
- Form description
- Fields
- Required fields
- Placeholder text
- Field help text
- Submit button text
- Success message
- Redirect after submit
- Email notification
- Staff notification
- AI Agent notification
- Automation trigger
- Assign response to user
- Assign response to Experience
- Role-based visibility

---

## 17. Form Field Block

Used inside custom forms.

### Field Types

- Text
- Email
- Phone
- Textarea
- Number
- Date
- Time
- Dropdown
- Multi-select
- Checkbox
- Radio buttons
- File upload
- Signature
- Hidden field
- Conditional field

### Customization Options

- Label
- Placeholder
- Help text
- Required / optional
- Default value
- Validation rules
- Conditional logic
- Connected user field
- Connected automation field
- CRM field mapping
- AI Agent field context

---

## 18. Accordion / FAQ Block

Used for FAQs, guidance sections, and expandable explanations.

### Customization Options

- Accordion items
- Question/title
- Answer/body
- Default open item
- Allow multiple open items
- Icon style
- Border
- Background color
- Text color
- Padding
- Role-based visibility

---

## 19. Tabs Block

Used to organize content into tabbed sections.

### Customization Options

- Tab labels
- Tab content blocks
- Default active tab
- Tab alignment
- Tab style
- Background color
- Active tab color
- Border radius
- Mobile behavior

---

## 20. Step / Process Block

Used for guided experiences, onboarding, stewardship journeys, and multi-step instructions.

### Customization Options

- Step title
- Step description
- Step number
- Icon
- Button
- Completion status
- Required step
- Optional step
- Unlock rules
- Progress tracking
- Role-based visibility
- Automation trigger when complete

---

## 21. Timeline Block

Used for journey-based experiences, planning timelines, and milestone tracking.

### Customization Options

- Timeline items
- Date or step label
- Title
- Description
- Icon
- Color
- Vertical or horizontal layout
- Completed / active / upcoming status
- User-specific progress

---

## 22. Resource / Download Block

Used for PDFs, worksheets, guides, and downloadable files.

### Customization Options

- File upload
- Resource title
- Description
- Button text
- Thumbnail
- File type label
- Download tracking
- Role-based access
- Require login
- Notify staff when downloaded
- AI Agent context tagging

---

## 23. PDF Viewer Block

Used to display uploaded PDFs directly inside an Experience.

### Customization Options

- PDF upload
- Viewer height
- Show toolbar
- Allow download
- Allow print
- Page start
- Fullscreen option
- Role-based visibility
- AI Agent reading/indexing enabled

---

## 24. Embed Block

Used for external tools, calendars, forms, videos, or third-party content.

### Customization Options

- Embed code
- URL embed
- iFrame height
- iFrame width
- Border radius
- Padding
- Allow fullscreen
- Mobile behavior

---

## 25. Booking Block

Used to let users schedule with Mike, staff, or planners.

### Customization Options

- Booking type
- Staff member
- Calendar source
- Meeting duration
- Button text
- Embed calendar or link button
- Confirmation message
- Role-based visibility
- Automation after booking
- Staff notification

---

## 26. Alert / Notice Block

Used for important dashboard messages, instructions, reminders, or status updates.

### Customization Options

- Notice type: info, success, warning, error
- Title
- Message
- Icon
- Background color
- Border color
- Text color
- Dismissible
- Expiration date
- Role-based visibility

---

## 27. Testimonial / Quote Block

Used for quotes, testimonials, scripture, mission statements, or key principles.

### Customization Options

- Quote text
- Author
- Role/title
- Image
- Background color
- Quote mark style
- Border
- Border radius
- Text alignment
- Font style

---

## 28. Scripture / Principle Block

Used for faith-based content within MJG Experiences.

### Customization Options

- Scripture reference
- Scripture text
- Reflection text
- Background color
- Accent color
- Text alignment
- Version label
- Optional devotional prompt
- AI Agent discussion prompt

---

## 29. Checklist Block

Used for action items, readiness steps, and user progress.

### Customization Options

- Checklist items
- Required / optional
- User can check off items
- Save progress
- Completion percentage
- Trigger automation on completion
- Unlock next step when complete
- Staff notification

---

## 30. Progress Block

Used to show progress through an Experience.

### Customization Options

- Progress type: bar, steps, circle, checklist
- Current progress
- Completed steps
- Remaining steps
- Color
- Label
- User-specific progress
- Role-based visibility

---

## 31. User Assignment Block

Used inside Experiences to assign content, tasks, or forms to users.

### Customization Options

- Assign to role
- Assign to specific user
- Assign to user group
- Assign to household/family
- Start date
- Due date
- Completion requirement
- Notification rules
- AI Agent follow-up rules

---

## 32. Automation Trigger Block

Used to define what happens when a user interacts with content.

### Trigger Types

- Page viewed
- Form submitted
- Button clicked
- PDF downloaded
- Step completed
- Checklist completed
- User assigned
- Experience completed
- Inactivity detected

### Customization Options

- Trigger event
- Conditions
- Delay
- Email notification
- SMS notification
- Staff alert
- AI Agent follow-up
- Update user status
- Add tag
- Assign next Experience

---

## 33. AI Agent Prompt Block

Used to connect a page or Experience to Steward, the MJG AI Agent.

### Customization Options

- Prompt title
- Prompt instructions
- User-facing prompt
- Internal system prompt
- Allowed context
- Connected PDF
- Connected form fields
- Connected user profile data
- Suggested questions
- Response style
- Escalation rules
- Save conversation summary
- Notify staff when needed

---

## 34. AI Generated Content Block

Used for draft sections created by Steward.

### Customization Options

- Generated title
- Generated body
- Source prompt
- Source PDF
- Approval status
- Edit before publish
- Regenerate option
- Lock block after approval
- Version history

---

## 35. Experience Hero Block

Used as the top section for a custom Experience page.

### Customization Options

- Experience title
- Subtitle
- Eyebrow label
- Background image
- Background color
- CTA button
- Progress indicator
- Assigned role
- Start button
- Continue button
- Completion status

---

## 36. Experience Step Block

Used to build guided user journeys.

### Customization Options

- Step title
- Step description
- Step content
- Required action
- Connected form
- Connected download
- Connected video
- Connected AI prompt
- Completion trigger
- Unlock next step
- Staff notification

---

## 37. Dashboard Widget Block

Used to place custom widgets inside the user dashboard.

### Customization Options

- Widget title
- Widget type
- User role visibility
- Data source
- CTA button
- Status badge
- Progress display
- Form shortcut
- Booking shortcut
- AI Agent shortcut

---

## 38. CTA Section Block

Used for strong calls to action.

### Customization Options

- Heading
- Subheading
- Body text
- Primary button
- Secondary button
- Background color
- Background image
- Overlay
- Text alignment
- Padding
- Border radius
- Role-based visibility
- Automation trigger on click

---

## 39. Media Gallery Block

Used for image collections, videos, or visual resources.

### Customization Options

- Gallery images
- Captions
- Layout: grid, masonry, carousel
- Columns
- Gap
- Lightbox
- Border radius
- Image ratio
- Mobile behavior

---

## 40. HTML Block

Used for custom HTML snippets, embeds, handcrafted page sections, custom layouts, or advanced frontend content that cannot be created with standard blocks.

This block should be treated as an advanced Super Admin-only block because custom HTML can affect layout, styling, accessibility, and security.

### Customization Options

- HTML code
- Optional scoped CSS
- Optional JavaScript toggle, if allowed by the app security model
- Preview before publish
- Syntax highlighting
- HTML validation
- Sanitize unsafe HTML
- Block-level wrapper class
- Custom CSS class
- Custom ID
- Margin
- Padding
- Background color
- Border radius
- Border
- Shadow
- Role-based visibility
- Device visibility
- Admin-only editing
- Safety warning before publishing
- Version history
- Restore previous version
- Lock block after approval

### Security Requirements

- Only Super Admin users should be able to create or edit HTML blocks.
- Scripts should be disabled by default.
- JavaScript should require a specific app-level permission or feature flag.
- HTML should be sanitized where possible.
- The CMS should warn users before publishing custom HTML.
- The block should support draft preview before publishing.
- HTML blocks should be included in audit logs.

---

## 41. Custom Code Block

Used for advanced custom code when needed beyond HTML-only snippets.

This should be separate from the HTML Block if the app eventually allows CSS or JavaScript.

### Customization Options

- HTML
- CSS
- JavaScript toggle, if allowed
- Admin-only editing
- Safety warning
- Preview before publish
- Restrict to Super Admin only
- Audit logging
- Version history
- Rollback support

---

# Global Block Settings

Every block should support these standard controls where appropriate.

## Layout

- Width
- Max width
- Height
- Min height
- Display type
- Alignment
- Justify content
- Grid / flex settings
- Responsive stacking

## Spacing

- Padding top / right / bottom / left
- Margin top / right / bottom / left
- Gap
- Column gap
- Row gap

## Typography

- Font family
- Font size
- Font weight
- Line height
- Letter spacing
- Text transform
- Text color
- Text alignment

## Background

- Background color
- Background image
- Background video
- Gradient
- Overlay color
- Overlay opacity

## Border

- Border width
- Border color
- Border style
- Border radius

## Effects

- Box shadow
- Text shadow
- Hover effect
- Animation
- Transition speed
- Scroll animation

## Responsive Controls

- Desktop settings
- Tablet settings
- Mobile settings
- Hide on desktop
- Hide on tablet
- Hide on mobile
- Stack on mobile
- Reverse order on mobile

## Visibility and Permissions

- Public
- Logged-in users only
- Super Admin only
- Staff only
- Specific role
- Specific user
- Specific Experience assignment
- Conditional visibility based on form completion
- Conditional visibility based on progress

## AI Agent / Steward Settings

- Allow Steward to read this block
- Allow Steward to summarize this block
- Allow Steward to edit draft version
- Allow Steward to suggest improvements
- Connect block to uploaded PDF
- Connect block to form responses
- Connect block to user profile
- Escalate user questions to staff
- Save block interaction summary

## Automation Settings

- Trigger on view
- Trigger on click
- Trigger on form submit
- Trigger on completion
- Send email
- Send SMS
- Notify staff
- Assign next step
- Update user role
- Add user tag
- Update Experience progress

## Publishing Settings

- Draft
- Published
- Hidden
- Archived
- Scheduled publish date
- Scheduled expiration date
- Revision history
- Restore previous version
- Lock block from editing

---

# Implementation Notes

The first CMS block implementation should prioritize stability and usability over complexity.

Recommended first version blocks:

1. Section Block
2. Row Block
3. Column Block
4. Heading Block
5. Paragraph / Rich Text Block
6. Image Block
7. Button Block
8. Card Block
9. Form Block
10. Resource / Download Block
11. HTML Block

Advanced blocks, AI-generated blocks, automation blocks, and Experience-specific blocks can be added after the core CMS editor and publishing workflow are stable.
