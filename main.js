
const failureRate = 0.4;

const passed = `<div><Image src="images/check2-circle.svg"/></div>`;
const failed = `<div style="font-family: cursive; color: #d62828; font-weight: 1000">X</div>`;
const loading =
    `<div><div class="spinner-border spinner-border-sm text-secondary" role="status">
    <span class="sr-only"></span>
</div></div>`;
const notTested = `<div>-</div>`;

const errorMessage = `<div class="errormsg" style="
    justify-content: left;
    color: red;
    font-size: smaller;
">`

const dnsRow = document.getElementById("dns");
const availabilityRow = document.getElementById("availability");
const securityRow = document.getElementById("security");

const dynamicTestRows = [dnsRow, availabilityRow, securityRow];




function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function checkUrlStructure(value) {
    try {
        const url = new URL(value);

        if (url.protocol !== "http:" && url.protocol !== "https:") {
            return {
                valid: false,
                error: "Protocol must be HTTP or HTTPS"
            };
        }

        if (!url.hostname) {
            return {
                valid: false,
                error: "URL has no hostname"
            };
        }

        return {
            valid: true,
            url
        };

    } catch {
        return {
            valid: false,
            error: "Invalid URL"
        };
    }
}

function checkUrlEncoding(value) {

    // Check whitespace and control characters
    for (let i = 0; i < value.length; i++) {
        const code = value.charCodeAt(i);

        if (code <= 0x1F || code === 0x7F) {

            return {
                valid: false,
                error: `Unencoded control character at position ${i}`
            };
        }

        if (/\s/.test(value[i])) {
            return {
                valid: false,
                error: `whitespace is not allowed in url`
            };
        }

        if (value[i] === "%") {
            if (
                i + 2 >= value.length ||
                !/[0-9A-Fa-f]/.test(value[i + 1]) ||
                !/[0-9A-Fa-f]/.test(value[i + 2])
            ) {
                return {
                    valid: false,
                    error: `Invalid percent encoding at position ${i}`
                };
            }
        }
    }

    return {
        valid: true
    };
}

function handlefailure(row, error) {
    row.cells[1].innerHTML = failed;
    row.cells[0].innerHTML += errorMessage + error + "</div>";
}

function runStaticTests(value) {
    const formatRow = document.getElementById("format");
    const encodingRow = document.getElementById("encoding");


    if (checkUrlStructure(value).valid) {
        formatRow.cells[1].innerHTML = passed;
        //console.log("Format test passed");
    } else {
        handlefailure(formatRow, checkUrlStructure(value).error);
        encodingRow.cells[1].innerHTML = notTested;
        return true;
    }

    var encodingResult = checkUrlEncoding(value);
    if (encodingResult.valid) {
        //console.log("Encoding test passed");
        encodingRow.cells[1].innerHTML = passed;
    } else {
        handlefailure(encodingRow, encodingResult.error);
        return true;
    }
}

async function fetchURLsecurityReport(url) {
    try {
        //Mocked API response
        var data = [
            { valid: true, name: "dns" },
            { valid: true, name: "availability" },
            { valid: true, name: "security" },
        ];
        const errors = ["DNS resolution failed", "Server not reachable", "SSL certificate invalid"];
        await delay(2000);
        if (Math.random() < failureRate) {
            var failCause = Math.floor(Math.random() * 2.99);
            errorRow = data[failCause];
            errorRow.valid = false;
            errorRow.error = errors[failCause];
            data[failCause] = errorRow;
            return data;
        }

        return data;
    } catch (error) {
        alert.apply(null, ["Error fetching URL security report: " + error.message]);
        throw error;
    }
}

function populateDynamicTestfields(result) {

    var flag = true;
    //console.log(result);
    result.forEach((item, index) => {
        //console.log(dynamicTestRows[index] + " " + index);
        if (!flag) {
            dynamicTestRows[index].cells[1].innerHTML = notTested;
        }
        else if (item.valid) {
            dynamicTestRows[index].cells[1].innerHTML = passed;
        } else {
            handlefailure(dynamicTestRows[index], item.error);
            flag = false;
        }
    });
    return flag;
}

function removeDynamicTestfields() {
    dynamicTestRows.forEach((row) => {
        row.cells[1].innerHTML = notTested;
    });
}

function dynamicTestfieldsLoading() {
    dynamicTestRows.forEach((row) => {
        row.cells[1].innerHTML = loading;
    });
}

function displaySuccessDiv() {
    const successDiv = document.querySelector('.successDiv');
    successDiv.classList.remove("hidden");
}


submitUrl = () => {
    document.querySelectorAll('.errormsg').forEach((element) => {
        element.remove();
    });
    document.querySelector('.successDiv').classList.add('hidden');
    document.getElementById('url_box').classList.add('clicked');
    document.getElementById('resultTable').classList.remove('hidden');

    var value = document.getElementById('url_input').value;

    var staticTestFailure = runStaticTests(value);

    if (staticTestFailure) {
        removeDynamicTestfields();
    } else {
        dynamicTestfieldsLoading();
        fetchURLsecurityReport(value).then((result) => {
            if (populateDynamicTestfields(result)) {
                displaySuccessDiv();
            }
        });
    }


    //console.log(value);

};

const input = document.getElementById("url_input");

input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        submitUrl();
    }
});