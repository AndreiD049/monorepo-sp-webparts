# Feedback

## Requirements

Fields:
- Requested/Suggested by
- Title
- Category: Feedback, Suggestion, Testing,
- Description
- Application
- Status
Extra field to be filled in by Test manager / BSG/Product owners:
- Devops IDs
- Owner (team, department or person)
- Possibility to add comments (and make them personal? @KathleenSimons)
- Remarks BU

### Tags
Can only be added by BSG

### Merge:
- Possibility to merge (consilidate) items if they are related. But keep visibility of seperate items that where created.
- Keep a 'main item' and add ad child. If main is completed, the child is also completed
    
### Communication

- Automatic message per mail when items changes status, or is assigned to someone
- Hyperlink / URL  to a specific card
- Use of personal comments (example: @KathleenSimons --> I receive email)

## Feedback form

1. What country is the feedback applicable for? - List of countries (Optional, has 'Other' option)
2. Which system is the feedback related to? - The application for which the feedback is created. List of applications + Not applicable + Other.
3. Type of request: Options such as Testing, Suggestion, Missing functionality, Bug, Inconsistencies + Other. This list should be dynamic.
4. Describe your feedback. Rich text editor with possibility to paste screenshots.
5. Url, link to the page related to the feedback. Is it needed? can user paste the link into the description?
6. Priority. Options, such as 'Cosmetic / Accessability', Critical, High, Medium, Low.

## Roadmap

- [ ] Define list fields and create bootstrap script (powershell)
- [ ] Define routes and url structure
- [ ] Setup page. Start with a simple setup, without any JSON configuration. Just root url and list names
- [ ] Define triggers when notifications are sent
- [ ] Setup notifications

## UI

User lands on his personal page where he sees following info:
- His recent feedbacks
- Other people's recent feedbacks (Idealy that are somehow related to the feedbacks user left, or just any)
- Breakdown of his feedback states. Maybe a bar chart with feedback per state (how many finished, how many new, approved etc)
- Leave a link to https://icons8.com/ somewhere on the app