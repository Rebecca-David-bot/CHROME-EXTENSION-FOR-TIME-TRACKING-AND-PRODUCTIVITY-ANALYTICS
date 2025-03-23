document.addEventListener("DOMContentLoaded", function () {
    const usageList = document.getElementById("usageList");
    const clearButton = document.getElementById("clearData");

    // Request browsing time data from the background script
    chrome.runtime.sendMessage({ action: "getUsage" }, function (data) {
        usageList.innerHTML = ""; // Clear loading message

        if (!data || Object.keys(data).length === 0) {
            usageList.innerHTML = "<li>No data available.</li>";
            return;
        }

        // Convert data to an array and sort by most time spent
        const sortedUsage = Object.entries(data).sort((a, b) => b[1] - a[1]);

        sortedUsage.forEach(([domain, time]) => {
            const li = document.createElement("li");
            li.innerHTML = `<span class="domain">${domain}</span> <span class="time">${formatTime(time)}</span>`;
            usageList.appendChild(li);
        });
    });

    // Function to format time (seconds to HH:MM:SS)
    function formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hrs}h ${mins}m ${secs}s`;
    }

    // Button to clear data
    clearButton.addEventListener("click", function () {
        chrome.storage.local.clear(() => {
            usageList.innerHTML = "<li>Data reset.</li>";
        });
    });
});
