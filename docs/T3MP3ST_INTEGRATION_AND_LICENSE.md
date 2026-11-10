# T3MP3ST Integration & AGPL-3.0 Architectural Review

## 1. Executive Summary

This document provides the technical, architectural, and legal license analysis for integrating the **T3MP3ST** offensive security intelligence framework ([https://github.com/elder-plinius/T3MP3ST](https://github.com/elder-plinius/T3MP3ST)) into **TRUSTCHAIN AUDIT**.

- **Upstream License:** GNU Affero General Public License v3.0 (`AGPL-3.0`).
- **Integration Architecture:** Out-of-process, network-isolated microservice adapter.
- **Copyleft Boundary:** Clean Network API / JSON-RPC barrier. No static or dynamic linking of AGPL code into TRUSTCHAIN's codebase.
- **Status Classification:** Fully verified against the committed T3MP3ST v3.2.0 codebase.

---

## 2. AGPL-3.0 License Analysis & Compliance Strategy

### The Legal Context
Section 13 of the AGPL-3.0 imposes the "Remote Network Interaction" clause:
> *"If you modify the Program, your modified version must prominently offer all users interacting with it remotely through a computer network [...] an opportunity to receive the Corresponding Source of your version..."*

### Architectural Defense: Microservice Isolation
To preserve TrustChain's independent commercial SaaS architecture while fully respecting the AGPL-3.0 requirements:

1. **Unmodified External Service:**
   T3MP3ST is deployed as an **independent, unmodified containerized service** running on its dedicated port (default `3333`).
2. **Network Protocol Boundary:**
   TrustChain communicates with T3MP3ST strictly over standard network protocols:
   - HTTP/REST endpoints (`/api/approvals`, `/api/preflight`, `/api/findings`, `/api/evidence`).
   - Standard Model Context Protocol (MCP) JSON-RPC over standard I/O or HTTP.
3. **Independent Adapter (`tempestAdapter.ts`):**
   TrustChain implements an independent client adapter that serializes and deserializes data contracts without copying or modifying T3MP3ST internals.
4. **Clean Boundary Principle:**
   Under established FSF and legal precedent, communicating with an independent AGPL service over a documented REST/JSON API does not trigger copyleft virality on the calling platform.

---

## 3. Verified T3MP3ST Feature Matrix (Working vs. Experimental vs. Unavailable)

Based on direct inspection of the cloned repository (`t3mp3st_repo`):

| Domain / Module | Status in T3MP3ST | Implemented in TrustChain Adapter | Capabilities & Limitations |
|---|---|---|---|
| **Human Approval & Target Scope Gate** | ✅ **Stable** | ✅ **Fully Supported** | Enforces single-target approval, locks TTL (max 30m), rejects wildcard targets (`*`), records `approvedBy`. |
| **Network & Web Reconnaissance** | ✅ **Stable** | ✅ **Fully Supported** | Passive transport checks, TLS ciphers, HTTP security response headers (`CSP`, `HSTS`, `XFO`). |
| **Secret Redaction (Griffin)** | ✅ **Stable** | ✅ **Fully Supported** | Automatically scrubs Bearer JWTs, API keys, private keys, and passwords before logging. |
| **Retest Verification Loop** | ✅ **Stable** | ✅ **Fully Supported** | Allows re-verifying findings after patches are deployed (`/api/tempest/retest`). |
| **Emergency Abort Mechanism** | ✅ **Stable** | ✅ **Fully Supported** | Immediate kill switch canceling active missions and recording audit log. |
| **Smart Contract Reproduction** | ⚠️ **Reproduction** | ✅ **Static Analysis Supported** | Detects Checks-Effects-Interactions reentrancy and `tx.origin` bugs via AST parser. |
| **Streaming Platform DRM & Signed Tokens** | ✅ **Custom Adapter** | ✅ **Fully Supported** | Custom TrustChain engine mapping HLS manifest TTL and DRM key exchange requirements. |
| **Live Cloud Exploitation (Pacu/IaC)** | 🚧 **Scaffolding** | ❌ **Excluded for Safety** | Scaffolding in T3MP3ST; live exploitation is excluded to prevent cloud downtime. |
| **Binary Exploitation / Pwn** | 🚧 **Experimental** | ❌ **Excluded for Safety** | Binary decompilation sink checks are in experimental bench; excluded from production SaaS. |

---

## 4. Mandatory Safety Controls & Rules of Engagement

1. **Explicit Written Authorization:**
   Every assessment requires human confirmation of domain ownership or uploaded written authorization.
2. **No Wildcard Targets:**
   Targets matching `*` or wildcard subdomains are blocked at the adapter layer.
3. **No Automatic Production Exploitation:**
   The `advanced` profile is locked to `staging` or `isolated_lab` environments only.
4. **Strict Egress & Rate Limiting:**
   Passive probes only; zero denial-of-service, zero stealth persistence, and zero credential exfiltration.
5. **Auditable Evidence:**
   Every finding records the exact tool, version (`v3.2.0`), raw scanner output, and reproduction timestamp.

