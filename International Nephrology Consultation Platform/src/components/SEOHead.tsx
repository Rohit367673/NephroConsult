import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  author?: string;
  schema?: any;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'NephroConsult - Expert Kidney Specialist | Online Nephrology Consultation',
  description = 'Get expert nephrology consultations from Dr. Ilango S. Prakasam (MBBS, MD, DM Nephrology). Specialized treatment for chronic kidney disease, dialysis planning, kidney transplant counseling, acute renal failure, and comprehensive kidney care. Book secure online consultations with experienced nephrologist.',
  keywords = 'nephrology consultation online, kidney specialist doctor, chronic kidney disease treatment, CKD management, dialysis planning, kidney transplant counseling, acute kidney injury, renal failure treatment, kidney disease symptoms, nephrology expert India, online kidney doctor consultation, kidney health checkup, proteinuria treatment, hypertension kidney, diabetic nephropathy, polycystic kidney disease, glomerulonephritis treatment, nephrotic syndrome, kidney stones treatment, electrolyte imbalance, kidney biopsy consultation, hemodialysis guidance, peritoneal dialysis, kidney function tests, creatinine levels, blood urea nitrogen, GFR calculation, kidney disease stages, renal diet consultation, Dr Ilango S Prakasam nephrologist, international kidney care, telemedicine nephrology, virtual kidney consultation, kidney second opinion, renal replacement therapy, kidney failure management, uremia treatment, fluid retention kidney',
  canonical = 'https://www.nephroconsultation.com',
  ogImage = '/og-image.png',
  ogType = 'website',
  author = 'Dr. Ilango S. Prakasam',
  schema = null
}) => {
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "NephroConsult",
    "description": description,
    "url": canonical,
    "logo": "https://www.nephroconsultation.com/logo.svg",
    "image": ogImage,
    "priceRange": "$$",
    "telephone": "+91-XXXXXXXXXX",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    },
    "medicalSpecialty": [
      {
        "@type": "MedicalSpecialty",
        "name": "Nephrology",
        "url": "https://schema.org/Nephrology"
      }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Nephrology Consultation Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Initial Consultation",
            "description": "Comprehensive kidney health assessment and treatment planning"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Follow-up Consultation",
            "description": "Ongoing care and monitoring for kidney disease patients"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Emergency Consultation",
            "description": "Urgent nephrology care for critical cases"
          }
        }
      ]
    },
    "employee": {
      "@type": "Person",
      "name": "Dr. Ilango S. Prakasam",
      "jobTitle": "Consultant Nephrologist",
      "description": "MBBS, MD (Medicine), DM (Nephrology)",
      "alumniOf": {
        "@type": "EducationalOrganization",
        "name": "Medical Institution"
      },
      "memberOf": {
        "@type": "Organization",
        "name": "Indian Society of Nephrology"
      }
    },
    "availableService": [
      {
        "@type": "MedicalProcedure",
        "name": "Chronic Kidney Disease Management",
        "procedureType": "Treatment Planning",
        "description": "Comprehensive CKD staging, treatment planning, and progression monitoring"
      },
      {
        "@type": "MedicalProcedure", 
        "name": "Dialysis Planning and Guidance",
        "procedureType": "Treatment Planning",
        "description": "Hemodialysis and peritoneal dialysis preparation, access planning, and ongoing management"
      },
      {
        "@type": "MedicalProcedure",
        "name": "Kidney Transplant Counseling",
        "procedureType": "Consultation",
        "description": "Pre-transplant evaluation, donor matching guidance, and post-transplant care planning"
      },
      {
        "@type": "MedicalProcedure",
        "name": "Acute Kidney Injury Treatment",
        "procedureType": "Emergency Care",
        "description": "Rapid assessment and treatment of sudden kidney function decline"
      },
      {
        "@type": "MedicalProcedure",
        "name": "Diabetic Nephropathy Management",
        "procedureType": "Specialized Care",
        "description": "Treatment of diabetes-related kidney complications and progression prevention"
      },
      {
        "@type": "MedicalProcedure",
        "name": "Hypertensive Nephrosclerosis Treatment",
        "procedureType": "Specialized Care", 
        "description": "Management of high blood pressure-related kidney damage"
      },
      {
        "@type": "MedicalProcedure",
        "name": "Glomerulonephritis Treatment",
        "procedureType": "Specialized Care",
        "description": "Treatment of kidney inflammation and immune-mediated kidney diseases"
      },
      {
        "@type": "MedicalProcedure",
        "name": "Kidney Stone Management",
        "procedureType": "Treatment Planning",
        "description": "Prevention, treatment, and dietary counseling for kidney stones"
      },
      {
        "@type": "MedicalProcedure",
        "name": "Electrolyte Disorder Management", 
        "procedureType": "Treatment Planning",
        "description": "Treatment of sodium, potassium, calcium, and phosphorus imbalances"
      },
      {
        "@type": "MedicalProcedure",
        "name": "Kidney Function Assessment",
        "procedureType": "Diagnostic",
        "description": "GFR calculation, creatinine analysis, and comprehensive kidney function evaluation"
      }
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "250",
      "bestRating": "5"
    }
  };

  const finalSchema = schema || defaultSchema;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="NephroConsult" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonical} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />

      {/* Additional SEO Tags */}
      <meta name="theme-color" content="#0ea5e9" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="NephroConsult" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalSchema)}
      </script>
    </Helmet>
  );
};

export default SEOHead;
