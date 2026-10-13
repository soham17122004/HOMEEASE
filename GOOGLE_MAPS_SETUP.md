# Google Maps Platform Configuration & Security Guide

This document explains how to set up Google Maps Platform for HomeEase's Gujarat-wide home service operations, enforce browser key restrictions, configure usage quotas, and manage API billing.

---

## 1. Create a Google Cloud Project & Enable Billing

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown at the top and select **New Project**.
3. Name your project (e.g., `HomeEase-Gujarat-Production`) and assign an organization or folder if applicable.
4. Go to **Billing** in the console navigation menu and link an active payment profile with billing enabled.
   > **Important:** Google Maps Platform requires billing to be enabled even for free-tier usage. Google provides a recurring **$200 monthly credit** on each billing account, which covers thousands of free monthly map loads, geocoding requests, and autocomplete sessions.

---

## 2. Enable Required Google Maps Platform APIs

Enable the three required APIs under **APIs & Services > Library**:

1. **Maps JavaScript API**
   - Renders the interactive map canvas, custom markers, zoom controls, and map click listeners.
2. **Places API (New)**
   - Powers dynamic address autocomplete suggestions constrained to India and biased to Gujarat bounds.
3. **Geocoding API**
   - Converts coordinates (`latitude`, `longitude`) to standardized Gujarat addresses (Reverse Geocoding) and converts address queries to coordinates.

---

## 3. Generate & Restrict Your Frontend API Key

> **Critical Security Rule:** The frontend API key is compiled into client-side JavaScript. It **must never** have unrestricted access or server-level permissions.

### A. Create the Key
1. In Google Cloud Console, navigate to **APIs & Services > Credentials**.
2. Click **+ Create Credentials > API Key**.
3. Rename the key to `HomeEase Frontend Browser Key`.

### B. Configure Application Restrictions (HTTP Referrers)
Under **Application restrictions**, choose **Websites**:
Add your authorized deployment and development URLs:
- `http://localhost:*/*` (for local development and testing)
- `http://127.0.0.1:*/*`
- `https://your-domain.com/*`
- `https://*.your-domain.com/*`

### C. Configure API Restrictions
Under **API restrictions**, select **Restrict key** and check **only** the following three APIs:
- `Maps JavaScript API`
- `Places API (New)`
- `Geocoding API`

Click **Save**.

---

## 4. Frontend vs. Server-Side Key Separation

| Environment | Key Type | Restriction Type | Permitted APIs |
| :--- | :--- | :--- | :--- |
| **Frontend Web App (`VITE_GOOGLE_MAPS_API_KEY`)** | Browser Key | **HTTP Referrers** (`localhost:*`, `your-domain.com/*`) | Maps JavaScript API, Places API (New), Geocoding API |
| **Backend / Edge Functions (if needed)** | Server Key | **IP Address** / Server Environment | Geocoding API, Distance Matrix API (Never exposed to browser) |

- **Never** store secret keys or service account keys in `.env` files prefixed with `VITE_`.
- HomeEase validates coordinates on the frontend store and server schema using trusted geographic bounding boxes (`lat: 20.06 - 24.71`, `lng: 68.16 - 74.48`).

---

## 5. Setting Usage Quotas & Budget Alerts

To prevent unexpected billing spikes:

1. **Set Daily Request Caps:**
   - Go to **APIs & Services > Enabled APIs & Services**.
   - Click on **Places API (New)** or **Geocoding API**, then navigate to the **Quotas** tab.
   - Set a maximum daily limit (e.g., 5,000 requests/day per API).
2. **Configure Billing Budget Alerts:**
   - Go to **Billing > Budgets & alerts**.
   - Create a budget with threshold alerts (e.g., alert at 50%, 80%, 100% of $150).
   - Add notification emails so administrators are alerted prior to exceeding the $200 free allowance.

---

## 6. Billing and Usage Cost Summary (Current Reference)

| Service | Free Tier / Monthly Credit Allowance | Estimated Cost after Credit |
| :--- | :--- | :--- |
| **Maps JavaScript API (Dynamic Maps)** | ~28,500 loads / month | ~$7.00 per 1,000 loads |
| **Places Autocomplete (Per Session)** | ~11,000 autocomplete sessions | ~$17.00 per 1,000 sessions |
| **Geocoding API** | ~40,000 geocoding requests | ~$5.00 per 1,000 requests |

*Note: Autocomplete with session tokens groups keystrokes so only the final place selection is billed as an autocomplete session.*

---

## 7. Connecting Your Key to HomeEase

1. Add your key to `.env` or `.env.local`:
   ```bash
   VITE_GOOGLE_MAPS_API_KEY=AIzaSy...your_browser_key_here
   ```
2. Restart the Vite development server:
   ```bash
   npm run dev
   ```
3. If no key is configured or offline, HomeEase automatically engages its high-fidelity local demo map mode with Gujarat district presets and full pin-drop testing support.
