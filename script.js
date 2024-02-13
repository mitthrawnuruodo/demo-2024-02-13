/*
Based on https://webdesign.tutsplus.com/pagination-with-vanilla-javascript--cms-41896t
But modified to get result from an API, and show odd number of  pagenumbers in pagination, etc.
*/
console.clear();
// Number of items per page:
const paginationLimit = 24; 

// Global variables
let currentPage = 1, pageCount, listItems;
const paginationNumbers = document.getElementById("pagination-numbers");
const paginatedList = document.getElementById("paginated-list");
const nextButton = document.getElementById("next-button");
const prevButton = document.getElementById("prev-button");
const closeAllBtn = document.getElementById("close-all");
const openAllBtn = document.getElementById("open-all");

const disableButton = (button) => {
    button.classList.add("disabled");
    button.setAttribute("disabled", true);
};
  
const enableButton = (button) => {
    button.classList.remove("disabled");
    button.removeAttribute("disabled");
};

const handlePageButtonsStatus = () => {
    if (currentPage === 1) { // First page
      disableButton(prevButton); // Disable <
    } else {
      enableButton(prevButton);
    }
  
    if (pageCount === currentPage) { // Last page
      disableButton(nextButton); // Disable >
    } else {
      enableButton(nextButton);
    }
};

const appendPageNumber = (label, index) => {
    //console.log(label, index);
    // Make number-button:
    const pageNumber = document.createElement("button");
    pageNumber.classList.add("pagination-number");
    pageNumber.innerHTML = label;
    pageNumber.setAttribute("page-index", index);
    pageNumber.setAttribute("aria-label", "Page " + index);

    // Add eventlistener to navigate
    pageNumber.addEventListener("click", () => {
        setCurrentPage(index);
    });

    // Set active page
    if (index === currentPage) {
        pageNumber.classList.add("active"); // Set new active buttom
    } else {
        pageNumber.classList.remove("active");
    }

    // Add pagenumber to paginationNumbers element
    paginationNumbers.appendChild(pageNumber);

}

const getPaginationNumbers = () => {
    paginationNumbers.innerHTML = ""; // Clear old numbers
    //console.log(window.innerWidth); 
    // Set start and end
    const maxNumbers = 5; // MUST be an odd number!!!
    const half = Math.floor(maxNumbers/2);
    let start = 1;
    let end = pageCount;

    let tooMany = pageCount >= maxNumbers; // Show max pagenumbers
    if (tooMany) { 
        if (currentPage > half) start = currentPage - half; // First
        if (currentPage > pageCount - half) start = pageCount - maxNumbers + 1; // Last
        end = Math.min(start + maxNumbers - 1, pageCount); // End at pageCount
    }

    // Make pagenumbers
    if (currentPage - 1 > half && tooMany) {
        //console.log ("Add link to first at beginning");
        appendPageNumber("First", 1);    
    }
    for (let i = start; i <= end; i++) {
        appendPageNumber(i, i);
    }
    if (currentPage < pageCount - half  && tooMany) { 
        //console.log ("Add link to last at end");
        appendPageNumber("Last", pageCount); 
    }
}

const setCurrentPage = (pageNum) => {
    // Update global
    currentPage = pageNum;
    //console.log(currentPage, pageCount);
    getPaginationNumbers();
    handlePageButtonsStatus();

    // Set updated range:
    const prevRange = (pageNum - 1) * paginationLimit;
    const currRange = pageNum * paginationLimit;
    //console.log (prevRange, currRange);

    // Hide all, except the ones in the current range
    listItems.forEach((item, index) => {
        item.classList.add("hidden");
        if (index >= prevRange && index < currRange) {
            item.classList.remove("hidden");
        }
    });
}

const amiiboTemplate = (amiibo) => {
    //console.log(amiibo);
    return `
    <details class="hidden">
        <summary>${amiibo.name}</summary>
        <div class="details">
            <h2>${amiibo.character}</h2>
            <img src="${amiibo.image}" width="200" alt="${amiibo.name}">
            <p><label>Name:</label> ${amiibo.name}</p>
            <p><label>amiiboSeries:</label> ${amiibo.amiiboSeries}</p>
            <p><label>gameSeries:</label> ${amiibo.gameSeries}</p>
            <p><label>Type:</label> ${amiibo.type}</p>
        </div>
    </details>`;
}

const listAmiibos = (list) => {
    //console.log(list);
    let content = "";
    for (const item of list) {
        //console.log(item);
        content += amiiboTemplate(item);
    }
    paginatedList.innerHTML = content;

    // Set globals
    listItems = paginatedList.querySelectorAll("div#paginated-list > details");
    pageCount = Math.ceil(listItems.length / paginationLimit);
    //console.log(pageCount, listItems);

    setCurrentPage(currentPage);
}

const getAllAmiibos = async () => {
    const api = "https://www.amiiboapi.com/api/amiibo";
    try {
        const response = await fetch(api);
        if (response.ok) {
            const data = await response.json();
            //console.log (data.amiibo);
            data.amiibo.sort((a, b)=>{
                return new Intl.Collator().compare(a.name, b.name);
            });

            if (data.amiibo.length > paginationLimit) {
                document.querySelector(".pagination-container").style.display = "flex";
            }
            listAmiibos(data.amiibo);
        } else {
            throw new Error(response.statusText);
        }
    } catch (error) {
        console.error(`Something's wrong: ${error.message}`);
        paginatedList.innerHTML = "<p>Couldn't load any Amiibos...</p>";
    } finally {
        document.querySelector(".spinner-grow").remove(); 
    }
}

window.addEventListener("keydown", (e) => {
    console.log(e.key, currentPage);
    if (e.key === "ArrowLeft"  && currentPage > 1) {
        setCurrentPage(currentPage - 1);
    }
    if (e.key === "ArrowRight" && currentPage < pageCount) {
        setCurrentPage(currentPage + 1);
    }
});

prevButton.addEventListener("click", () => {
    setCurrentPage(currentPage - 1);
});

nextButton.addEventListener("click", () => {
    setCurrentPage(currentPage + 1);
});

closeAllBtn.addEventListener("click", () => {
    for (const item of listItems) {
        //console.log(item);
        if (!item.classList.contains("hidden")) { // Only for current page
            item.open = false;
        }
    }
});

openAllBtn.addEventListener("click", () => { 
    for (const item of listItems) {
        //console.log(item);
        if (!item.classList.contains("hidden")) { // Only for current page
            item.open = true;
        }
    }
});

window.addEventListener("load", () => {
    getAllAmiibos();
});