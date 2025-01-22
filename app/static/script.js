// Function to handle navigation and display the correct section
function navigateTo(route) {
    // Update the browser URL without reloading
    history.pushState({}, "", route);

    // Hide all sections
    document.getElementById("predictionSection").style.display = "none";
    document.getElementById("previousPredictionsSection").style.display = "none";
    document.getElementById("dashboardSection").style.display = "none";

    // Display the section based on the route
    if (route === "/predict") {
        document.getElementById("predictionSection").style.display = "block";
    } else if (route === "/predictions") {
        fetchPreviousPredictions();
        document.getElementById("previousPredictionsSection").style.display = "block";
    } else if (route === "/dashboard") {
        fetchDashboardStats();
        document.getElementById("dashboardSection").style.display = "block";
    } else {
        // Default route: Redirect to predict
        navigateTo("/predict");
    }
}

// Handle browser navigation (back/forward buttons)
window.addEventListener("popstate", () => {
    navigateTo(window.location.pathname);
});

// Initial page load: Navigate to the correct route
document.addEventListener("DOMContentLoaded", () => {
    navigateTo(window.location.pathname);
});

// Event listeners for navigation buttons
document.getElementById("checkMentalStatus").addEventListener("click", () => navigateTo("/predict"));
document.getElementById("previousPredictions").addEventListener("click", () => navigateTo("/predictions"));
document.getElementById("dashboard").addEventListener("click", () => navigateTo("/dashboard"));

// Submit prediction form
document.getElementById("predictionForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const inputText = document.getElementById("inputText").value;
    const resultDiv = document.getElementById("result");
    resultDiv.innerText = "Processing...";

    fetch("http://127.0.0.1:8000/predict/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: inputText })
    })
        .then(response => response.json())
        .then(data => {
            resultDiv.innerText = "Predicted Mental State: " + data.predicted_status;
        })
        .catch(error => {
            resultDiv.innerText = "Error occurred while predicting. Please try again.";
            console.error("Error:", error);
        });
});

// Function to fetch and display previous predictions
function fetchPreviousPredictions() {
    const predictionsList = document.getElementById("predictionsList");

    // Check if the section for previous predictions exists
    if (!predictionsList) {
        console.error("Predictions list section not found!");
        return;
    }

    console.log("Fetching previous predictions...");

    fetch("http://127.0.0.1:8000/predictions/") // API endpoint to get previous predictions
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Previous predictions fetched successfully:", data);

            // Clear any existing content in the predictions list
            predictionsList.innerHTML = "";

            // Check if the data is in the expected format
            if (!data || data.length === 0) {
                predictionsList.innerHTML = "<tr><td colspan='3'>No previous predictions found.</td></tr>";
                return; // Exit early if there are no previous predictions
            }

            // Loop through the data and display each prediction in the table
            data.forEach(prediction => {
                const predictionRow = document.createElement("tr");

                // Create and populate table cells for each row
                const idCell = document.createElement("td");
                idCell.textContent = prediction.id;

                const inputTextCell = document.createElement("td");
                inputTextCell.textContent = prediction.input_text;

                const predictedStatusCell = document.createElement("td");
                predictedStatusCell.textContent = prediction.predicted_status;

                // Append the cells to the row
                predictionRow.appendChild(idCell);
                predictionRow.appendChild(inputTextCell);
                predictionRow.appendChild(predictedStatusCell);

                // Append the row to the table body
                predictionsList.appendChild(predictionRow);
            });
        })
        .catch(error => {
            console.error("Error fetching previous predictions:", error);
            predictionsList.innerHTML = "<tr><td colspan='3'>Error occurred while fetching previous predictions. Please try again.</td></tr>";
        });
}


// Fetch dashboard stats and render a chart
function fetchDashboardStats() {
    const chartElement = document.getElementById("predictionChart");

    // Check if the canvas element exists
    if (!chartElement) {
        console.error("Prediction chart canvas element not found!");
        return; // Exit early if the element doesn't exist
    }

    console.log("Fetching data from the backend...");

    fetch("http://127.0.0.1:8000/dashboard/")
        .then(response => {
            console.log("Received response from server");
            // Check if the response is ok (status code 200-299)
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Data fetched successfully:", data); // Debugging statement to check fetched data

            // Check if the data is in the expected format
            if (!data || Object.keys(data).length === 0) {
                console.error("Received data is empty or invalid!");
                return; // Exit early if the data is invalid
            }

            // Example check for another element you're trying to set innerHTML
            const predictionElement = document.getElementById("predictionText");
            if (predictionElement) {
                predictionElement.innerHTML = "Data successfully fetched!";
            } else {
                console.error("Element with id 'predictionText' not found!");
            }

            const ctx = chartElement.getContext("2d");

            // Extract labels and values for the chart
            const labels = Object.keys(data);
            const counts = Object.values(data);

            // Debugging: Log the labels and counts to ensure they are extracted correctly
            console.log("Chart Labels:", labels);
            console.log("Chart Counts:", counts);

            // Render the bar chart
            new Chart(ctx, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Count of Predictions",
                        data: counts,
                        backgroundColor: [
                            "#ff6384", "#36a2eb", "#cc65fe", "#ffce56", "#4bc0c0", "#9966ff", "#ff9f40"
                        ],
                        borderColor: "#ddd",
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: "Count"
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: "Mental States"
                            }
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.error("Error fetching dashboard stats:", error);
        });
}

// Call the function on page load
document.addEventListener("DOMContentLoaded", fetchDashboardStats);
