;; Identity Registry Demo Script
;; This script demonstrates all the main features of the Identity Registry contract

;; 1. Check initial state
(print "=== Initial State ===")
(print (contract-call? .identity-registry get-profile-count))
(print (contract-call? .identity-registry is-name-available "demo_user"))

;; 2. Create a demo profile
(print "=== Creating Profile ===")
(contract-call? .identity-registry create-profile 
  "demo_user" 
  "This is a demonstration profile for the Identity Registry smart contract. It showcases the basic functionality." 
  "QmXoYpVyKxQXGxuNqXR7uo8rqjNVvQxQxQxQxQxQxQxQx"
  (some "https://demo.example.com"))

;; 3. Verify profile was created
(print "=== Profile Created ===")
(print (contract-call? .identity-registry get-profile tx-sender))
(print (contract-call? .identity-registry profile-exists tx-sender))
(print (contract-call? .identity-registry get-profile-count))

;; 4. Search profile by name
(print "=== Search by Name ===")
(print (contract-call? .identity-registry get-profile-by-name "demo_user"))

;; 5. Check verification status
(print "=== Verification Status ===")
(print (contract-call? .identity-registry is-profile-verified tx-sender))

;; 6. Update profile
(print "=== Updating Profile ===")
(contract-call? .identity-registry update-profile 
  "demo_user_updated" 
  "Updated demonstration profile with new information and longer bio to show the update functionality works correctly." 
  "QmYoYpVyKxQXGxuNqXR7uo8rqjNVvQxQxQxQxQxQxQxQx"
  (some "https://updated-demo.example.com"))

;; 7. Verify update
(print "=== Profile Updated ===")
(print (contract-call? .identity-registry get-profile tx-sender))

;; 8. Test utility functions
(print "=== Utility Functions ===")
(print (contract-call? .identity-registry is-name-available "demo_user"))
(print (contract-call? .identity-registry is-name-available "demo_user_updated"))
(print (contract-call? .identity-registry get-profile-owner "demo_user_updated"))

;; 9. Final state
(print "=== Final State ===")
(print (contract-call? .identity-registry get-profile-count))

(print "Demo completed successfully! ✅")