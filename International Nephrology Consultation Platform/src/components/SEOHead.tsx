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
  title = 'NephroConsult - International Kidney Care & Nephrology Consultation Platform',
  description = 'Get expert nephrology consultations from Dr. Rohit Kumar, MBBS, MD, DM Nephrology. Book online appointments for kidney disease treatment, dialysis guidance, and comprehensive renal care services worldwide.',
  keywords = 'nephrology consultation, kidney specialist, online kidney doctor, dialysis treatment, chronic kidney disease, CKD treatment, renal care, Dr Rohit Kumar, international kidney consultation, nephrology expert, kidney disease management, online nephrology appointment',
  canonical = 'https://www.nephroconultation.com',
  ogImage = '/og-image.png',
  ogType = 'website',
  author = 'Dr. Rohit Kumar',
  schema = null
}) => {
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "NephroConsult",
    "description": description,
    "url": canonical,
    "logo": "https://www.nephroconultation.com/logo.png",
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
      "name": "Dr. Rohit Kumar",
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
        "name": "Kidney Disease Consultation",
        "procedureType": "Consultation"
      },
      {
        "@type": "MedicalProcedure",
        "name": "Dialysis Guidance",
        "procedureType": "Treatment Planning"
      },
      {
        "@type": "MedicalProcedure",
        "name": "Kidney Transplant Counseling",
        "procedureType": "Consultation"
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
