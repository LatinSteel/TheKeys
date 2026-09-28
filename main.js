// ================================
// The Keys
// ================================


// Human-readable topic names
const topicNames = {
    theRock: "The Rock",
    papalPrimacy: "Papal Primacy",
    papalGovernorship: "Papal Governorship",
    principleOfUnity: "Principle of Unity"
};


// Holds the complete database after it loads
let allQuotes = [];


// ================================
// Load Quotes
// ================================

fetch("quotes.json")

    .then(response => {

        if (!response.ok) {
            throw new Error("Could not load quotes.json");
        }

        return response.json();
    })

    .then(quotes => {

        allQuotes = quotes;

        // Sort chronologically
        allQuotes.sort(
            (a, b) => getQuoteStartYear(a) - getQuoteStartYear(b)
        );

        // Generate filter options from JSON
        buildFilters(allQuotes);

        // Show everything initially
        displayQuotes(allQuotes);

        // Activate filters
        setupFilterListeners();
    })

    .catch(error => {

        console.error("Error loading quotes:", error);

        document.getElementById("quotes-container").innerHTML =
            "<p>There was an error loading the quotations.</p>";
    });


// ================================
// Years
// ================================

function getQuoteStartYear(quote) {

    const year = Number(quote.startYear);

    if (Number.isNaN(year)) {
        console.error("Invalid start year:", quote);
        return 0;
    }

    return year;
}


function getQuoteEndYear(quote) {

    if (
        quote.endYear !== undefined &&
        quote.endYear !== null &&
        quote.endYear !== ""
    ) {
        return Number(quote.endYear);
    }

    return getQuoteStartYear(quote);
}


// ================================
// Determine 150-Year Section
// ================================

function getYearRange(year) {

    year = Number(year);

    if (year < 150) {

        return {
            start: 33,
            end: 149,
            label: "33–149 AD"
        };
    }

    const start =
        150 + Math.floor((year - 150) / 150) * 150;

    const end = start + 149;

    return {
        start: start,
        end: end,
        label: `${start}–${end} AD`
    };
}


// ================================
// Build Filter Lists
// ================================

function buildFilters(quotes) {

    populateSelect(
        "filter-author",
        getUniqueValues(quotes, "author")
    );

    populateSelect(
        "filter-source",
        getUniqueValues(quotes, "source")
    );

    populateSelect(
        "filter-source-type",
        getUniqueValues(quotes, "sourceType")
    );

    populateSelect(
        "filter-language",
        getUniqueValues(quotes, "language")
    );

    populateSelect(
        "filter-region",
        getUniqueValues(quotes, "region")
    );

    populateTopicFilter(quotes);
}


// ================================
// Get Unique Values From JSON
// ================================

function getUniqueValues(quotes, property) {

    return [
        ...new Set(
            quotes
                .map(quote => quote[property])
                .filter(value =>
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                )
        )
    ].sort((a, b) =>
        String(a).localeCompare(String(b))
    );
}


// ================================
// Populate Normal Select
// ================================

function populateSelect(selectId, values) {

    const select =
        document.getElementById(selectId);

    values.forEach(value => {

        const option =
            document.createElement("option");

        option.value = value;
        option.textContent = value;

        select.appendChild(option);
    });
}


// ================================
// Populate Topic Select
// ================================

function populateTopicFilter(quotes) {

    const topicKeys = new Set();


    quotes.forEach(quote => {

        if (!quote.topics) {
            return;
        }

        Object.entries(quote.topics)
            .forEach(([topic, enabled]) => {

                // Only include categories that occur as true
                // somewhere in the database.

                if (enabled === true) {
                    topicKeys.add(topic);
                }
            });
    });


    const select =
        document.getElementById("filter-topic");


    [...topicKeys]
        .sort((a, b) => {

            const nameA = topicNames[a] || a;
            const nameB = topicNames[b] || b;

            return nameA.localeCompare(nameB);
        })

        .forEach(topic => {

            const option =
                document.createElement("option");

            option.value = topic;

            option.textContent =
                topicNames[topic] || topic;

            select.appendChild(option);
        });
}


// ================================
// Filter Event Listeners
// ================================

