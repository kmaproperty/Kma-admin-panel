(function() {
  console.log("🚀 KMA Payout Runtime Interceptor Loaded Successfully!");

  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const url = args[0];
    
    const isRedeemApi = typeof url === 'string' && url.toLowerCase().includes('redeem');

    if (isRedeemApi) {
      console.log("🎯 Intercepting API hit:", url);
      const response = await originalFetch.apply(this, args);
      
      if (!response.ok) return response;

      const clone = response.clone();
      try {
        const json = await clone.json();
        console.log("📦 Raw Data fetched:", json);

        // Handle direct array OR nested pagination object (.data)
        let records = null;
        let isNested = false;

        if (json && Array.isArray(json.data)) {
          records = json.data;
          isNested = true;
        } else if (Array.isArray(json)) {
          records = json;
        }

        if (records) {
          const mappedRecords = records.map(item => ({
            ...item,
            id: item.id,
            userName: item.accountHolderName || item.userName || "—",
            uniqueId: item.referrerMobile || item.uniqueId || "—",
            coins: item.coins !== undefined ? item.coins : 0,
            inr: item.amount !== undefined ? Number(item.amount) : (item.inr || 0),
            method: item.method || "BANK_TRANSFER",
            payoutDetail: item.payoutDetail || `${item.bankName || "Bank"} | A/C: ${item.accountNumber || "—"} | IFSC: ${item.ifscCode || "—"}${item.branchName ? ` (${item.branchName})` : ""}`,
            status: item.status || "PENDING",
            requestedAt: item.submittedAt || item.requestedAt || "—"
          }));

          if (isNested) {
            json.data = mappedRecords;
          } else {
            json = mappedRecords;
          }
          console.log("✨ Runtime Mapped UI Data Ready:", mappedRecords);
        }

        return new Response(JSON.stringify(json), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });

      } catch (e) {
        console.error("🚨 Patch parsing error:", e);
        return response;
      }
    }

    return originalFetch.apply(this, args);
  };
})();