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
        setupMultiSelects();
        updateAvailableFilters();

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
    ].sort((a, b) => {
        const nameA = property === 'author' ? getAuthorSortName(a) : String(a);
        const nameB = property === 'author' ? getAuthorSortName(b) : String(b);
        return nameA.localeCompare(nameB) || String(a).localeCompare(String(b));
    });
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

function readFilters() {
    const filters = {};
    for (const [id, key] of Object.entries(filterKeys)) {
        const element = document.getElementById(id);
        filters[key] = multiFilterIds.includes(id) ? getSelectedValues(id) : element.value;
    }
    filters.startYear = filters.startYear === '' ? null : Number(filters.startYear);
    filters.endYear = filters.endYear === '' ? null : Number(filters.endYear);
    return filters;
}

function matchesFilters(quote, filters) {
    const {author, source, sourceType, language, region, saint, topic, startYear, endYear} = filters;


            // ----------------
            // Author
            // ----------------

            if (
                author.length > 0 &&
                !author.includes(quote.author)
            ) {
                return false;
            }


            // ----------------
            // Source
            // ----------------

            if (
                source.length > 0 &&
                !source.includes(quote.source)
            ) {
                return false;
            }


            // ----------------
            // Source Type
            // ----------------

            if (
                sourceType.length > 0 &&
                !sourceType.includes(quote.sourceType)
            ) {
                return false;
            }


            // ----------------
            // Language
            // ----------------

            if (
                language.length > 0 &&
                !language.includes(quote.language)
            ) {
                return false;
            }


            // ----------------
            // Region
            // ----------------

            if (
                region.length > 0 &&
                !region.includes(quote.region)
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

            if (topic.length > 0) {

                if (
                    !quote.topics ||
                    !topic.some(value => quote.topics[value] === true)
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

}

function applyFilters(event) {
    updateAvailableFilters(event?.target?.id);
    const filters = readFilters();
    displayQuotes(allQuotes.filter(quote => matchesFilters(quote, filters)));
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

    document.querySelectorAll('.multi-select').forEach(dropdown => {
        dropdown.querySelectorAll('input[type=checkbox]').forEach(input => { input.checked = false; });
        const search = dropdown.querySelector('.filter-search');
        if (search) search.value = '';
        dropdown.querySelector('summary').textContent = 'All';
        dropdown.open = false;
    });
    updateAvailableFilters();
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
// Checkbox dropdowns retain native selects as the filter data source.
function getSelectedValues(id) {
    return Array.from(document.getElementById(id).selectedOptions)
        .map(option => option.value).filter(Boolean);
}

function setupMultiSelects() {
    const ids = ['filter-author', 'filter-source', 'filter-source-type',
        'filter-language', 'filter-region', 'filter-topic'];
    ids.forEach(id => {
        const select = document.getElementById(id);
        const label = document.querySelector(`label[for="${id}"]`);
        select.multiple = true;
        select.hidden = true;
        select.value = '';
        const dropdown = document.createElement('details');
        dropdown.className = 'multi-select';
        const summary = document.createElement('summary');
        summary.id = `${id}-toggle`;
        summary.textContent = 'All';
        summary.setAttribute('aria-labelledby', `${id}-label ${summary.id}`);
        label.id = `${id}-label`;
        label.htmlFor = summary.id;
        dropdown.appendChild(summary);
        const options = document.createElement('div');
        options.className = 'multi-select-options';
        if (['filter-author', 'filter-source', 'filter-source-type'].includes(id)) {
            const search = document.createElement('input');
            search.type = 'search';
            search.className = 'filter-search';
            search.placeholder = 'Search ' + label.textContent.toLowerCase() + '…';
            search.setAttribute('aria-label', 'Search ' + label.textContent.toLowerCase() + ' choices');
            search.addEventListener('input', () => filterDropdownChoices(dropdown));
            options.appendChild(search);
        }
        const clear = document.createElement('button');
        clear.type = 'button';
        clear.textContent = 'Clear selection';
        options.appendChild(clear);
        const updateSummary = () => {
            const selected = Array.from(select.selectedOptions).filter(option => option.value);
            summary.textContent = selected.length === 0 ? 'All'
                : selected.length === 1 ? selected[0].textContent : `${selected.length} selected`;
        };
        Array.from(select.options).filter(option => option.value).forEach(option => {
            const row = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = option.value;
            checkbox.addEventListener('change', () => {
                option.selected = checkbox.checked;
                updateSummary();
                select.dispatchEvent(new Event('change', { bubbles: true }));
            });
            row.append(checkbox, document.createTextNode(option.textContent));
            options.appendChild(row);
        });
        const noMatches = document.createElement('p');
        noMatches.className = 'filter-no-matches';
        noMatches.setAttribute('role', 'status');
        noMatches.textContent = 'No matching choices.';
        noMatches.hidden = true;
        options.appendChild(noMatches);
        clear.addEventListener('click', () => {
            Array.from(select.options).forEach(option => { option.selected = false; });
            options.querySelectorAll('input[type=checkbox]').forEach(input => { input.checked = false; });
            updateSummary();
            select.dispatchEvent(new Event('change', { bubbles: true }));
        });
        dropdown.appendChild(options);
        select.after(dropdown);
        dropdown.addEventListener('toggle', () => {
            if (dropdown.open) document.querySelectorAll('.multi-select').forEach(other => {
                if (other !== dropdown) other.open = false;
            });
        });
        dropdown.addEventListener('keydown', event => {
            if (event.key === 'Escape') { dropdown.open = false; summary.focus(); }
        });
    });
    document.addEventListener('click', event => {
        document.querySelectorAll('.multi-select').forEach(dropdown => {
            if (!dropdown.contains(event.target)) dropdown.open = false;
        });
    });
}

const multiFilterIds = ['filter-author', 'filter-source', 'filter-source-type',
    'filter-language', 'filter-region', 'filter-topic'];
const filterKeys = {
    'filter-author': 'author', 'filter-source': 'source', 'filter-source-type': 'sourceType',
    'filter-language': 'language', 'filter-region': 'region', 'filter-topic': 'topic',
    'filter-saint': 'saint', 'filter-start-year': 'startYear', 'filter-end-year': 'endYear'
};

function availableValues(id, filters) {
    const key = filterKeys[id];
    const candidates = allQuotes.filter(quote => matchesFilters(quote,
        {...filters, [key]: id === 'filter-saint' ? '' : []}));
    if (key === 'topic') return new Set(candidates.flatMap(quote =>
        Object.entries(quote.topics || {}).filter(([, enabled]) => enabled === true).map(([name]) => name)));
    return new Set(candidates.map(quote => String(quote[key])));
}

function updateAvailableFilters(changedId) {
    const categoricalIds = [...multiFilterIds, 'filter-saint'];
    // Resolve conflicts in favor of the user's most recent selection.
    if (changedId && filterKeys[changedId]) {
        const newest = readFilters();
        const onlyNewest = {author:[], source:[], sourceType:[], language:[], region:[],
            topic:[], saint:'', startYear:null, endYear:null};
        onlyNewest[filterKeys[changedId]] = newest[filterKeys[changedId]];
        for (const id of categoricalIds) {
            if (id === changedId) continue;
            const allowed = availableValues(id, onlyNewest);
            const select = document.getElementById(id);
            for (const option of select.options) {
                if (option.value && !allowed.has(option.value)) option.selected = false;
            }
            if (id === 'filter-saint' && !allowed.has(select.value)) select.value = '';
        }
    }
    // Remove remaining incompatible categorical selections until stable.
    for (let pass = 0; pass < categoricalIds.length; pass++) {
        let removed = false;
        for (const id of categoricalIds) {
            if (id === changedId) continue;
            const allowed = availableValues(id, readFilters());
            const select = document.getElementById(id);
            for (const option of select.options) {
                if (option.value && option.selected && !allowed.has(option.value)) {
                    option.selected = false;
                    removed = true;
                }
            }
            if (id === 'filter-saint' && !allowed.has(select.value)) select.value = '';
        }
        if (!removed) break;
    }
    const filters = readFilters();
    for (const id of categoricalIds) {
        const allowed = availableValues(id, filters);
        const select = document.getElementById(id);
        for (const option of select.options) {
            option.hidden = !!option.value && !allowed.has(option.value);
            option.disabled = option.hidden;
        }
        if (id === 'filter-saint') continue;
        const dropdown = select.nextElementSibling;
        for (const checkbox of dropdown.querySelectorAll('input[type=checkbox]')) {
            const option = Array.from(select.options).find(option => option.value === checkbox.value);
            checkbox.checked = option.selected;
            checkbox.closest('label').dataset.unavailable = String(option.hidden);
        }
        filterDropdownChoices(dropdown);
        const selected = Array.from(select.selectedOptions).filter(option => option.value);
        dropdown.querySelector('summary').textContent = selected.length === 0 ? 'All'
            : selected.length === 1 ? selected[0].textContent : selected.length + ' selected';
    }
}

// Ignore honorifics only when alphabetizing the author filter.
function getAuthorSortName(author) {
    return String(author).replace(/^(?:(?:Pope|St\.)\s+)+/i, '').trim();
}

function matchesChoiceSearch(text, query) {
    const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const name = normalize(text);
    return normalize(query).trim().split(/\s+/).every(word => name.includes(word));
}

function filterDropdownChoices(dropdown) {
    const query = dropdown.querySelector('.filter-search')?.value || '';
    let visibleCount = 0;
    for (const checkbox of dropdown.querySelectorAll('input[type=checkbox]')) {
        const row = checkbox.closest('label');
        row.hidden = row.dataset.unavailable === 'true' || !matchesChoiceSearch(row.textContent, query);
        if (!row.hidden) visibleCount++;
    }
    dropdown.querySelector('.filter-no-matches').hidden = visibleCount > 0;
}
