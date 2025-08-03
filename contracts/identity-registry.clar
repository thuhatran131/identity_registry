;; Identity Registry Smart Contract
;; Decentralized identity management system

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-PROFILE-EXISTS (err u101))
(define-constant ERR-PROFILE-NOT-FOUND (err u102))
(define-constant ERR-INVALID-NAME (err u103))
(define-constant ERR-INVALID-BIO (err u104))
(define-constant ERR-INVALID-AVATAR (err u105))
(define-constant ERR-INVALID-WEBSITE (err u106))
(define-constant ERR-NOT-OWNER (err u107))

;; Data Variables
(define-data-var profile-counter uint u0)
(define-data-var contract-admin principal CONTRACT-OWNER)

;; Profile structure
(define-map profiles
  principal
  {
    name: (string-ascii 50),
    bio: (string-ascii 200),
    avatar: (string-ascii 100),
    website: (optional (string-ascii 100)),
    verified: bool,
    created-at: uint,
    updated-at: uint
  }
)

;; Name to principal mapping for search
(define-map profile-names
  (string-ascii 50)
  principal
)

;; Profile existence tracking
(define-map profile-exists-map
  principal
  bool
)

;; Events
(define-data-var last-event-id uint u0)

;; Helper Functions

;; Validate name (1-50 characters, alphanumeric and basic symbols)
(define-private (is-valid-name (name (string-ascii 50)))
  (and 
    (> (len name) u0)
    (<= (len name) u50)
  )
)

;; Validate bio (max 200 characters)
(define-private (is-valid-bio (bio (string-ascii 200)))
  (<= (len bio) u200)
)

;; Validate avatar (IPFS hash format - basic validation)
(define-private (is-valid-avatar (avatar (string-ascii 100)))
  (and
    (> (len avatar) u0)
    (<= (len avatar) u100)
  )
)

;; Validate website URL (basic validation)
(define-private (is-valid-website (website (string-ascii 100)))
  (and
    (> (len website) u0)
    (<= (len website) u100)
  )
)

;; Check if caller is contract admin
(define-private (is-admin (caller principal))
  (is-eq caller (var-get contract-admin))
)

;; Increment profile counter
(define-private (increment-counter)
  (var-set profile-counter (+ (var-get profile-counter) u1))
)

;; Public Functions

;; Create a new profile
(define-public (create-profile 
  (name (string-ascii 50))
  (bio (string-ascii 200))
  (avatar (string-ascii 100))
  (website (optional (string-ascii 100)))
)
  (let
    (
      (caller tx-sender)
      (current-block block-height)
    )
    ;; Validate inputs
    (asserts! (is-valid-name name) ERR-INVALID-NAME)
    (asserts! (is-valid-bio bio) ERR-INVALID-BIO)
    (asserts! (is-valid-avatar avatar) ERR-INVALID-AVATAR)
    (asserts! 
      (match website
        some-website (is-valid-website some-website)
        true
      ) 
      ERR-INVALID-WEBSITE
    )
    
    ;; Check if profile already exists
    (asserts! (is-none (map-get? profiles caller)) ERR-PROFILE-EXISTS)
    (asserts! (is-none (map-get? profile-names name)) ERR-PROFILE-EXISTS)
    
    ;; Create profile
    (map-set profiles caller {
      name: name,
      bio: bio,
      avatar: avatar,
      website: website,
      verified: false,
      created-at: current-block,
      updated-at: current-block
    })
    
    ;; Set name mapping
    (map-set profile-names name caller)
    
    ;; Mark profile as existing
    (map-set profile-exists-map caller true)
    
    ;; Increment counter
    (increment-counter)
    
    (ok true)
  )
)

;; Update existing profile
(define-public (update-profile
  (name (string-ascii 50))
  (bio (string-ascii 200))
  (avatar (string-ascii 100))
  (website (optional (string-ascii 100)))
)
  (let
    (
      (caller tx-sender)
      (current-block block-height)
      (existing-profile (unwrap! (map-get? profiles caller) ERR-PROFILE-NOT-FOUND))
      (old-name (get name existing-profile))
    )
    ;; Validate inputs
    (asserts! (is-valid-name name) ERR-INVALID-NAME)
    (asserts! (is-valid-bio bio) ERR-INVALID-BIO)
    (asserts! (is-valid-avatar avatar) ERR-INVALID-AVATAR)
    (asserts! 
      (match website
        some-website (is-valid-website some-website)
        true
      ) 
      ERR-INVALID-WEBSITE
    )
    
    ;; If name changed, check if new name is available
    (if (not (is-eq name old-name))
      (asserts! (is-none (map-get? profile-names name)) ERR-PROFILE-EXISTS)
      true
    )
    
    ;; Update profile
    (map-set profiles caller {
      name: name,
      bio: bio,
      avatar: avatar,
      website: website,
      verified: (get verified existing-profile), ;; Keep verification status
      created-at: (get created-at existing-profile), ;; Keep creation time
      updated-at: current-block
    })
    
    ;; Update name mapping if name changed
    (if (not (is-eq name old-name))
      (begin
        (map-delete profile-names old-name)
        (map-set profile-names name caller)
      )
      true
    )
    
    (ok true)
  )
)

