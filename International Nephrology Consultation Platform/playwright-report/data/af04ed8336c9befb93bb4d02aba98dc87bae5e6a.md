# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin Dashboard >> should show consultation details
- Location: e2e/admin.spec.ts:20:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Patient')
Expected: visible
Error: strict mode violation: locator('text=Patient') resolved to 6 elements:
    1) <span class="text-[10px] sm:text-xs md:text-sm text-gray-600 text-center leading-tight">5000+ patients</span> aka getByText('+ patients')
    2) <span data-slot="badge" class="inline-flex items-center justify-center rounded-md border font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden [a&]:hover:bg-primary/90 mb-3 sm:mb-4 md:mb-6 px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-gradient-…>Patient Education</span> aka getByText('Patient Education')
    3) <p class="text-gray-700 font-medium text-[10px] leading-tight sm:text-xs md:text-sm lg:text-base px-1">Patients Treated</p> aka getByText('Patients Treated')
    4) <p class="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-7 sm:mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed px-2">Join thousands of patients who trust Dr. Ilango f…</p> aka getByText('Join thousands of patients')
    5) <span class="text-sm text-gray-300">4.9/5 Patient Rating</span> aka getByText('/5 Patient Rating')
    6) <a href="/patient/dashboard" class="text-gray-400 hover:text-[#006f6f] transition-colors duration-200 flex items-center group">…</a> aka getByRole('link', { name: 'Patient Dashboard' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Patient')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - banner [ref=e4]:
        - generic [ref=e6]:
          - generic [ref=e7] [cursor=pointer]:
            - img "NephroConsult Logo" [ref=e9]
            - generic [ref=e10]:
              - heading "NephroConsult" [level=1] [ref=e11]
              - paragraph [ref=e12]: International Kidney Care
          - button [ref=e14]:
            - img
      - generic [ref=e20]:
        - generic [ref=e22]:
          - generic [ref=e23]: ✦
          - generic [ref=e24]: Expert Kidney Care
        - heading "Expert Kidney Care with Dr. ILANGO (Sr. Nephrologist)" [level=1] [ref=e25]:
          - generic [ref=e26]: Expert Kidney Care
          - generic [ref=e27]:
            - text: with
            - generic [ref=e28]: Dr. ILANGO
          - generic [ref=e29]: (Sr. Nephrologist)
        - paragraph [ref=e30]: Experience world-class nephrology consultations through secure, AI-powered video calls.
        - generic [ref=e31]:
          - button "Book Now" [ref=e33]:
            - img
            - generic [ref=e34]: Book Now
          - button "Contact Us" [ref=e37]:
            - img
            - text: Contact Us
        - generic [ref=e38]:
          - generic [ref=e39]:
            - img [ref=e41]
            - generic [ref=e43]: HIPAA Compliant
            - generic [ref=e44]: Bank-level security
          - generic [ref=e45]:
            - img [ref=e47]
            - generic [ref=e50]: Global Access
            - generic [ref=e51]: Available worldwide
          - generic [ref=e52]:
            - img [ref=e54]
            - generic [ref=e56]: 4.9/5 Rating
            - generic [ref=e57]: 5000+ patients
      - generic [ref=e61]:
        - generic [ref=e62]:
          - generic [ref=e64]: Advanced Technology
          - heading "Comprehensive Nephrology Care" [level=2] [ref=e65]
          - paragraph [ref=e66]: From initial consultations to ongoing kidney health management, we provide complete care through our cutting-edge digital platform.
        - generic [ref=e67]:
          - generic [ref=e69] [cursor=pointer]:
            - img [ref=e73]
            - generic [ref=e76]:
              - heading "HD Video Consultations" [level=3] [ref=e77]
              - paragraph [ref=e78]: Secure, high-quality video calls with encrypted communication for complete privacy and comfort.
              - list [ref=e79]:
                - listitem [ref=e80]:
                  - img [ref=e81]
                  - generic [ref=e84]: End-to-end encryption
                - listitem [ref=e85]:
                  - img [ref=e86]
                  - generic [ref=e89]: Screen sharing capability
                - listitem [ref=e90]:
                  - img [ref=e91]
                  - generic [ref=e94]: Recording for medical records
              - button "Book Now" [ref=e96]:
                - img
                - text: Book Now
          - generic [ref=e98] [cursor=pointer]:
            - img [ref=e102]
            - generic [ref=e105]:
              - heading "Digital Prescriptions" [level=3] [ref=e106]
              - paragraph [ref=e107]: Receive digital prescriptions instantly with direct pharmacy integration and medication reminders.
              - list [ref=e108]:
                - listitem [ref=e109]:
                  - img [ref=e110]
                  - generic [ref=e113]: Instant prescription delivery
                - listitem [ref=e114]:
                  - img [ref=e115]
                  - generic [ref=e118]: Pharmacy integration
                - listitem [ref=e119]:
                  - img [ref=e120]
                  - generic [ref=e123]: Medication tracking
              - button "Book Now" [ref=e125]:
                - img
                - text: Book Now
          - generic [ref=e127] [cursor=pointer]:
            - img [ref=e131]
            - generic [ref=e134]:
              - heading "Lab Report Analysis" [level=3] [ref=e135]
              - paragraph [ref=e136]: Upload and share lab reports securely. Get expert analysis and recommendations for your kidney health.
              - list [ref=e137]:
                - listitem [ref=e138]:
                  - img [ref=e139]
                  - generic [ref=e142]: Secure file upload
                - listitem [ref=e143]:
                  - img [ref=e144]
                  - generic [ref=e147]: AI-assisted analysis
                - listitem [ref=e148]:
                  - img [ref=e149]
                  - generic [ref=e152]: Trend tracking
              - button "Book Now" [ref=e154]:
                - img
                - text: Book Now
      - generic [ref=e156]:
        - generic [ref=e157]:
          - generic [ref=e158]: Patient Education
          - heading "Understanding Your Kidney Health" [level=2] [ref=e159]
          - paragraph [ref=e160]: Learn about kidney function, common conditions, and how our advanced care can help you maintain optimal kidney health.
        - generic [ref=e161]:
          - generic [ref=e162]:
            - generic [ref=e163]:
              - img "Kidney anatomy and structure" [ref=e165]
              - generic [ref=e166]: Kidney Anatomy
            - generic [ref=e167]:
              - heading "How Your Kidneys Work" [level=3] [ref=e168]
              - paragraph [ref=e169]: Your kidneys are vital organs that filter waste and excess fluids from your blood, regulate blood pressure, and maintain electrolyte balance. Understanding their function is crucial for maintaining optimal health.
              - list [ref=e170]:
                - listitem [ref=e171]:
                  - img [ref=e172]
                  - generic [ref=e175]: Filter 200 liters of blood daily
                - listitem [ref=e176]:
                  - img [ref=e177]
                  - generic [ref=e180]: Regulate fluid and electrolyte balance
                - listitem [ref=e181]:
                  - img [ref=e182]
                  - generic [ref=e185]: Control blood pressure
                - listitem [ref=e186]:
                  - img [ref=e187]
                  - generic [ref=e190]: Produce hormones for red blood cell production
          - generic [ref=e191]:
            - generic [ref=e192]:
              - img "Medical consultation for kidney health" [ref=e194]
              - generic [ref=e195]: Expert Care
            - generic [ref=e196]:
              - heading "Conditions We Treat" [level=3] [ref=e197]
              - paragraph [ref=e198]: Dr. Ilango specializes in comprehensive nephrology care, treating a wide range of kidney conditions with personalized treatment plans and cutting-edge medical expertise.
              - list [ref=e199]:
                - listitem [ref=e200]:
                  - img [ref=e201]
                  - generic [ref=e204]: Chronic Kidney Disease (CKD)
                - listitem [ref=e205]:
                  - img [ref=e206]
                  - generic [ref=e209]: Acute Kidney Injury
                - listitem [ref=e210]:
                  - img [ref=e211]
                  - generic [ref=e214]: Diabetic Nephropathy
                - listitem [ref=e215]:
                  - img [ref=e216]
                  - generic [ref=e219]: Hypertensive Kidney Disease
                - listitem [ref=e220]:
                  - img [ref=e221]
                  - generic [ref=e224]: Glomerulonephritis
                - listitem [ref=e225]:
                  - img [ref=e226]
                  - generic [ref=e229]: Kidney Stones & Prevention
                - listitem [ref=e230]:
                  - img [ref=e231]
                  - generic [ref=e234]: Renal transplantation management
        - generic [ref=e235]:
          - generic [ref=e236]:
            - generic [ref=e237]:
              - img "Prevention & Wellness" [ref=e239]
              - heading "Prevention & Wellness" [level=4] [ref=e241]
            - paragraph [ref=e242]: Learn lifestyle modifications, dietary guidelines, and preventive measures to maintain healthy kidney function and prevent disease progression.
          - generic [ref=e243]:
            - generic [ref=e244]:
              - img "Advanced Diagnostics" [ref=e246]
              - heading "Advanced Diagnostics" [level=4] [ref=e248]
            - paragraph [ref=e249]: State-of-the-art lab analysis, imaging interpretation, and AI-assisted diagnostic tools for accurate kidney health assessment.
          - generic [ref=e250]:
            - generic [ref=e251]:
              - img "Personalized Treatment" [ref=e253]
              - heading "Personalized Treatment" [level=4] [ref=e255]
            - paragraph [ref=e256]: Customized treatment plans tailored to your specific condition, medical history, and health goals with ongoing monitoring.
        - generic [ref=e258]:
          - heading "Take Control of Your Kidney Health Today" [level=3] [ref=e259]
          - paragraph [ref=e260]: Schedule a consultation with Dr. Ilango to discuss your kidney health concerns and receive expert guidance on prevention, diagnosis, and treatment.
          - button "Book Your Consultation" [ref=e261]:
            - img
            - text: Book Your Consultation
            - img
      - generic [ref=e265]:
        - generic [ref=e267]:
          - img [ref=e270]
          - generic: 5000+
          - paragraph [ref=e272]: Patients Treated
        - generic [ref=e274]:
          - img [ref=e277]
          - generic: 15+
          - paragraph [ref=e279]: Years Experience
        - generic [ref=e281]:
          - img [ref=e284]
          - generic: 98%
          - paragraph [ref=e287]: Satisfaction Rate
        - generic [ref=e289]:
          - img [ref=e292]
          - generic: 24/7
          - paragraph [ref=e295]: Support Available
      - generic [ref=e298]:
        - generic [ref=e300]: Start Your Journey Today
        - heading "Ready to Transform Your Kidney Care?" [level=2] [ref=e301]
        - paragraph [ref=e302]: Join thousands of patients who trust Dr. Ilango for their nephrology needs. Book your consultation today and take the first step towards better kidney health.
        - generic [ref=e303]:
          - button "Book Now" [ref=e305]:
            - img
            - generic [ref=e306]: Book Now
            - img
          - button "Contact Us" [ref=e308]:
            - img
            - text: Contact Us
      - contentinfo [ref=e309]:
        - generic [ref=e310]:
          - generic [ref=e312]:
            - generic [ref=e313]:
              - generic [ref=e314]:
                - img "NephroConsult Logo" [ref=e316]
                - generic [ref=e317]:
                  - heading "NephroConsult" [level=3] [ref=e318]
                  - paragraph [ref=e319]: International Kidney Care
              - paragraph [ref=e320]: World-class nephrology consultations with Dr. Ilango S. Prakasam. Providing expert kidney care through secure telemedicine worldwide.
              - generic [ref=e321]:
                - generic [ref=e322]:
                  - img [ref=e323]
                  - generic [ref=e325]: HIPAA Compliant
                - generic [ref=e326]:
                  - img [ref=e327]
                  - generic [ref=e329]: 4.9/5 Patient Rating
                - generic [ref=e330]:
                  - img [ref=e331]
                  - generic [ref=e334]: Available Globally
            - generic [ref=e335]:
              - heading "Quick Links" [level=4] [ref=e336]
              - list [ref=e337]:
                - listitem [ref=e338]:
                  - link "Book Consultation" [ref=e339]:
                    - /url: /booking
                    - text: Book Consultation
                - listitem [ref=e341]:
                  - link "About Dr. Ilango" [ref=e342]:
                    - /url: /about
                    - text: About Dr. Ilango
                - listitem [ref=e344]:
                  - link "Patient Dashboard" [ref=e345]:
                    - /url: /patient/dashboard
                    - text: Patient Dashboard
                - listitem [ref=e347]:
                  - link "My Profile" [ref=e348]:
                    - /url: /profile
                    - text: My Profile
                - listitem [ref=e350]:
                  - link "Medical History" [ref=e351]:
                    - /url: /medical-history
                    - text: Medical History
                - listitem [ref=e353]:
                  - link "Prescriptions" [ref=e354]:
                    - /url: /prescriptions
                    - text: Prescriptions
            - generic [ref=e356]:
              - heading "Our Services" [level=4] [ref=e357]
              - list [ref=e358]:
                - listitem [ref=e359] [cursor=pointer]: Video Consultations
                - listitem [ref=e360] [cursor=pointer]: Lab Report Analysis
                - listitem [ref=e361] [cursor=pointer]: Digital Prescriptions
                - listitem [ref=e362] [cursor=pointer]: Follow-up Care
                - listitem [ref=e363] [cursor=pointer]: Urgent Consultations
                - listitem [ref=e364] [cursor=pointer]: Health Monitoring
              - generic [ref=e365]:
                - heading "Emergency Support" [level=5] [ref=e366]
                - paragraph [ref=e367]: For medical emergencies, contact your local emergency services immediately.
            - generic [ref=e368]:
              - heading "Contact Information" [level=4] [ref=e369]
              - generic [ref=e370]:
                - generic [ref=e371]:
                  - img [ref=e372]
                  - generic [ref=e375]:
                    - paragraph [ref=e376]: Email
                    - paragraph [ref=e377]: suyambu54321@gmail.com
                    - paragraph [ref=e378]: Response within 24 hours
                - generic [ref=e379]:
                  - img [ref=e380]
                  - generic [ref=e383]:
                    - paragraph [ref=e384]: Consultation Hours
                    - paragraph [ref=e385]: 24/7 Available
                    - paragraph [ref=e386]: Multiple timezone support
              - generic [ref=e387]:
                - heading "Follow Us" [level=5] [ref=e388]
                - generic [ref=e389]:
                  - link "Facebook" [ref=e390]:
                    - /url: "#"
                    - img [ref=e391]
                  - link "Twitter" [ref=e393]:
                    - /url: "#"
                    - img [ref=e394]
                  - link "Instagram" [ref=e396]:
                    - /url: https://www.instagram.com/nephroconsult?igsh=MWVwa3Nhc2Y4MnplNA%3D%3D&utm_source=qr
                    - img [ref=e397]
                  - link "LinkedIn" [ref=e400]:
                    - /url: https://www.linkedin.com/in/llango-suyamprakasam-65609624
                    - img [ref=e401]
          - generic [ref=e406]:
            - generic [ref=e407]:
              - paragraph [ref=e408]: © 2024 NephroConsult. All rights reserved.
              - generic [ref=e409]:
                - link "Terms & Conditions" [ref=e410]:
                  - /url: /terms
                - link "Cookies Policy" [ref=e411]:
                  - /url: /cookies
            - generic [ref=e412]:
              - generic [ref=e413]:
                - img [ref=e414]
                - generic [ref=e416]: Made with care for better kidney health
              - button "Scroll to top" [ref=e417]:
                - img [ref=e418]
    - button [ref=e420]:
      - img [ref=e421]
    - region "Notifications alt+T"
  - iframe [ref=e423]:
    
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Admin Dashboard', () => {
  4  |   test('should navigate to admin dashboard', async ({ page }) => {
  5  |     await page.goto('/admin');
  6  |     await expect(page.locator('text=Admin')).toBeVisible();
  7  |   });
  8  | 
  9  |   test('should display appointments list', async ({ page }) => {
  10 |     await page.goto('/admin');
  11 |     await expect(page.locator('text=Appointments')).toBeVisible();
  12 |   });
  13 | 
  14 |   test('should have navigation tabs', async ({ page }) => {
  15 |     await page.goto('/admin');
  16 |     await expect(page.locator('text=Upcoming')).toBeVisible();
  17 |     await expect(page.locator('text=Completed')).toBeVisible();
  18 |   });
  19 | 
  20 |   test('should show consultation details', async ({ page }) => {
  21 |     await page.goto('/admin');
  22 |     // Should have consultation cards
> 23 |     await expect(page.locator('text=Patient')).toBeVisible();
     |                                                ^ Error: expect(locator).toBeVisible() failed
  24 |   });
  25 | });
  26 | 
```