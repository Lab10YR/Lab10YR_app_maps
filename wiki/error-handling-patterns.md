# Error Handling Patterns for SDA API Usage

Robust error handling is essential for reliable Soil Data Access (SDA) workflows. Use these patterns in all SQL, Python, and JavaScript code that interacts with SDA APIs.

---

## SQL (T-SQL) Error Handling

- Always use `TRY...CATCH` blocks for critical operations.
- Log or output errors for diagnostics.
- Example:

```sql
BEGIN TRY
    -- Your SDA query here
    SELECT * FROM SDA_Get_SoilData(...);
END TRY
BEGIN CATCH
    PRINT 'Error: ' + ERROR_MESSAGE();
    -- Optionally log to a table or return a status
END CATCH
```

---

## Python Error Handling (requests, SDA API)

- Always wrap SDA API calls in `try/except` blocks.
- Check HTTP status codes and handle non-200 responses.
- Example:

```python
import requests

try:
    response = requests.post(SDA_URL, data={"query": sql, "format": "json"}, timeout=30)
    response.raise_for_status()  # Raises HTTPError for bad responses
    data = response.json()
except requests.exceptions.RequestException as e:
    print(f"SDA API error: {e}")
    # Optionally log or re-raise
except ValueError:
    print("Failed to parse SDA API response as JSON.")
```

---

## JavaScript Error Handling (fetch, SDA API)

- Always check `response.ok` and use `try/catch` with async/await.
- Provide user-friendly error messages.
- Example:

```js
async function sdaPost(query, format) {
  try {
    const res = await fetch(SDA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ query, format }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`SDA HTTP ${res.status}: ${text}`);
    }
    return await res.json();
  } catch (err) {
    console.error("SDA API error:", err);
    // Optionally show a user-friendly message in the UI
    throw err;
  }
}
```

---

**Apply these patterns to all new and existing SDA API code.**