;; Get profile by principal
(define-read-only (get-profile (user principal))
  (map-get? profiles user)
)

;; Get profile by name
(define-read-only (get-profile-by-name (name (string-ascii 50)))
  (match (map-get? profile-names name)
    user-principal (map-get? profiles user-principal)
    none
  )
)

;; Check if profile exists
(define-read-only (profile-exists (user principal))
  (default-to false (map-get? profile-exists-map user))
)

;; Check if profile is verified
(define-read-only (is-profile-verified (user principal))
  (match (map-get? profiles user)
    profile (get verified profile)
    false
  )
)

;; Get total profile count
(define-read-only (get-profile-count)
  (var-get profile-counter)
)

;; Verify a profile (admin only)
(define-public (verify-identity (user principal))
  (let
    (
      (caller tx-sender)
      (existing-profile (unwrap! (map-get? profiles user) ERR-PROFILE-NOT-FOUND))
    )
    ;; Check if caller is admin
    (asserts! (is-admin caller) ERR-NOT-AUTHORIZED)
    
    ;; Update profile with verification
    (map-set profiles user (merge existing-profile { verified: true }))
    
    (ok true)
  )
)

;; Unverify a profile (admin only)
(define-public (unverify-identity (user principal))
  (let
    (
      (caller tx-sender)
      (existing-profile (unwrap! (map-get? profiles user) ERR-PROFILE-NOT-FOUND))
    )
    ;; Check if caller is admin
    (asserts! (is-admin caller) ERR-NOT-AUTHORIZED)
    
    ;; Update profile to remove verification
    (map-set profiles user (merge existing-profile { verified: false }))
    
    (ok true)
  )
)

;; Delete profile (owner only)
(define-public (delete-profile)
  (let
    (
      (caller tx-sender)
      (existing-profile (unwrap! (map-get? profiles caller) ERR-PROFILE-NOT-FOUND))
      (profile-name (get name existing-profile))
    )
    ;; Delete from all maps
    (map-delete profiles caller)
    (map-delete profile-names profile-name)
    (map-delete profile-exists-map caller)
    
    ;; Decrement counter
    (var-set profile-counter (- (var-get profile-counter) u1))
    
    (ok true)
  )
)

;; Admin functions

;; Change contract admin (current admin only)
(define-public (set-admin (new-admin principal))
  (let
    (
      (caller tx-sender)
    )
    (asserts! (is-admin caller) ERR-NOT-AUTHORIZED)
    (var-set contract-admin new-admin)
    (ok true)
  )
)

;; Get current admin
(define-read-only (get-admin)
  (var-get contract-admin)
)

;; Emergency delete profile (admin only)
(define-public (admin-delete-profile (user principal))
  (let
    (
      (caller tx-sender)
      (existing-profile (unwrap! (map-get? profiles user) ERR-PROFILE-NOT-FOUND))
      (profile-name (get name existing-profile))
    )
    ;; Check if caller is admin
    (asserts! (is-admin caller) ERR-NOT-AUTHORIZED)
    
    ;; Delete from all maps
    (map-delete profiles user)
    (map-delete profile-names profile-name)
    (map-delete profile-exists-map user)
    
    ;; Decrement counter
    (var-set profile-counter (- (var-get profile-counter) u1))
    
    (ok true)
  )
)

;; Utility functions for frontend integration

;; Get profile info with existence check
(define-read-only (get-profile-info (user principal))
  (if (profile-exists user)
    (ok (map-get? profiles user))
    ERR-PROFILE-NOT-FOUND
  )
)

;; Check if name is available
(define-read-only (is-name-available (name (string-ascii 50)))
  (is-none (map-get? profile-names name))
)

;; Get profile owner by name
(define-read-only (get-profile-owner (name (string-ascii 50)))
  (map-get? profile-names name)
)