/**
 * apiClient.js
 * * This module simulates an API client. 
 * It exposes a global object `EntityAPI` to be used by contentScript.js.
 */

(function() {
    // =================================================================
    // 1. MOCK DATA & CONFIGURATION
    // =================================================================
    
    const MOCK_DB = {
        "00012345": { displayName: "Alpha Project", type: "Project", status: "Active", lastUpdated: "2025-10-01" },
        "99999999": { displayName: "Legacy Account", type: "Account", status: "Closed", lastUpdated: "2023-01-15" },
        "ABCDE123": { displayName: "Order #ABCDE-123", type: "Order", status: "Pending", lastUpdated: "2025-11-18" },
        "XYZZY000": { displayName: "Shipment XYZZY", type: "Logistics", status: "In Transit", lastUpdated: "2025-11-17" }
    };

    // =================================================================
    // 2. THE ABSTRACTION LAYER
    // =================================================================

    const EntityAPI = {
        
        /**
         * Fetches entity details by ID.
         * @param {string} id - The 8-digit or 5-char+3-digit ID.
         * @returns {Promise<Object|null>}
         */
        fetchEntityById: async function(id) {
            console.log(`[EntityAPI] Fetching data for: ${id}`);

            // ---------------------------------------------------------
            // OPTION A: MOCK IMPLEMENTATION (Current)
            // ---------------------------------------------------------
            return new Promise((resolve, reject) => {
                // Simulate network latency (300ms - 800ms)
                const latency = Math.floor(Math.random() * 500) + 300;

                setTimeout(() => {
                    // 10% chance of API failure simulation
                    if (Math.random() < 0.1) {
                        reject(new Error("Simulated network error"));
                        return;
                    }

                    const data = MOCK_DB[id];
                    if (data) {
                        // Return copy of data + the ID itself
                        resolve({ id, ...data });
                    } else {
                        // Resolve null if not found (404 behavior)
                        resolve(null);
                    }
                }, latency);
            });

            // ---------------------------------------------------------
            // OPTION B: REAL IMPLEMENTATION (How to swap)
            // ---------------------------------------------------------
            /*
            const API_BASE_URL = "https://api.yourcompany.com/v1/entities";
            const TOKEN = "YOUR_BEARER_TOKEN"; // Or retrieve from chrome.storage

            try {
                const response = await fetch(`${API_BASE_URL}/${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    if (response.status === 404) return null;
                    throw new Error(`API Error: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.error("API Fetch Failed", error);
                throw error;
            }
            */
        }
    };

    // Expose to global scope so contentScript.js can access it
    window.EntityAPI = EntityAPI;

})();