function setupFilterListeners() {

    const filterToggle =
    document.getElementById("filter-toggle");

    const filterContent =
        document.getElementById("filter-content");


    filterToggle.addEventListener("click", () => {

        const isOpen =
            filterContent.classList.toggle("open");

        filterToggle.setAttribute(
            "aria-expanded",
            isOpen
        );

        filterToggle.textContent =
            isOpen ? "Filter −" : "Filter +";
    });
    const filterIds = [
        "filter-author",
        "filter-source",
        "filter-source-type",
        "filter-language",
        "filter-region",
        "filter-saint",
        "filter-topic",
        "filter-start-year",
        "filter-end-year"
    ];


    filterIds.forEach(id => {

        const element =
            document.getElementById(id);

        element.addEventListener(
            "input",
            applyFilters
        );

        element.addEventListener(
            "change",
            applyFilters
        );
    });


    document
        .getElementById("clear-filters")
        .addEventListener(
            "click",
            clearFilters
        );
}


// ================================
// Apply Filters
// ================================

function applyFilters() {

    const author =
        document.getElementById("filter-author").value;

    const source =
        document.getElementById("filter-source").value;

    const sourceType =
        document.getElementById("filter-source-type").value;

    const language =
        document.getElementById("filter-language").value;

    const region =
        document.getElementById("filter-region").value;

    const saint =
        document.getElementById("filter-saint").value;

    const topic =
        document.getElementById("filter-topic").value;

    const startYearInput =
        document.getElementById("filter-start-year").value;

    const endYearInput =
        document.getElementById("filter-end-year").value;


    const startYear =
        startYearInput === ""
            ? null
            : Number(startYearInput);

    const endYear =
        endYearInput === ""
            ? null
            : Number(endYearInput);


    const filteredQuotes =
        allQuotes.filter(quote => {

            // ----------------
            // Author
            // ----------------

            if (
                author &&
                quote.author !== author
            ) {
                return false;
            }


            // ----------------
            // Source
            // ----------------

            if (
                source &&
                quote.source !== source
            ) {
                return false;
            }


            // ----------------
            // Source Type
            // ----------------

            if (
                sourceType &&
                quote.sourceType !== sourceType
            ) {
                return false;
            }


            // ----------------
            // Language
            // ----------------

            if (
                language &&
                quote.language !== language
            ) {
                return false;
            }


            // ----------------
            // Region
            // ----------------

            if (
                region &&
                quote.region !== region
            ) {
                return false;
            }


            // ----------------
            // Saint
            // ----------------

            if (saint !== "") {

                const saintBoolean =
                    saint === "true";

                if (
                    quote.saint !== saintBoolean
                ) {
                    return false;
                }
            }


            // ----------------
            // Topic
            // ----------------

            if (topic) {

                if (
                    !quote.topics ||
                    quote.topics[topic] !== true
                ) {
                    return false;
                }
            }


            // ----------------
            // Years
            // ----------------

            const quoteStart =
                getQuoteStartYear(quote);

            const quoteEnd =
                getQuoteEndYear(quote);


            /*
               A quote with a date range qualifies
               if any portion of its range falls
               inside the selected filter range.
            */

            if (
                startYear !== null &&
                quoteEnd < startYear
            ) {
                return false;
            }

            if (
                endYear !== null &&
                quoteStart > endYear
            ) {
                return false;
            }


            return true;
        });


    displayQuotes(filteredQuotes);
}


// ================================
// Clear Filters
// ================================

function clearFilters() {

    document.getElementById("filter-author").value = "";
    document.getElementById("filter-source").value = "";
    document.getElementById("filter-source-type").value = "";
    document.getElementById("filter-language").value = "";
    document.getElementById("filter-region").value = "";
    document.getElementById("filter-saint").value = "";
    document.getElementById("filter-topic").value = "";
    document.getElementById("filter-start-year").value = "";
    document.getElementById("filter-end-year").value = "";

    displayQuotes(allQuotes);
}


// ================================
// Display Quotes
// ================================

function displayQuotes(quotes) {

    if (quotes.length === 0) {

        document.getElementById("quotes-container").innerHTML =
            '<p class="no-results">No quotations match these filters.</p>';

        return;
    }

    const yearGroups =
        groupQuotesByYear(quotes);

    renderQuotes(yearGroups);
}


// ================================
// Group Quotes By Year
// ================================

function groupQuotesByYear(quotes) {

    const groups = {};


    quotes.forEach(quote => {

        const year =
            getQuoteStartYear(quote);

        if (year === 0) {
            return;
        }

        const range =
            getYearRange(year);


        if (!groups[range.start]) {

            groups[range.start] = {
                label: range.label,
                authors: {}
            };
        }


        const author =
            quote.author || "Unknown Author";


        if (
            !groups[range.start]
                .authors[author]
        ) {
            groups[range.start]
                .authors[author] = [];
        }


        groups[range.start]
            .authors[author]
            .push(quote);
    });


    return groups;
}


