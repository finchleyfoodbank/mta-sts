// ==UserScript==
// @name        ARCCS Field Highligher
// @namespace   Violentmonkey Scripts
// @icon
// @version     1.0.0
// @match       https://groundworkgis.zohocreator.eu/portal/barnet-foodhub
// @grant       none
// @author      -
// @description
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
        "Date of Birth *", // Matches "Date of Birth Adult 1", "Date of Birth Child 2", etc.
        "Proof of Address *", // As above but for PoA
        "Survey Recorder",
        "Notes"
    ];

    // Convert wildcards ('*') to Regular Expressions
    const targetRegexes = TARGET_FIELD_NAMES.map(pattern => {
        const trimmed = pattern.trim();
        // Escape special regex characters except '*', then convert '*' to '.*'
        const escaped = trimmed.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
        return new RegExp(`^${escaped}$`, 'i'); // 'i' makes it case-insensitive
    });

    // Inject CSS for the highlight styling
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
    `;
    document.head.appendChild(style);

    function highlightTargetLabels() {
        const labels = document.querySelectorAll('span.zc-label-text');

        labels.forEach(label => {
            const textContent = label.textContent.trim();
            // Test if the text matches any of the RegEx patterns
            const isMatch = targetRegexes.some(regex => regex.test(textContent));

            if (isMatch) {
                label.classList.add('tm-highlight-label');
            }
        });
    }

    // Run on initial load
    highlightTargetLabels();

    // Observe changes for dynamic content
    const observer = new MutationObserver(highlightTargetLabels);
    observer.observe(document.body, { childList: true, subtree: true });
})();
