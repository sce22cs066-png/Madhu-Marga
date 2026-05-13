# Madhu-Marga Security Specification

## Data Invariants
1. A Hive must have an ownerId matching the authenticated user.
2. Inspections and Harvests must link to a valid hiveId owned by the user.
3. Users cannot modify or delete other users' hives or logs.
4. Flora is a read-only collection for general users, only admins (simulated or explicit) can update.

## The Dirty Dozen Payloads (Targeting Permission Denied)

1. **Identity Spoofing**: Creating a Hive with a different `ownerId`.
   - Payload: `{ name: "Hive 1", ownerId: "attacker_id", status: "active" }`
2. **Hive Hijacking**: Updating a Hive that belongs to someone else.
   - Action: `update` on `/hives/user1_hive` by `user2`.
3. **Orphaned Inspection**: Creating an Inspection for a Hive that doesn't exist.
   - Action: `create` on `/inspections` with `hiveId: "non_existent"`.
4. **State Shortcutting**: Updating Hive status from `active` to `harvested` without a harvest log (Wait, rules can't enforce cross-doc existence easily without `get`, but let's try to enforce status transitions).
5. **Ghost Field Injection**: Adding `isAdmin: true` to a Hive document.
   - Payload: `{ name: "Hive 1", ownerId: "uid", isAdmin: true }`
6. **Negative Quantity Harvest**: Harvesting `-10kg` of honey.
   - Payload: `{ hiveId: "h1", quantity: -10, ownerId: "uid" }`
7. **Temporal Fraud**: Setting `createdAt` to a future date manually.
   - Payload: `{ ..., createdAt: "2099-01-01" }`
8. **Resource Poisoning**: Document ID with 2KB of junk.
   - Action: `create` on `/hives/long_junk_id`.
9. **PII Leakage**: Attempting to list ALL hives without being authenticated.
10. **Admin Elevation**: Attempting to write to the `flora` collection as a standard user.
11. **Bulk Delete**: Attempting to delete a Hive that has active inspections (Relational sync).
12. **Status Lock Violation**: Updating a Hive after its status is `inactive` (Terminal state lock).

## Test Runner (Draft)
- Verify `PERMISSION_DENIED` on all above cases.
