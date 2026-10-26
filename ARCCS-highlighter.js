// ==UserScript==
// @name        ARCCS Field Highligher
// @namespace   https://finchleyfoodbank.org.uk/
// REMINDER: Increment this version number every time you update the file!
// @version     1.2.0
// @match       https://groundworkgis.zohocreator.eu/portal/barnet-foodhub
// @grant       none
// @author      FFB
// @description  For ease of filling in ARCSS registration form
// @downloadURL  https://mta-sts.finchleyfoodbank.org.uk/ARCCS-highlighter.js
// @updateURL    https://mta-sts.finchleyfoodbank.org.uk/ARCCS-highlighter.js
// ==/UserScript==

(function() {
    'use strict';

    // Define target fields here (use '*' as a wildcard)
    const TARGET_FIELD_NAMES = [
        "Special Care",
        "Name",
        "Customer type",
        "Email",
        "Phone",
        "Postcode",
        "Street Address",
        "What is your ethnicity *",
        "What kind of support or advice would help you?",
        "Who will this food support?",
        "Do you have any other dietary requirements?",
        "How many people are in your family? (including yourself)",
        "How many adults are in your family? (including yourself)",
        "How many children are in your family?",
        "Appointment Day",
        "Appointment Slot",
        "Date of Birth *",
        "Proof of Address *",
        "Survey Recorder",
        "Notes"
    ];

    // Convert wildcards ('*') to Regular Expressions
    const targetRegexes = TARGET_FIELD_NAMES.map(pattern => {
        const trimmed = pattern.trim();
        const escaped = trimmed.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
        return new RegExp(`^${escaped}$`, 'i');
    });

    // Inject CSS for the highlight styling and custom text layout
    const style = document.createElement('style');
    style.textContent = `
        .tm-highlight-label {
            background-color: #fff3cd !important;
            border: 1px solid #ffc107 !important;
            padding: 2px 6px !important;
            border-radius: 3px !important;
            font-weight: bold !important;
            color: #856404 !important;
        }
        .tm-custom-note {
            display: block;
            margin-top: 6px;
            font-size: 13px;
            color: #333;
            font-weight: 600;
        }
    `;
    document.head.appendChild(style);

    function highlightTargetLabels() {
        const labels = document.querySelectorAll('span.zc-label-text');

        labels.forEach(label => {
            const textContent = label.textContent.trim();
            const isMatch = targetRegexes.some(regex => regex.test(textContent));

            if (isMatch) {
                label.classList.add('tm-highlight-label');
            }
        });
    }

    // Helper to calculate nearest future weekday + 7 weeks (49 days)
    function getFutureDate(targetDayOfWeek, weeksToAdd = 7) {
        const d = new Date();
        const currentDay = d.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, ..., 6 = Sat

        // Find days until next target weekday (if today is that day, advance 7 days to nearest future)
        let daysUntil = (targetDayOfWeek - currentDay + 7) % 7;
        if (daysUntil === 0) daysUntil = 7;

        // Add 7 weeks (7 * 7 = 49 days) onto the nearest target day
        d.setDate(d.getDate() + daysUntil + (weeksToAdd * 7));

        // Format ordinal date: e.g. "15th December"
        const day = d.getDate();
        const month = d.toLocaleString('en-US', { month: 'long' });

        const suffix = (day % 10 === 1 && day !== 11) ? 'st' :
                       (day % 10 === 2 && day !== 12) ? 'nd' :
                       (day % 10 === 3 && day !== 13) ? 'rd' : 'th';

        return `${day}${suffix} ${month}`;
    }

    // Function to inject dynamic note after Appointment Slot
    function addAppointmentSlotNote() {
        const container = document.querySelector('div[zc-field-container="Appointment_Slot"] .form-field');

        if (container && !container.querySelector('.tm-custom-note')) {
            // Target 2 for Tuesday, 6 for Saturday + 7 weeks
            const tuesdayDate = getFutureDate(2, 7);
            const saturdayDate = getFutureDate(6, 7);

            const note = document.createElement('span');
            note.className = 'tm-custom-note';
            note.textContent = `New Tue clients until ${tuesdayDate} | New Sat clients until ${saturdayDate}`;

            container.appendChild(note);
        }
    }

    function processForm() {
        highlightTargetLabels();
        addAppointmentSlotNote();
    }

    // Run on initial load
    processForm();

    // Observe changes for dynamic content
    const observer = new MutationObserver(processForm);
    observer.observe(document.body, { childList: true, subtree: true });
})();