// ================================
// Render Page
// ================================

function renderQuotes(yearGroups) {

    const container =
        document.getElementById(
            "quotes-container"
        );

    container.innerHTML = "";


    const sortedYears =
        Object.keys(yearGroups)
            .map(Number)
            .sort((a, b) => a - b);


    sortedYears.forEach(yearStart => {

        const group =
            yearGroups[yearStart];


        // YEAR SECTION

        const yearSection =
            document.createElement("section");

        yearSection.classList.add(
            "year-section"
        );


        const yearHeading =
            document.createElement("h2");

        yearHeading.classList.add(
            "year-heading"
        );

        yearHeading.textContent =
            group.label;

        yearSection.appendChild(
            yearHeading
        );


        // AUTHORS

        const authors =
            Object.keys(group.authors);


        authors.forEach(author => {

            const authorSection =
                document.createElement(
                    "section"
                );

            authorSection.classList.add(
                "author-section"
            );


            const authorHeading =
                document.createElement("h3");

            authorHeading.classList.add(
                "author-name"
            );

            authorHeading.textContent =
                author;

            authorSection.appendChild(
                authorHeading
            );


            group.authors[author]
                .sort(
                    (a, b) =>
                        getQuoteStartYear(a) -
                        getQuoteStartYear(b)
                )

                .forEach(quote => {

                    authorSection.appendChild(
                        createQuoteElement(
                            quote
                        )
                    );
                });


            yearSection.appendChild(
                authorSection
            );
        });


        container.appendChild(
            yearSection
        );
    });
}


// ================================
// Create Individual Quote
// ================================

function createQuoteElement(quote) {

    const article =
        document.createElement("article");

    article.classList.add("quote");


    // QUOTE TEXT

    const blockquote =
        document.createElement(
            "blockquote"
        );

    blockquote.textContent =
        `"${quote.quote}"`;

    article.appendChild(
        blockquote
    );


    // DATE

    let yearText;

    const startYear =
        getQuoteStartYear(quote);

    const endYear =
        getQuoteEndYear(quote);


    if (endYear !== startYear) {

        yearText =
            `${startYear}–${endYear} AD`;

    } else {

        yearText =
            `${startYear} AD`;
    }


    // INFORMATION

    const info =
        document.createElement("div");

    info.classList.add(
        "quote-info"
    );


    // SOURCE

    const sourceRow =
        document.createElement("div");

    sourceRow.classList.add(
        "quote-info-row"
    );


    const sourceLabel =
        document.createElement("span");

    sourceLabel.classList.add(
        "quote-info-label"
    );

    sourceLabel.textContent =
        "Source: ";

    sourceRow.appendChild(
        sourceLabel
    );


    if (quote.sourceUrl) {

        const sourceLink =
            document.createElement("a");

        sourceLink.href =
            quote.sourceUrl;

        sourceLink.textContent =
            quote.source;

        sourceLink.target =
            "_blank";

        sourceLink.rel =
            "noopener noreferrer";

        sourceRow.appendChild(
            sourceLink
        );

    } else {

        const sourceValue =
            document.createElement("span");

        sourceValue.classList.add(
            "quote-info-value"
        );

        sourceValue.textContent =
            quote.source;

        sourceRow.appendChild(
            sourceValue
        );
    }


    info.appendChild(
        sourceRow
    );


    // OTHER METADATA

    const metadata = [
        {
            label: "Location in Source",
            value: quote.locationInSource
        },
        {
            label: "Source Type",
            value: quote.sourceType
        },
        {
            label: "Date",
            value: yearText
        },
        {
            label: "Language",
            value: quote.language
        },
        {
            label: "Region",
            value: quote.region
        },
        {
            label: "Translation",
            value: quote.translation
        }
    ];


    metadata.forEach(item => {

        const row =
            document.createElement("div");

        row.classList.add(
            "quote-info-row"
        );


        const label =
            document.createElement("span");

        label.classList.add(
            "quote-info-label"
        );

        label.textContent =
            `${item.label}: `;


        const value =
            document.createElement("span");

        value.classList.add(
            "quote-info-value"
        );

        value.textContent =
            item.value;


        row.appendChild(label);
        row.appendChild(value);

        info.appendChild(row);
    });


    article.appendChild(info);

    return article;
}